/*Kelvin Tech*/
// savemedia.js - saves View-Once media and Statuses to the owner's DM.
// Delivery works like antidelete: the media is forwarded/re-sent to the target
// chat first, then an info card is sent as a reply quoted on that media.

const moment = require('moment-timezone');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const db = require('../Core/databaseManager');

const readmore = String.fromCharCode(8206).repeat(4001);

const MEDIA_TYPES = {
    imageMessage: 'image',
    videoMessage: 'video',
    audioMessage: 'audio',
    documentMessage: 'document',
    stickerMessage: 'sticker'
};

// Same monospace font antidelete uses for its info cards
function mono(str) {
    return String(str).replace(/[A-Z0-9]/g, (c) => {
        if (c >= 'A' && c <= 'Z') return String.fromCodePoint(0x1D670 + c.charCodeAt(0) - 65);
        return String.fromCodePoint(0x1D7F6 + c.charCodeAt(0) - 48);
    });
}

// Peels ephemeral / view-once wrappers off a message.
// Returns { type, content, viewOnce, message } or null.
function unwrap(message) {
    let msg = message;
    let viewOnce = false;
    for (let i = 0; i < 6 && msg; i++) {
        const key = Object.keys(msg).find((k) => k !== 'messageContextInfo');
        if (!key) return null;
        if (['viewOnceMessage', 'viewOnceMessageV2', 'viewOnceMessageV2Extension'].includes(key)) {
            viewOnce = true;
            msg = msg[key]?.message;
            continue;
        }
        if (['ephemeralMessage', 'documentWithCaptionMessage'].includes(key)) {
            msg = msg[key]?.message;
            continue;
        }
        const content = msg[key];
        if (content && typeof content === 'object' && content.viewOnce) viewOnce = true;
        return { type: key, content, viewOnce, message: msg };
    }
    return null;
}

// Same @lid -> real number resolution the status anti-delete uses
async function resolveJid(kelvin, jid, key = {}) {
    try {
        if (jid && jid.endsWith('@lid')) {
            const rawPn = key.participantPn || key.senderPn;
            if (rawPn) return rawPn.includes('@') ? rawPn : `${rawPn}@s.whatsapp.net`;
            const resolved = await kelvin.getJidFromLid(jid);
            if (resolved) return resolved;
        }
    } catch {}
    return jid;
}

// Reads the message the command/reply is quoting.
function getQuotedInfo(m) {
    const ctx = m.msg?.contextInfo;
    const raw = ctx?.quotedMessage;
    if (!raw) return null;
    const u = unwrap(raw);
    if (!u) return null;
    const isStatus = ctx.remoteJid === 'status@broadcast';
    const poster = ctx.participant || m.chat;
    return {
        ...u,
        isStatus,
        poster,
        // object the forward-style delivery can use (same shape antidelete stores)
        fwdObj: {
            key: {
                remoteJid: ctx.remoteJid || m.chat,
                id: ctx.stanzaId,
                participant: ctx.participant,
                fromMe: false
            },
            message: raw
        }
    };
}

async function downloadBuffer(content, type) {
    const stream = await downloadContentFromMessage(content, MEDIA_TYPES[type]);
    let buf = Buffer.from([]);
    for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
    return buf;
}

async function sendRebuilt(kelvin, target, type, content, buf) {
    const caption = content.caption || '';
    let payload;
    switch (type) {
        case 'imageMessage':
            payload = { image: buf, caption }; break;
        case 'videoMessage':
            payload = { video: buf, caption, gifPlayback: !!content.gifPlayback }; break;
        case 'audioMessage':
            payload = { audio: buf, mimetype: content.mimetype || 'audio/mpeg', ptt: !!content.ptt }; break;
        case 'documentMessage':
            payload = { document: buf, mimetype: content.mimetype, fileName: content.fileName || 'file' }; break;
        case 'stickerMessage':
            payload = { sticker: buf }; break;
        default:
            throw new Error('unsupported media type');
    }
    // NOTE: viewOnce is deliberately not set, so the copy is a normal, re-playable message.
    return kelvin.sendMessage(target, payload);
}

