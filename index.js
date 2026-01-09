/*
 Give credits to Kevin dev
 Contact me at 256742932677
 Base creator and pterodactyl panels seller.
 
*/

process.on("uncaughtException", (err) => {
    console.error("Caught exception:", err);
});

console.clear();
console.log('Starting...');

require('./settings');

const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    Browsers,
    jidDecode,
    delay,
    getContentType,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    downloadContentFromMessage
} = require("@whiskeysockets/baileys");

const pino = require('pino');
const chalk = require('chalk');
const readline = require("readline");
const fs = require('fs');
const FileType = require('file-type');
const path = require('path');
const timezones = global.timezones || "Africa/Kampala";
const moment = require('moment-timezone');

const {
    Boom 
} = require('@hapi/boom');

const {
    smsg,
    formatSize, 
    isUrl, 
    generateMessageTag,
    getBuffer,
    getSizeMedia, 
    runtime, 
    fetchJson, 
    sleep 
} = require('./start/lib/myfunction');

const PluginManager = require('./start/lib/PluginManager');
const { handleStatusUpdate } = require('./start/kevin');
const usePairingCode = true;

const question = (text) => {
    const rl = readline.createInterface({ 
        input: process.stdin, output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question(text, (ans) => {
            rl.close();
            resolve(ans);
        });
    });
}

const { makeInMemoryStore } = require("./start/lib/store/");
const store = makeInMemoryStore({
    logger: pino().child({
        level: 'silent',
        stream: 'store'
    })
});

async function loadAllPlugins() {
    try {
        const PluginManager = require('./start/lib/PluginManager');
        const pluginManager = new PluginManager();
        const pluginsDir = path.join(__dirname, 'KelvinPlugins');
        
        if (!fs.existsSync(pluginsDir)) {
            fs.mkdirSync(pluginsDir, { recursive: true });
            console.log(chalk.yellow(`📁 Created plugins directory: ${pluginsDir}`));
        }
        
        const count = pluginManager.loadPlugins(pluginsDir);
        console.log(chalk.green(`✅ Loaded ${count} plugins successfully!`));
        global.pluginManager = pluginManager;
        return count;
    } catch (error) {
        console.error(chalk.red(`❌ Error loading plugins: ${error.message}`));
        return 0;
    }
}