async function chatLabel(kelvin, info, chat) {
    if (info.isStatus) return 'Status Update';
    if (chat && chat.endsWith('@g.us')) {
        try {
            const meta = await kelvin.groupMetadata(chat);
            return meta.subject || 'Group Chat';
        } catch {
            return 'Group Chat';
        }
    }
    return 'Private Chat';
}

/**
 * Core delivery (antidelete style).
 * @param {object} opts
 *  info     - result of unwrap()/getQuotedInfo()  (needs type, content, viewOnce, isStatus, fwdObj?)
 *  poster   - JID of whoever posted/sent it
 *  chat     - chat it came from (for the info card)
 *  target   - chat to deliver to (default: the bot's own DM)
 *  savedBy  - JID shown as "saved by" (optional)
 */
async function deliver(kelvin, { info, poster, chat, target, savedBy }) {
    const botJid = kelvin.decodeJid(kelvin.user.id);
    target = target || botJid;
    poster = await resolveJid(kelvin, poster, info.fwdObj?.key);

    const kind = info.isStatus ? 'STATUS' : info.viewOnce ? 'VIEW-ONCE' : 'MEDIA';
    const now = moment().tz(global.timezones || 'Africa/Kampala');
    const chatName = await chatLabel(kelvin, info, chat);

    const lines = [
        `📥 *${mono(kind + ' SAVED!')}* 📥`,
        readmore,
        `• ${mono('CHAT')}: ${chatName}`,
        `• ${mono('SENT BY')}: @${String(poster).split('@')[0]}`,
        `• ${mono('TIME')}: ${now.locale('en').format('HH:mm z')}`,
        `• ${mono('DATE')}: ${now.format('DD/MM/YYYY')}`
    ];
    const mentions = [poster];
    if (savedBy) {
        lines.push(`• ${mono('SAVED BY')}: @${String(savedBy).split('@')[0]}`);
        mentions.push(savedBy);
    }
    const caption = info.content?.caption;
    if (caption) lines.push('', `• ${mono('CAPTION')}: ${caption}`);

    // ---- text-only status / message ----
    if (!MEDIA_TYPES[info.type]) {
        const text = info.type === 'conversation' ? info.content : info.content?.text;
        if (!text) return { ok: false, reason: 'unsupported' };
        await kelvin.sendMessage(target, {
            text: `${lines.join('\n')}\n\n• ${mono(kind)}: ${text}`,
            mentions
        });
        return { ok: true };
    }

    // ---- media ----
    let sent = null;

    // Statuses (not view-once): forward exactly like antidelete does
    if (info.isStatus && !info.viewOnce && info.fwdObj) {
        try {
            sent = await kelvin.sendMessage(
                target,
                { forward: info.fwdObj, contextInfo: { isForwarded: false } },
                { quoted: info.fwdObj }
            );
        } catch (e) {
            console.error('[savemedia] forward failed, falling back to download:', e.message);
            sent = null;
        }
    }

    // View-once (forwarding would keep the view-once flag) and any forward failure:
    // download and re-send as normal media.
    if (!sent) {
        try {
            const buf = await downloadBuffer(info.content, info.type);
            sent = await sendRebuilt(kelvin, target, info.type, info.content, buf);
        } catch (e) {
            console.error('[savemedia] media recovery failed:', e.message);
            await kelvin.sendMessage(target, {
                text: `${lines.join('\n')}\n\n• ${mono(kind)}: [Media could not be recovered - it may have expired]`,
                mentions
            });
            return { ok: false, reason: 'download' };
        }
    }

    // Info card quoted on the saved media (antidelete layout). The caption is already
    // part of the media, so keep the card short for captioned media.
    await kelvin.sendMessage(
        target,
        { text: lines.join('\n'), mentions },
        { quoted: sent }
    );
    return { ok: true };
}