async function clientstart() {
await loadAllPlugins();

    const {
        state,
        saveCreds 
    } = await useMultiFileAuthState('./session');
    
    const kelvin = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: !usePairingCode,
        auth: state,
        browser: Browsers.ubuntu('Edge')
    });

    if (usePairingCode && !kelvin.authState.creds.registered) {
        try {
            const phoneNumber = await question(chalk.greenBright(`Thanks for choosing Kelvin Tech Base. Please provide your number start with 256xxx:\n`));
            
            let code;
            if (typeof global !== 'undefined' && global.pairingCode) {
                try {
                    code = await kelvin.requestPairingCode(phoneNumber.trim(), `${global.pairingCode}`);
                } catch (err) {
                    code = await kelvin.requestPairingCode(phoneNumber.trim());
                }
            } else {
                code = await kelvin.requestPairingCode(phoneNumber.trim());
            }
            console.log(`your pairing code: ${code}`);
        } catch (e) {
            console.error("Failed to request pairing code:", e);
        }
    }

    store.bind(kelvin.ev);
   
    kelvin.ev.on('messages.upsert', async chatUpdate => {
   try {
     let mek = chatUpdate.messages[0];
     if (!mek.message) return;
     mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;
     
     // Handle status updates
     if (mek.key && mek.key.remoteJid === 'status@broadcast') {
         await handleStatusUpdate(kelvin, mek);
         return; // Don't process status as regular messages
     }
     
     // Continue with regular message processing
     // if (!kelvin.public && !mek.key.fromMe && chatUpdate.type === 'notify') return;
     
     let m = smsg(kelvin, mek, store);
     
     // Log ALL messages to console for debugging
     const senderName = mek.pushName || "Unknown";
     const senderNumber = mek.key.participant ? mek.key.participant.split('@')[0] : mek.key.remoteJid.split('@')[0];
     const isGroup = mek.key.remoteJid.endsWith('@g.us');
     
     // use system.js to handle plugins 
     require("./system")(kelvin, m, chatUpdate, store);
     
   } catch (err) {
     console.error(err);		
   }
});

    kelvin.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return decode.user && decode.server && decode.user + '@' + decode.server || jid;
        } else return jid;
    };

    kelvin.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = kelvin.decodeJid(contact.id);
            if (store && store.contacts) store.contacts[id] = { id, name: contact.notify };
        }
    });

    kelvin.public = global.status || true; // Ensure it's always true if not set

    kelvin.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            console.log(lastDisconnect.error);
            if (lastDisconnect.error == 'Error: Stream Errored (unknown)') {
                process.exit();
            } else if (reason === DisconnectReason.badSession) {
                console.log(`Bad Session File, Please Delete Session and Scan Again`);
                process.exit();
            } else if (reason === DisconnectReason.connectionClosed) {
                console.log('Connection closed, reconnecting...');
                process.exit();
            } else if (reason === DisconnectReason.connectionLost) {
                console.log('Connection lost, trying to reconnect');
                process.exit();
            } else if (reason === DisconnectReason.connectionReplaced) {
                console.log('Connection Replaced, Another New Session Opened, Please Close Current Session First');
                kelvin.logout();
            } else if (reason === DisconnectReason.loggedOut) {
                console.log(`Device Logged Out, Please Scan Again And Run.`);
                kelvin.logout();
            } else if (reason === DisconnectReason.restartRequired) {
                console.log('Restart Required, Restarting...');
                await clientstart();
            } else if (reason === DisconnectReason.timedOut) {
                console.log('Connection TimedOut, Reconnecting...');
                clientstart();
            }
        } else if (connection === "connecting") {
            console.log('connecting . . . ');
        } else if (connection === "open") {
            console.log('Bot connected successfully');
            
           
            
        }
    });
    
    kelvin.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
    let quoted = message.msg ? message.msg : message;
    let mime = (message.msg || message).mimetype || '';
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];

    const stream = await downloadContentFromMessage(quoted, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }

    let type = await FileType.fromBuffer(buffer);
    let trueFileName = attachExtension ? (filename + '.' + type.ext) : filename;
    let savePath = path.join(__dirname, 'tmp', trueFileName);

    await fs.writeFileSync(savePath, buffer);
    return savePath;
  };
  kelvin.getFile = async (PATH, returnAsFilename) => {
    let res, filename;
    const data = Buffer.isBuffer(PATH) 
        ? PATH 
        : /^data:.*?\/.*?;base64,/i.test(PATH) 
        ? Buffer.from(PATH.split`, `[1], 'base64') 
        : /^https?:\/\//.test(PATH) 
        ? await (res = await fetch(PATH)).buffer() 
        : fs.existsSync(PATH) 
        ? (filename = PATH, fs.readFileSync(PATH)) 
        : typeof PATH === 'string' 
        ? PATH 
        : Buffer.alloc(0);

    if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer');
    
    const type = await FileType.fromBuffer(data) || { mime: 'application/octet-stream', ext: '.bin' };
    
    if (returnAsFilename && !filename) {
        filename = path.join(__dirname, './tmp/' + new Date() * 1 + '.' + type.ext);
        await fs.promises.writeFile(filename, data);
    }
    
    const deleteFile = async () => {
        if (filename && fs.existsSync(filename)) {
            await fs.promises.unlink(filename).catch(() => {}); 
        }
    };

    setImmediate(deleteFile);
    data.fill(0); 
    
    return { res, filename, ...type, data, deleteFile };
  };
  

    kelvin.sendText = (jid, text, quoted = '', options) => {
	    kelvin.sendMessage(jid, { text: text, ...options }, { quoted });
    }
    
    kelvin.sendFile = async (jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) => {
    let type = await kelvin.getFile(path, true)
    let { res, data: file, filename: pathFile } = type
    if (res && res.status !== 200 || file.length <= 65536) {
      try { throw { json: JSON.parse(file.toString()) } }
      catch (e) { if (e.json) throw e.json }
    }
    let opt = { filename }
    if (quoted) opt.quoted = quoted
    if (!type) options.asDocument = true
    let mtype = '', mimetype = type.mime, convert
    if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) mtype = 'sticker'
    else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) mtype = 'image'
    else if (/video/.test(type.mime)) mtype = 'video'
    else if (/audio/.test(type.mime)) (
      convert = await (ptt ? toPTT : toAudio)(file, type.ext),
      file = convert.data,
      pathFile = convert.filename,
      mtype = 'audio',
      mimetype = 'audio/ogg; codecs=opus'
    )
    else mtype = 'document'
    if (options.asDocument) mtype = 'document'

    let message = {
      ...options,
      caption,
      ptt,
      [mtype]: { url: pathFile },
      mimetype
    }
    let m
    try {
      m = await kelvin.sendMessage(jid, message, { ...opt, ...options })
    } catch (e) {
      console.error(e)
      m = null
    } finally {
      if (!m) m = await kelvin.sendMessage(jid, { ...message, [mtype]: file }, { ...opt, ...options })
      return m
    }
  }
  
   kelvin.getName = async (id, withoutContact = false) => {
    // FIX: Ensure id is a string before checking
    if (!id || typeof id !== 'string') {
        return id || 'Unknown';
    }
    
    let v;
    if (id.endsWith('@g.us')) {
        // ... (your group metadata logic)
    } else {
        // V7 CHANGE: Contacts may have 'id', 'lid', or 'phoneNumber' fields
        v = store.contacts[id] || {};
        return v.name || v.notify || v.verifiedName || id.split('@')[0];
    }
    return id.split('@')[0]; // Fallback
};
  
  kelvin.sendStatusMention = async (content, jids = []) => {
    try {
        let users = [];
        
        // Get users from all provided jids
        for (let id of jids) {
            try {
                let userId = await kelvin.groupMetadata(id);
                const participants = userId.participants || [];
                users = [...users, ...participants.map(u => conn.decodeJid(u.id))];
            } catch (error) {
                console.error('Error getting group metadata for', id, error);
            }
        };

        // Filter out duplicates and undefined
        users = [...new Set(users.filter(u => u))];

        let message = await kelvin.sendMessage(
            "status@broadcast", 
            content, 
            {
                backgroundColor: "#000000",
                font: Math.floor(Math.random() * 9),
                statusJidList: users,
                additionalNodes: [
                    {
                        tag: "meta",
                        attrs: {},
                        content: [
                            {
                                tag: "mentioned_users",
                                attrs: {},
                                content: jids.map((jid) => ({
                                    tag: "to",
                                    attrs: { jid },
                                    content: undefined,
                                })),
                            },
                        ],
                    },
                ],
            }
        );

        // Broadcast to all groups
        for (let id of jids) {
            try {
                await kelvin.relayMessage(id, {
                    groupStatusMentionMessage: {
                        message: {
                            protocolMessage: {
                                key: message.key,
                                type: 25,
                            },
                        },
                    },
                }, {});
                await delay(2500); // Use your existing delay function
            } catch (error) {
                console.error('Error relaying message to', id, error);
            }
        }
        
        return message;
    } catch (error) {
        console.error('Error in sendStatusMention:', error);
        throw error;
    }
};
  
  kelvin.copyNForward = async (jid, message, forceForward = false, options = {}) => {
    let vtype;
    if (options.readViewOnce) {
      message.message = message.message?.ephemeralMessage?.message || message.message;
      vtype = Object.keys(message.message.viewOnceMessage.message)[0];
      delete message.message.viewOnceMessage.message[vtype].viewOnce;
      message.message = { ...message.message.viewOnceMessage.message };
    }

    let mtype = Object.keys(message.message)[0];
    let content = await generateForwardMessageContent(message, forceForward);
    let ctype = Object.keys(content)[0];
    let context = {};

    if (mtype != "conversation") {
      context = message.message[mtype].contextInfo;
    }

    content[ctype].contextInfo = {
      ...context,
      ...content[ctype].contextInfo,
    };

    const waMessage = await generateWAMessageFromContent(
      jid,
      content,
      options
        ? {
            ...content[ctype],
            ...options,
            ...(options.contextInfo
              ? {
                  contextInfo: {
                    ...content[ctype].contextInfo,
                    ...options.contextInfo,
                  },
                }
              : {}),
          }
        : {}
    );

    await kelvin.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id });
    return waMessage;
  };
  
  function createTmpFolder() {
    const folderName = "tmp";
    const folderPath = path.join(__dirname, folderName);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
  }
 
  createTmpFolder();

  setInterval(() => {
    let directoryPath = path.join();
    fs.readdir(directoryPath, async function (err, files) {
      var filteredArray = await files.filter(item =>
        item.endsWith("gif") ||
        item.endsWith("png") || 
        item.endsWith("mp3") ||
        item.endsWith("mp4") || 
        item.endsWith("opus") || 
        item.endsWith("jpg") ||
        item.endsWith("webp") ||
        item.endsWith("webm") ||
        item.endsWith("zip") 
      )
      if(filteredArray.length > 0){
        let teks =`Detected ${filteredArray.length} junk files,\nJunk files have been deleted🚮`
        kelvin.sendMessage(kelvin.user.id, {text : teks })
        setInterval(() => {
          if(filteredArray.length == 0) return console.log("Junk files cleared")
          filteredArray.forEach(function (file) {
            let sampah = fs.existsSync(file)
            if(sampah) fs.unlinkSync(file)
          })
        }, 15_000)
      }
    });
  }, 30_000)
  
 
kelvin.ev.on('group-participants.update', async (anu) => {
    try {
        const botNumber = kelvin.decodeJid(kelvin.user.id);
        const groupId = anu.id;
        
        // Get GROUP-SPECIFIC welcome setting
        const welcomeEnabled = global.settingsManager?.isWelcomeEnabled(botNumber, groupId);
        
        // Get BOT-LEVEL adminevent setting
        const admineventEnabled = global.settingsManager?.getSetting(botNumber, 'adminevent', false);
        
        // FIX: Ensure participants is an array
        const participants = Array.isArray(anu.participants) ? anu.participants : [anu.participants];
        
        // Process welcome/goodbye messages (GROUP-SPECIFIC)
        if (welcomeEnabled === true) {
            console.log(chalk.green(`[WELCOME] Sending message for group ${groupId}`));
            
            try {
                const groupMetadata = await kelvin.groupMetadata(groupId);
                
                for (const participant of participants) {
                    if (!participant || participant === botNumber) continue;
                    
                    // FIX: Get user ID safely
                    let userId = 'User';
                    if (typeof participant === 'string') {
                        userId = participant.split('@')[0] || 'User';
                    } else {
                        continue; // Skip if not a string
                    }
                    
                    // FIX: Get name safely
                    let name = 'User';
                    try {
                        name = await kelvin.getName(participant) || userId;
                    } catch {
                        name = userId;
                    }
                    
                    if (anu.action === 'add') {
                        const memberCount = groupMetadata.participants.length;
                        
                        // FIX: Create a SIMPLE text message first (no complex formatting)
                        const welcomeText = `*${global.botname || 'Bot'} welcome* @${userId}\n\n` +
                                           `*Group:* ${groupMetadata.subject}\n` +
                                           `*You're member #${memberCount}*\n` +
                                           `*Joined:* ${moment().tz(global.timezones || "Africa/Kampala").format('HH:mm:ss DD/MM/YYYY')}\n\n` +
                                           `Have fun! 🎉\n\n` +
                                           `> ${global.wm || 'Powered by Kelvin Tech'}`;
                        
                        // FIX: Send message with simpler structure
                        await kelvin.sendMessage(groupId, {
                            text: welcomeText
                        });
                        
                        console.log(chalk.green(`✅ Welcome sent for ${name}`));
                        
                    } else if (anu.action === 'remove') {
                        const memberCount = groupMetadata.participants.length;
                        
                        // FIX: Create a SIMPLE goodbye message
                        const goodbyeText = `*👋 Goodbye* @${userId}\n` +
                                          `*Left:* ${moment().tz(global.timezones || "Africa/Kampala").format('HH:mm:ss DD/MM/YYYY')}\n` +
                                          `*Remaining:* ${memberCount} members\n\n` +
                                          `> ${global.wm || 'Powered by Kelvin Tech'}`;
                        
                        await kelvin.sendMessage(groupId, {
                            text: goodbyeText
                        });
                        
                        console.log(chalk.green(`✅ Goodbye sent for ${name}`));
                    }
                }
            } catch (err) {
                console.error(chalk.red('Welcome error:'), err);
            }
        }
        
        
        // Process admin events (BOT-LEVEL setting)
        if (admineventEnabled === true) {
            console.log(chalk.green(`[ADMIN EVENT] Processing for ${groupId}`));
            
            if (participants.includes(botNumber)) return;
            
            try {
                let metadata = await kelvin.groupMetadata(anu.id);
                
                for (let num of participants) {
                    let check = anu.author !== num && anu.author && anu.author.length > 1;
                    let tag = check ? [anu.author, num] : [num];
                    
                    if (anu.action == "promote") {
                        let promotedUsers = [];
                        for (let participant of participants) {
                            let userId = 'User';
                            if (typeof participant === 'string') {
                                userId = participant.split('@')[0] || 'User';
                            }
                            promotedUsers.push(`@${userId}`);
                        }
                        
                        let adminUserId = 'Unknown';
                        if (anu.author && typeof anu.author === 'string') {
                            adminUserId = anu.author.split('@')[0] || 'Unknown';
                        }
                        
                        const promotionMessage = `*『 GROUP PROMOTION 』*\n\n` +
                            `👤 *Promoted User${participants.length > 1 ? 's' : ''}:*\n` +
                            `${promotedUsers.join('\n')}\n\n` +
                            `👑 *Promoted By:* @${adminUserId}\n\n` +
                            `📅 *Date:* ${moment().tz(global.timezones || "Africa/Kampala").format('DD/MM/YYYY HH:mm:ss')}`;
                        
                        await kelvin.sendMessage(anu.id, {
                            text: promotionMessage,
                            mentions: tag
                        });
                        console.log(chalk.green(`✅ Promotion message sent in ${metadata.subject}`));
                    }
                    
                    if (anu.action == "demote") {
                        let demotedUsers = [];
                        for (let participant of participants) {
                            let userId = 'User';
                            if (typeof participant === 'string') {
                                userId = participant.split('@')[0] || 'User';
                            }
                            demotedUsers.push(`@${userId}`);
                        }
                        
                        let adminUserId = 'Unknown';
                        if (anu.author && typeof anu.author === 'string') {
                            adminUserId = anu.author.split('@')[0] || 'Unknown';
                        }
                        
                        const demotionMessage = `*『 GROUP DEMOTION 』*\n\n` +
                            `👤 *Demoted User${participants.length > 1 ? 's' : ''}:*\n` +
                            `${demotedUsers.join('\n')}\n\n` +
                            `👑 *Demoted By:* @${adminUserId}\n\n` +
                            `📅 *Date:* ${moment().tz(global.timezones || "Africa/Kampala").format('DD/MM/YYYY HH:mm:ss')}`;
                        
                        await kelvin.sendMessage(anu.id, {
                            text: demotionMessage,
                            mentions: tag
                        });
                        console.log(chalk.green(`✅ Demotion message sent in ${metadata.subject}`));
                    }
                }
            } catch (err) {
                console.log('Error in admin event feature:', err);
            }
        }
        
    } catch (error) {
        console.error('Error in group-participants.update:', error);
    }
});
        