/**
 * Save whatever the command/reply is quoting.
 * opts.target: JID to deliver to (default: bot DM)
 * opts.only:   'viewonce' | 'status' | undefined  (restrict what is accepted)
 */
async function saveQuoted(kelvin, m, opts = {}) {
    const info = getQuotedInfo(m);
    if (!info) return { ok: false, reason: 'noquote' };
    if (opts.only === 'viewonce' && !info.viewOnce) return { ok: false, reason: 'notviewonce' };
    if (opts.only === 'status' && !info.isStatus) return { ok: false, reason: 'notstatus' };
    return deliver(kelvin, {
        info,
        poster: info.poster,
        chat: m.chat,
        target: opts.target,
        savedBy: opts.savedBy
    });
}

/**
 * Hook for system.js: the owner replies (no command) to a Status or a View-Once
 * and it lands in the bot DM. Toggle with the `replysave` command (default ON).
 */
async function handleReplyForward(kelvin, m, { Access, body, isCmd, botNumber }) {
    try {
        if (!Access || isCmd || !body || !body.trim()) return false;
        if (m.chat === botNumber) return false; // replying inside the saved-items chat
        const info = getQuotedInfo(m);
        if (!info || !(info.isStatus || info.viewOnce)) return false;
        const enabled = await db.get(botNumber, 'replysave', true);
        if (enabled === false || enabled === 'false' || enabled === 'off') return false;

        const res = await deliver(kelvin, { info, poster: info.poster, chat: m.chat, target: botNumber });
        await kelvin.sendMessage(m.chat, { react: { text: res.ok ? '✅' : '❌', key: m.key } });
        return res.ok;
    } catch (e) {
        console.error('[savemedia] reply forward error:', e.message);
        return false;
    }
}

/**
 * Hook for system.js: auto-capture every incoming View-Once into the bot DM.
 * Toggle with the `antiviewonce` command (default OFF).
 */
async function handleAntiViewOnce(kelvin, m, botNumber) {
    try {
        if (!m.message || m.key.fromMe || m.message.protocolMessage) return;
        const info = unwrap(m.message);
        if (!info || !info.viewOnce || !MEDIA_TYPES[info.type]) return;
        const enabled = await db.get(botNumber, 'antiviewonce', false);
        if (!enabled || enabled === 'false' || enabled === 'off') return;

        await deliver(kelvin, {
            info: { ...info, isStatus: false },
            poster: m.sender,
            chat: m.chat,
            target: botNumber
        });
    } catch (e) {
        console.error('[savemedia] antiviewonce error:', e.message);
    }
}

/**
 * Hook for index.js: auto-save every contact status into the bot DM.
 * Toggle with the `autosavestatus` command (default OFF).
 */
async function handleStatusAutoSave(kelvin, mek) {
    try {
        if (!mek?.message || !mek.key || mek.key.fromMe || mek.message.protocolMessage) return;
        const botNumber = kelvin.decodeJid(kelvin.user.id);
        const enabled = await db.get(botNumber, 'autosavestatus', false);
        if (!enabled || enabled === 'false' || enabled === 'off') return;

        const u = unwrap(mek.message);
        if (!u) return;
        const supported = MEDIA_TYPES[u.type] || u.type === 'conversation' || u.type === 'extendedTextMessage';
        if (!supported) return;

        await deliver(kelvin, {
            info: { ...u, isStatus: true, fwdObj: mek },
            poster: mek.key.participant || mek.key.remoteJid,
            chat: 'status@broadcast',
            target: botNumber
        });
    } catch (e) {
        console.error('[savemedia] status autosave error:', e.message);
    }
}

module.exports = {
    unwrap,
    getQuotedInfo,
    deliver,
    saveQuoted,
    handleReplyForward,
    handleAntiViewOnce,
    handleStatusAutoSave
};