kelvin.ev.on('call', async (callData) => {
    try {
        const botNumber = await kelvin.decodeJid(kelvin.user.id);
        
         const anticallSetting = global.settingsManager?.getSetting(botNumber, 'anticall', 'off');
        
        
        // Check if anticall is enabled
        if (!anticallSetting || anticallSetting === 'off') {
            console.log(chalk.gray('[ANTICALL] Disabled'));
            return;
        }
        
        for (let call of callData) {
            const from = call.from;
            const callId = call.id;
            
            // Check if caller is owner (allow calls from owner)
            const ownerNumbers = global.owner || [];
            const isOwner = ownerNumbers.some(num => from.includes(num.replace('+', '').replace(/[^0-9]/g, '')));
            
            if (isOwner) {
                console.log(chalk.green(`[ANTICALL] Allowing call from owner: ${from}`));
                continue;
            }
            
            // Safe check for recentCallers with initialization fallback
            try {
                const now = Date.now();
                const lastWarn = global.recentCallers?.get(from) || 0;
                const COOLDOWN = 30 * 1000; // 30 seconds cooldown per caller
                
                if (now - lastWarn < COOLDOWN) {
                    console.log(chalk.yellow(`[ANTICALL] Suppressing repeated warning to ${from}`));
                    // Still attempt to reject/block silently
                    try {
                        if (typeof kelvin.rejectCall === 'function') {
                            await kelvin.rejectCall(callId, from);
                        }
                    } catch (e) {}
                    continue;
                }
                
                if (!global.recentCallers) global.recentCallers = new Map();
                global.recentCallers.set(from, now);
                
                // Auto cleanup after cooldown
                setTimeout(() => {
                    if (global.recentCallers?.has(from)) {
                        global.recentCallers.delete(from);
                    }
                }, COOLDOWN);
                
            } catch (e) {
                console.error(chalk.red('[ANTICALL] recentCallers check failed:'), e);
                if (!global.recentCallers) global.recentCallers = new Map();
            }
            
            console.log(chalk.yellow(`[ANTICALL] ${anticallSetting} call from: ${from}`));
            
            // Send message to the caller's chat
            try {
                const callerName = await kelvin.getName(from) || from.split('@')[0];
                let warningMessage = '';
                
                if (anticallSetting === 'block') {
                    warningMessage = `🚫 *CALL BLOCKED*\n\n` +
                        `*Caller:* @${from.split('@')[0]}\n` +
                        `*Time:* ${moment().tz(timezones).format('HH:mm:ss')}\n` +
                        `*Date:* ${moment().tz(timezones).format('DD/MM/YYYY')}\n\n` +
                        `*🌹 Hi, I am ${global.botname || 'Jexploit'}, a friendly WhatsApp bot from Uganda 🇺🇬, created by Kelvin Tech.*\n\n` +
                        `*My owner cannot receive calls at this moment. Calls are automatically blocked.*\n\n` +
                        `> ${global.wm || ''}`;
                } else {
                    warningMessage = `🚫 *CALL DECLINED*\n\n` +
                        `*Caller:* @${from.split('@')[0]}\n` +
                        `*Time:* ${moment().tz(timezones).format('HH:mm:ss')}\n` +
                        `*Date:* ${moment().tz(timezones).format('DD/MM/YYYY')}\n\n` +
                        `*🌹 Hi, I am ${global.botname || 'Jexploit'}, a friendly WhatsApp bot from Uganda 🇺🇬, created by Kelvin Tech.*\n\n` +
                        `*My owner cannot receive calls at this moment. Please avoid unnecessary calling.*\n\n` +
                        `> ${global.wm || ''}`;
                }

                // Send message to the caller's chat
                await kelvin.sendMessage(from, { 
                    text: warningMessage,
                    mentions: [from]
                });
                
                console.log(chalk.green(`[ANTICALL] Warning message sent to chat: ${from}`));
                
            } catch (msgError) {
                console.error(chalk.red('[ANTICALL] Failed to send message to chat:'), msgError);
            }
            
            // Decline or block the call
            try {
                if (typeof kelvin.rejectCall === 'function') {
                    await kelvin.rejectCall(callId, from);
                    console.log(chalk.green(`[ANTICALL] Successfully ${anticallSetting === 'block' ? 'blocked' : 'declined'} call from: ${from}`));
                    
                    // If mode is block, also block the user
                    if (anticallSetting === 'block') {
                        try {
                            await kelvin.updateBlockStatus(from, 'block');
                            console.log(chalk.red(`[ANTICALL] Blocked user: ${from}`));
                        } catch (blockError) {
                            console.error(chalk.red('[ANTICALL] Failed to block user:'), blockError);
                        }
                    }
                } else {
                    console.log(chalk.yellow('[ANTICALL] kelvin.rejectCall not available'));
                }
            } catch (rejectError) {
                console.error(chalk.red('[ANTICALL] Failed to decline/block call:'), rejectError);
            }
        }
    } catch (error) {
        console.error(chalk.red('[ANTICALL ERROR]'), error);
    }
});

    kelvin.downloadMediaMessage = async (message) => {
          let mime = (message.msg || message).mimetype || ''
          let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
          const stream = await downloadContentFromMessage(message, messageType)
          let buffer = Buffer.from([])
            for await(const chunk of stream) {
		buffer = Buffer.concat([buffer, chunk])}
	    return buffer
    } 
    
    kelvin.ev.on('creds.update', saveCreds);
    return kelvin;
}

clientstart();

let file = require.resolve(__filename);
require('fs').watchFile(file, () => {
    require('fs').unwatchFile(file);
    console.log('\x1b[0;32m' + __filename + ' \x1b[1;32mupdated!\x1b[0m');
    delete require.cache[file];
    require(file);
});