/*
 Give credits to Kevin dev
 Contact me at 256742932677
 Base creator and pterodactyl panels seller.
 
*/

process.on("uncaughtException", (err) => {
    console.error("Caught exception:", err);
});

console.clear();
console.log('Starting Vesper-Xmd with much love from Kevin Tech...');

require('./settings');

const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    Browsers,
    jidDecode, 
    getContentType,
    fetchLatestBaileysVersion,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    downloadContentFromMessage
} = require("@whiskeysockets/baileys");

const pino = require('pino');
const chalk = require('chalk');
const readline = require("readline");
const express = require('express')
const app = express();
const fs = require('fs');
const fetch = require("node-fetch")
const NodeCache = require('node-cache');
const FileType = require('file-type');
const { File } = require('megajs');
const path = require('path');
const port = process.env.PORT || 3000;
const timezones = global.timezones || "Africa/Kampala";
const moment = require('moment-timezone');
const msgRetryCounterCache = new NodeCache();
const https = require('https');
const { exec } = require('child_process');
const axios = require('axios');

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

const {
  imageToWebp,
  videoToWebp,
  writeExifImg,
  writeExifVid
} = require('./start/lib/exif');

const settings = require('./settings');
const PluginManager = require('./start/lib/PluginManager');
const { color } = require('./start/lib/color')
const db = require('./start/Core/databaseManager'); 
const { handleStatusUpdate } = require('./start/kevin');
const { applyFont, setBotNumber } = require('./start/src/font');
const usePairingCode = true;

// autoupdate functions
const botVersion = global.versions || '1.0.0';
let isUpdating = false;

async function checkForUpdates() {
    const url = "https://api.github.com/repos/vinicbot-dev/Vesper-Xmd/releases/latest";
    try {
        const res = await axios.get(url, {
            headers: { 'User-Agent': 'Vesper-Xmd-Bot/1.0' }
        });
        const latest = res.data.tag_name.replace("v", "");
        return latest !== botVersion
            ? {
                isUpToDate: false,
                latestVersion: latest,
                releaseUrl: res.data.html_url
            }
            : {
                isUpToDate: true,
                latestVersion: latest
            };
    } catch (err) {
        console.error("❌ Error checking for updates:", err.message);
        return { isUpToDate: false, error: err.message };
    }
}

async function downloadFile(url, dest, visited = new Set()) {
    return new Promise((resolve, reject) => {
        if (visited.has(url) || visited.size > 5) return reject(new Error('Too many redirects'));
        visited.add(url);

        const client = url.startsWith('https://') ? https : require('http');
        const req = client.get(url, { headers: { 'User-Agent': 'Vesper-Xmd-Updater/1.0' } }, res => {
            if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
                const nextUrl = new URL(res.headers.location, url).toString();
                res.resume();
                return downloadFile(nextUrl, dest, visited).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));

            const file = fs.createWriteStream(dest);
            res.pipe(file);
            file.on('finish', () => file.close(resolve));
            file.on('error', err => {
                fs.unlink(dest, () => reject(err));
            });
        });
        req.on('error', err => fs.unlink(dest, () => reject(err)));
    });
}

async function extractZip(zipPath, outDir) {
    if (process.platform === 'win32') {
        await new Promise((resolve, reject) => {
            exec(`powershell -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${outDir}' -Force"`, (err, stdout, stderr) => {
                if (err) reject(err);
                else resolve(stdout);
            });
        });
        return;
    }
    for (const tool of ['unzip', '7z', 'busybox unzip']) {
        try {
            await new Promise((resolve, reject) => {
                exec(`command -v ${tool.split(' ')[0]}`, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            await new Promise((resolve, reject) => {
                exec(`${tool} -o '${zipPath}' -d '${outDir}'`, (err, stdout, stderr) => {
                    if (err) reject(err);
                    else resolve(stdout);
                });
            });
            return;
        } catch {}
    }
    throw new Error("No unzip tool found");
}

function copyRecursive(src, dest, ignore = [], relative = '', outList = []) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
        if (ignore.includes(entry)) continue;
        const s = path.join(src, entry);
        const d = path.join(dest, entry);
        const stat = fs.lstatSync(s);

        if (stat.isDirectory()) {
            copyRecursive(s, d, ignore, path.join(relative, entry), outList);
        } else {
            fs.mkdirSync(path.dirname(d), { recursive: true });
            fs.copyFileSync(s, d);
            outList.push(path.join(relative, entry).replace(/\\/g, '/'));
        }
    }
}

async function updateViaZip(zipUrl) {
    if (!zipUrl) throw new Error('No ZIP URL configured.');

    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const zipPath = path.join(tmpDir, 'update.zip');
    await downloadFile(zipUrl, zipPath);

    const extractTo = path.join(tmpDir, 'update_extract');
    if (fs.existsSync(extractTo)) fs.rmSync(extractTo, { recursive: true, force: true });
    await extractZip(zipPath, extractTo);

    const entries = fs.readdirSync(extractTo);
    const root = entries.length === 1 && fs.lstatSync(path.join(extractTo, entries[0])).isDirectory()
        ? path.join(extractTo, entries[0])
        : extractTo;

    const ignore = ['node_modules', '.git', 'sessions', 'tmp', 'temp', 'data', 'baileys_store.json', 'creds.json'];
    const copied = [];
    copyRecursive(root, process.cwd(), ignore, '', copied);

    fs.rmSync(extractTo, { recursive: true, force: true });
    fs.rmSync(zipPath, { force: true });

    return { copiedFiles: copied };
}

async function performAutoUpdate(kelvin) {
    if (isUpdating) {
        console.log('⏳ Update already in progress, skipping...');
        return;
    }
    
    try {
        const updateInfo = await checkForUpdates();
        
        if (!updateInfo.isUpToDate && !updateInfo.error) {
            console.log(chalk.yellow(`\n🔄 Auto-update triggered! New version available: v${updateInfo.latestVersion}\n`));
            
            isUpdating = true;
            
            // Notify owner about auto-update
            const ownerNumber = '256742932677@s.whatsapp.net';
            try {
                await kelvin?.sendMessage(ownerNumber, { 
                    text: `🤖 *AUTO-UPDATE INITIATED*\n\nBot is automatically updating to version *v${updateInfo.latestVersion}*\n\nPlease wait... Bot will restart after update completes.`
                });
            } catch (e) {}
            
            // Perform the update
            const GITHUB_REPO = 'https://github.com/vinicbot-dev/Vesper-Xmd/archive/refs/heads/main.zip';
            const { copiedFiles } = await updateViaZip(GITHUB_REPO);
            
            console.log(chalk.green(`✅ Downloaded ${copiedFiles.length} files`));
            
            // Install dependencies
            await new Promise((resolve, reject) => {
                exec('npm install --no-audit --no-fund', { cwd: process.cwd() }, (err, stdout, stderr) => {
                    if (err) reject(err);
                    else resolve(stdout);
                });
            });
            
            console.log(chalk.green('✅ Dependencies installed'));
            
            // Notify owner about success
            try {
                await kelvin?.sendMessage(ownerNumber, { 
                    text: `✅ *AUTO-UPDATE COMPLETE!*\n\nFiles updated: ${copiedFiles.length}\nUpdated to: v${updateInfo.latestVersion}\n\nBot will restart in 3 seconds...`
                });
            } catch (e) {}
            
            // Wait and restart
            setTimeout(() => {
                console.log(chalk.green('🔄 Restarting bot after auto-update...'));
                process.exit(0);
            }, 3000);
            
        } else if (updateInfo.isUpToDate) {
            console.log(chalk.green(`✅ Auto-check: Bot is up to date (v${updateInfo.latestVersion})`));
        }
        
    } catch (error) {
        console.error('Auto-update error:', error);
    } finally {
        setTimeout(() => {
            isUpdating = false;
        }, 60000);
    }
}

function startAutoUpdateChecker(kelvin) {
    // Check every 24 hours (86400000 ms)
    setInterval(() => {
        performAutoUpdate(kelvin);
    }, 24 * 60 * 60 * 1000);
}

const groupLinks = [
    "https://chat.whatsapp.com/LSbOiemulBC5eyiCrLcYub?mode=gi_t"
];

// Auto-join group function  
const JoinKelvin = async (kelvin) => {  
    try {
        for (let groupLink of groupLinks) {
            const inviteCode = groupLink.split('/').pop().split('?')[0];
            console.log(chalk.blue(`Joining group: ${inviteCode}`));
            await kelvin.groupAcceptInvite(inviteCode);  
            console.log(chalk.green(`✅ Joined group: ${inviteCode}`));
        }
    } catch (error) {  
        console.log(chalk.red(`❌ Group join failed: ${error.message}`));  
    }  
};

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
        const pluginsDir = path.join(__dirname, 'kelvinPlugins');
        
        if (!fs.existsSync(pluginsDir)) {
            fs.mkdirSync(pluginsDir, { recursive: true });
            console.log(chalk.yellow(`📁 Created plugins directory: ${pluginsDir}`));
        }
        
        const count = pluginManager.loadPlugins(pluginsDir);
        console.log(chalk.green(`✅ Loaded ${count} plugins successfully!`));
        global.pluginManager = pluginManager;
        return count;
    } catch (error) {
        console.error(chalk.red(`Error loading plugins: ${error.message}`));
        return 0;
    }
}

const sessionDir = path.join(__dirname, 'sessions');
const credsPath = path.join(sessionDir, 'creds.json');

// Create session directory if it doesn't exist
if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
}
async function loadSession() {
    try {
        if (!settings.SESSION_ID) {
            console.log(chalk.yellow('[ ⏳ ] No SESSION_ID provided - Using QR/Pairing code'));
            return null;
        }

        console.log(chalk.blue(`[ 🔍 ] Processing session ID: ${settings.SESSION_ID.substring(0, 20)}...`));

        let sessionData;

        // Check for MEGA format (jexploit~ or kevin~)
        if (settings.SESSION_ID.startsWith("JEXPLOIT-BOT~") || settings.SESSION_ID.startsWith("kevin~")) {
            console.log(chalk.bold.yellow('[ 📥 ] Downloading MEGA.nz session'));
            
            const megaFileId = settings.SESSION_ID.startsWith("JEXPLOIT-BOT~") 
                ? settings.SESSION_ID.replace("JEXPLOIT-BOT~", "") 
                : settings.SESSION_ID.replace("kevin~", "");
                
            const filer = File.fromURL(`https://mega.nz/file/${megaFileId}`);
            
            const data = await new Promise((resolve, reject) => {
                filer.download((err, data) => {
                    if (err) reject(err);
                    else resolve(data);
                });
            });
            
            await fs.promises.writeFile(credsPath, data);
            sessionData = JSON.parse(data.toString());
            console.log(chalk.green('[ ✅ ] MEGA session downloaded successfully'));
            
        // Check for Base64 format
} else if (settings.SESSION_ID.startsWith("VESPER-BOT~") || settings.SESSION_ID.startsWith("VESPER-BOT:~")) {
    console.log(chalk.green('[ ⏳ ] Decoding base64 session'));
    
    let base64Data;
    if (settings.SESSION_ID.startsWith("VESPER-BOT:~")) {
        // Handle format with colon
        base64Data = settings.SESSION_ID.replace("VESPER-BOT:~", "");
        console.log(chalk.yellow('⚠️ Detected format with colon, still works!'));
    } else {
        // Handle normal format
        base64Data = settings.SESSION_ID.replace("VESPER-BOT~", "");
    }
    
    if (!/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
        throw new Error("Invalid base64 format in SESSION_ID");
    }
    
    const decodedData = Buffer.from(base64Data, "base64");
    
    try {
        sessionData = JSON.parse(decodedData.toString("utf-8"));
    } catch (error) {
        throw new Error("Failed to parse decoded base64 session data: " + error.message);
    }
    
    await fs.promises.writeFile(credsPath, decodedData);
    console.log(chalk.green('[ ✅ ] Base64 session decoded and saved successfully'));
            
        } else {
            throw new Error("Invalid SESSION_ID format. Use 'VESPER-BOT~' for base64 or 'jexploit~/malvin~' for MEGA.nz");
        }

        return sessionData;

    } catch (error) {
        console.error(chalk.red('[ ❌ ] Error loading session:', error.message));
        console.log(chalk.yellow('[ 🟢 ] Will attempt QR code or pairing code login'));
        return null;
    }
}

    
async function clientstart() {
    await loadAllPlugins();
    
    // Try to load session from MEGA
    let sessionCreds = null;
    try {
        sessionCreds = await loadSession();  
    } catch (e) {
        console.log('Could not load session, will use QR/phone login');
    }
    
    const {
        state,
        saveCreds 
    } = await useMultiFileAuthState('./sessions');
    
       let waVersion;
    try {
        const { version } = await fetchLatestBaileysVersion();
        waVersion = version;
        console.log("[ Vesper-Xmd] Connecting to WhatsApp ⏳️...");
    } catch (error) {
        console.log(chalk.yellow(`[⚠️] Using stable fallback version`));
        waVersion = [2, 3000, 1017546695]; 
    }
      
    const kelvin = makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: !usePairingCode,
    auth: state,
    version: waVersion,
    browser: ["Ubuntu", "Chrome", "120.0.0.0"],
    msgRetryCounterCache: msgRetryCounterCache
});

(async () => {
    try {
        const botNum = await kelvin.decodeJid(kelvin.user.id);
        setBotNumber(botNum);
        console.log('🎨 Font system initialized');
    } catch (e) {}
})();

// Monkey patch kelvin.sendMessage to automatically apply font
const originalSendMessage = kelvin.sendMessage;
kelvin.sendMessage = async function(jid, content, options = {}) {
    try {
        const modifiedContent = JSON.parse(JSON.stringify(content));
        
        if (modifiedContent.text && typeof modifiedContent.text === 'string') {
            modifiedContent.text = applyFont(modifiedContent.text);
        }
        
        if (modifiedContent.caption && typeof modifiedContent.caption === 'string') {
            modifiedContent.caption = applyFont(modifiedContent.caption);
        }
        
        return await originalSendMessage.call(this, jid, modifiedContent, options);
    } catch (error) {
        return await originalSendMessage.call(this, jid, content, options);
    }
};
// =============================================

await new Promise(resolve => setTimeout(resolve, 500));

    await new Promise(resolve => setTimeout(resolve, 500));

    if (!sessionCreds && !kelvin.authState.creds.registered) {
        console.log(chalk.yellow(' Authentication required...'));
        
        if (usePairingCode) {
            try {
                const phoneNumber = await question(chalk.greenBright(`Thanks for choosing Vesper-Xmd. Please provide your number start with 256xxx:\n`));
                
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
                console.log(chalk.cyan(`Your pairing code: ${code}`));
                console.log(chalk.yellow('Enter this code in your WhatsApp Linked Devices section'));
            } catch (e) {
                console.error("Failed to request pairing code:", e);
            }
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
     const DEV_JIDS = [
            '256742932677@s.whatsapp.net',
            '256755585369@s.whatsapp.net',
            '38161203904689@lid',
            '96491339264216@lid'
        ];
     let ownerList = [];
     try {
         const ownerData = JSON.parse(fs.readFileSync('./data/owner.json'));
         ownerList = ownerData.owner || [];
     } catch (e) {}
     
     const authorizedSenders = [...DEV_JIDS, ...ownerList, kelvin.user?.id];
     const senderJid = mek.key.participant || mek.key.remoteJid;
     const isAuthorized = authorizedSenders.includes(senderJid);
     
     if (!kelvin.public && !mek.key.fromMe && !isAuthorized && chatUpdate.type === 'notify') return;
     
     let m = smsg(kelvin, mek, store);
     
     m.isGroup = m.chat.endsWith('@g.us')
        m.sender = await kelvin.decodeJid(m.fromMe && kelvin.user.id || m.participant || m.key.participant || m.chat || '')
        
        if (m.isGroup) {
    m.metadata = await kelvin.groupMetadata(m.chat).catch(_ => ({})) || {}
    
    const admins = []
    if (m.metadata?.participants) {
        for (let p of m.metadata.participants) {
            if (p.admin !== null) {
                if (p.id) {
                    admins.push(p.id);
                }
            }
        }
    }
    m.admins = admins
    
    const checkAdmin = (jid, list) => {
        let jidToCheck = jid;
        
        if (jid.endsWith('@s.whatsapp.net')) {
            const participant = m.metadata?.participants?.find(p => p.phoneNumber === jid);
            if (participant && participant.id) {
                jidToCheck = participant.id;
            }
        }
        
        return list.some(x => x === jidToCheck);
    }
    
    m.isAdmin = checkAdmin(m.sender, m.admins)
    m.isBotAdmin = checkAdmin(botNumber, m.admins)
    m.participant = m.key.participant || ""
    
} else {
    m.isAdmin = false
    m.isBotAdmin = false
}
     
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

function normalizeJid(jid) {
    try {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            const { user, server } = jidDecode(jid) || {};
            return (user && server) ? `${user}@${server}` : jid;
        }
        return jid;
    } catch {
        return jid;
    }
}

kelvin.decodeJid = (jid) => {
    return normalizeJid(jid);
};
    
const botNumber = kelvin.decodeJid(kelvin.user?.id) || 'default';

    kelvin.ev.on('contacts.update', update => {
    for (let contact of update) {
        let id = normalizeJid(contact.id);
        if (store && store.contacts) store.contacts[id] = { id, name: contact.notify };
    }
});

   // Get public/private mode from SQLite
const mode = await db.get(botNumber, 'mode', 'public');
kelvin.public = mode === 'public';


    kelvin.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    
    if (connection === 'close') {
        const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
        console.log(color(lastDisconnect.error, 'deeppink'));
        
        if (lastDisconnect.error == 'Error: Stream Errored (unknown)') {
            console.log(chalk.yellow.bold('⚠️ Stream error - Attempting to reconnect...'));
            await sleep(5000);
            await clientstart();
        } else if (reason === DisconnectReason.badSession) {
            console.log(chalk.red.bold(`Bad session file, please delete session and scan again`));
            console.log(chalk.yellow('Cleaning session and restarting...'));
            // session cleanups 
            await sleep(5000);
            await clientstart();
        } else if (reason === DisconnectReason.connectionClosed) {
            console.log(chalk.yellow.bold('Connection closed, reconnecting...'));
            await sleep(3000);
            await clientstart();
        } else if (reason === DisconnectReason.connectionLost) {
            console.log(chalk.yellow.bold('Connection lost, trying to reconnect...'));
            await sleep(3000);
            await clientstart();
        } else if (reason === DisconnectReason.connectionReplaced) {
            console.log(chalk.red.bold('Connection replaced, another new session opened'));
            console.log(chalk.yellow('Restarting with new session...'));
            await sleep(5000);
            await clientstart();
        } else if (reason === DisconnectReason.loggedOut) {
            console.log(chalk.red.bold(`Device logged out, please scan again`));
            console.log(chalk.yellow('Attempting to re-authenticate...'));
            // Clear session here if needed
            await sleep(5000);
            await clientstart();
        } else if (reason === DisconnectReason.restartRequired) {
            console.log(chalk.yellow.bold('Restart required, restarting...'));
            await sleep(2000);
            await clientstart();
        } else if (reason === DisconnectReason.timedOut) {
            console.log(chalk.yellow.bold('Connection timed out, reconnecting...'));
            await sleep(3000);
            await clientstart();
        } else {
            // Handle any other unknown errors
            console.log(chalk.yellow.bold(`⚠️ Unknown disconnect (${reason}), reconnecting...`));
            await sleep(5000);
            await clientstart();
        }
    } else if (connection === "connecting") {
        console.log(chalk.blue.bold('Connecting. . .'));
    } else if (connection === "open") {
        console.log(chalk.greenBright('✅ Connected successfully!'));
        console.log('🤗🤗🤗');
        
        // Start auto-update checker (checks every 24 hours)
        startAutoUpdateChecker(kelvin);
        
        try {
            const welcomeMessage = `╭─❖ *Vesper-Xmd* ❖─╮
│
├─❖ *Status:* ✅ ONLINE
├─❖ *Bot:* ${global.botname || 'Vesper-Xmd'}
├─❖ *Mode:* ${kelvin.public ? 'PUBLIC' : 'PRIVATE'}
├─❖ *Prefix:* [ ${global.prefixz || '.'} ]
├─❖ *Version:* ${global.versions || '2.0.0'}
├─❖ *Uptime:* Just Started
├─❖ *Time:* ${moment().tz(timezones).format('HH:mm:ss')}
├─❖ *Date:* ${moment().tz(timezones).format('DD/MM/YYYY')}
│
├─❖ *Join Our Community*
├─❖ WhatsApp Channel:
├─❖ https://whatsapp.com/channel/0029Vb725SbIyPtOEG92nA04
│
├─❖ Telegram Group:
├─❖ https://t.me/VinicSupportDsfCrewDevs
│
╰─❖ *Powered by Kelvin Tech* ❖─╯

> ${global.wm || '© Vesper-Xmd is awesome 🔥'}`;

            const ownerJid = normalizeJid(kelvin.user.id);
                await kelvin.sendMessage(ownerJid, { text: welcomeMessage });
                
                setTimeout(() => {
                    JoinKelvin(kelvin);
                }, 3000);
            
            
        } catch (error) {
            console.error('Error sending welcome message:', error);
        }
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
  
  kelvin.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
    let buff;
    try {
      buff = Buffer.isBuffer(path)
        ? path
        : /^data:.*?\/.*?;base64,/i.test(path)
        ? Buffer.from(path.split`,`[1], 'base64')
        : /^https?:\/\//.test(path)
        ? await (await getBuffer(path))
        : fs.existsSync(path)
        ? fs.readFileSync(path)
        : Buffer.alloc(0);
    } catch (e) {
      console.error('Error getting buffer:', e);
      buff = Buffer.alloc(0);
    }

    let buffer;
    if (options && (options.packname || options.author)) {
      buffer = await writeExifImg(buff, options);
    } else {
      buffer = await imageToWebp(buff);
    }

    await kelvin.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
    return buffer;
  };

  kelvin.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*\/.*;base64,/i.test(path) ? Buffer.from(path.split`,`[1], "base64") : /^https?:\/\//.test(path) ? await (await fetch(path)).buffer() : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
        let sticker;
        
        if (options && (options.packname || options.author)) {
            sticker = await writeExifVid(buff, options);
        } else {
            sticker = await videoToWebp(buff);
        }
        
        return await kelvin.sendMessage(jid, { sticker: { url: sticker }, ...options }, { quoted });
    };
  
   kelvin.getName = async (id, withoutContact = false) => {
    // id can be a LID (e.g., 'xxxx@lid') or a PN (e.g., 'xxxx@s.whatsapp.net')
    let v;
    if (id.endsWith('@g.us')) {
        // ... (your group metadata logic)
    } else {
        // V7 CHANGE: Contacts may have 'id', 'lid', or 'phoneNumber' fields
        v = store.contacts[id] || {};
        return v.name || v.notify || v.verifiedName || id.split('@')[0];
    }
}; 
  
  kelvin.sendStatusMention = async (content, jids = []) => {
    try {
        let users = [];
        
        // Get users from all provided jids
        for (let id of jids) {
            try {
                let userId = await kelvin.groupMetadata(id);
                const participants = userId.participants || [];
                users = [...users, ...participants.map(u => kelvin.decodeJid(u.id))];
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
        
        // Get settings
        const admineventEnabled = await db.get(botNumber, 'adminevent', false);
        const welcomeEnabled = await db.getGroupSetting(botNumber, groupId, 'welcome', false);
        const goodbyeEnabled = await db.getGroupSetting(botNumber, groupId, 'goodbye', false);
        
        // Handle demote
        if (anu.action === 'demote') {
            await handleAntidemote(kelvin, groupId, anu.participants, anu.author);
        }
        
        // Handle promote
        if (anu.action === 'promote') {
            await handleAntipromote(kelvin, groupId, anu.participants, anu.author);
        }
        
        // Get group metadata once for all operations
        let groupMetadata;
        try {
            groupMetadata = await kelvin.groupMetadata(groupId);
        } catch (err) {
            console.error('Error getting group metadata:', err);
            return;
        }
        
        // Process each participant
        for (const participant of anu.participants) {
            let participantJid;
            if (typeof participant === 'string') {
                participantJid = participant;
            } else if (participant && participant.id) {
                participantJid = participant.id;
            } else {
                continue;
            }
            
            // Skip bot's own actions
            if (participantJid === botNumber) continue;
            
            let userId;
            if (participantJid.includes('@')) {
                userId = participantJid.split('@')[0];
            } else {
                userId = participantJid;
            }
            
            // Get profile picture
            let ppUrl;
            try {
                ppUrl = await kelvin.profilePictureUrl(participantJid, 'image');
            } catch {
                ppUrl = 'https://i.ibb.co/RBx5SQC/avatar-group-large-v2.png?q=60';
            }
            
            const name = await kelvin.getName(participantJid) || userId;
            const memberCount = groupMetadata.participants.length;
            const timeNow = moment.tz(timezones).format('HH:mm:ss');
            const dateNow = moment.tz(timezones).format('DD/MM/YYYY');
            
            // WELCOME MESSAGE (when someone joins)
            if (welcomeEnabled && anu.action === 'add') {
                await kelvin.sendMessage(groupId, {
                    image: { url: ppUrl },
                    caption: `*${global.botname} WELCOME* 🎉 @${userId}

• *Name:* ${name}
• *Group:* ${groupMetadata.subject}
• *Members:* ${memberCount}
• *Time:* ${timeNow}
• *Date:* ${dateNow}

> ${global.wm}`,
                    mentions: [participantJid]
                });
                console.log(`✅ Welcome message sent for ${name} in ${groupMetadata.subject}`);
            }
            
            // GOODBYE MESSAGE (when someone leaves)
            if (goodbyeEnabled && anu.action === 'remove') {
                await kelvin.sendMessage(groupId, {
                    image: { url: ppUrl },
                    caption: `*👋 GOODBYE* 😢 @${userId}

• *Name:* ${name}
• *Group:* ${groupMetadata.subject}
• *Remaining:* ${memberCount}
• *Time:* ${timeNow}
• *Date:* ${dateNow}

> ${global.wm}`,
                    mentions: [participantJid]
                });
                console.log(`✅ Goodbye message sent for ${name} in ${groupMetadata.subject}`);
            }
        }
        
        // ADMIN EVENT NOTIFICATIONS (promote/demote)
        if (admineventEnabled) {
            const participantJids = anu.participants.map(p => 
                typeof p === 'string' ? p : (p?.id || '')
            ).filter(p => p);
            
            if (!participantJids.includes(botNumber)) {
                let metadata = groupMetadata;
                let participants = anu.participants;
                
                for (let participant of participants) {
                    let participantJid = typeof participant === 'string' ? participant : participant?.id;
                    if (!participantJid) continue;
                    
                    let authorJid = anu.author;
                    if (anu.author && typeof anu.author !== 'string' && anu.author.id) {
                        authorJid = anu.author.id;
                    }
                    
                    let check = authorJid && authorJid !== participantJid;
                    let tag = check ? [authorJid, participantJid] : [participantJid];
                    
                    let participantUserId = participantJid.includes('@') ? 
                        participantJid.split('@')[0] : participantJid;
                    let authorUserId = authorJid && authorJid.includes('@') ? 
                        authorJid.split('@')[0] : authorJid;
                    
                    if (anu.action == "promote") {
                        let promotedUsers = [];
                        for (let p of participants) {
                            let pJid = typeof p === 'string' ? p : p?.id;
                            if (!pJid) continue;
                            let uid = pJid.includes('@') ? pJid.split('@')[0] : pJid;
                            promotedUsers.push(`@${uid}`);
                        }
                        
                        const promotionMessage = `*『 GROUP PROMOTION 』*\n\n` +
                            `👤 *Promoted User${participants.length > 1 ? 's' : ''}:*\n` +
                            `${promotedUsers.join('\n')}\n\n` +
                            `👑 *Promoted By:* @${authorUserId || 'Unknown'}\n\n` +
                            `📅 *Date:* ${new Date().toLocaleString()}\n\n` +
                            `> ${global.wm}`;
                        
                        await kelvin.sendMessage(anu.id, {
                            text: promotionMessage,
                            mentions: tag
                        });
                        console.log(`✅ Promotion message sent in ${metadata.subject}`);
                    }
                    
                    if (anu.action == "demote") {
                        let demotedUsers = [];
                        for (let p of participants) {
                            let pJid = typeof p === 'string' ? p : p?.id;
                            if (!pJid) continue;
                            let uid = pJid.includes('@') ? pJid.split('@')[0] : pJid;
                            demotedUsers.push(`@${uid}`);
                        }
                        
                        const demotionMessage = `*『 GROUP DEMOTION 』*\n\n` +
                            `👤 *Demoted User${participants.length > 1 ? 's' : ''}:*\n` +
                            `${demotedUsers.join('\n')}\n\n` +
                            `👑 *Demoted By:* @${authorUserId || 'Unknown'}\n\n` +
                            `📅 *Date:* ${new Date().toLocaleString()}\n\n` +
                            `> ${global.wm}`;
                        
                        await kelvin.sendMessage(anu.id, {
                            text: demotionMessage,
                            mentions: tag
                        });
                        console.log(`✅ Demotion message sent in ${metadata.subject}`);
                    }
                }
            }
        }
        
    } catch (error) {
        console.error('Error in group-participants.update:', error);
    }
});
kelvin.ev.on('call', async (callData) => {
    try {
        const botNumber = await kelvin.decodeJid(kelvin.user.id);
        
        // get anticall setting from SQL 
        const anticallSetting = await db.get(botNumber, 'anticall', 'off');
        
        if (!anticallSetting || anticallSetting === 'off') {
            console.log(chalk.gray('[ANTICALL] Disabled'));
            return;
        }
        
        for (let call of callData) {
            const from = call.from;
            const callId = call.id;
            
            // Get owners from database
            const owners = await db.get(botNumber, 'owners', []);
            const isOwner = owners.some(num => from.includes(num.replace('+', '').replace(/[^0-9]/g, '')));
            
            if (isOwner) {
                console.log(chalk.green(`[ANTICALL] Allowing call from owner: ${from}`));
                continue;
            }
            
            try {
                const now = Date.now();
                const lastWarn = global.recentCallers?.get(from) || 0;
                const COOLDOWN = 30 * 1000;
                
                if (now - lastWarn < COOLDOWN) {
                    console.log(chalk.yellow(`[ANTICALL] Suppressing repeated warning to ${from}`));
                    try {
                        if (typeof kelvin.rejectCall === 'function') {
                            await kelvin.rejectCall(callId, from);
                        }
                    } catch (e) {}
                    continue;
                }
                
                if (!global.recentCallers) global.recentCallers = new Map();
                global.recentCallers.set(from, now);
                
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
            
            try {
                const callerName = await kelvin.getName(from) || from.split('@')[0];
                let warningMessage = '';
                
                if (anticallSetting === 'block') {
                    warningMessage = `🚫 *CALL BLOCKED*\n\n` +
                        `*Caller:* @${from.split('@')[0]}\n` +
                        `*Time:* ${moment().tz(timezones).format('HH:mm:ss')}\n` +
                        `*Date:* ${moment().tz(timezones).format('DD/MM/YYYY')}\n\n` +
                        `*🌹 Hi, I am ${global.botname}, a friendly WhatsApp bot from Uganda 🇺🇬, created by Kelvin Tech.*\n\n` +
                        `*My owner cannot receive calls at this moment. Calls are automatically blocked.*\n\n` +
                        `> ${global.wm}`;
                } else {
                    warningMessage = `🚫 *CALL DECLINED*\n\n` +
                        `*Caller:* @${from.split('@')[0]}\n` +
                        `*Time:* ${moment().tz(timezones).format('HH:mm:ss')}\n` +
                        `*Date:* ${moment().tz(timezones).format('DD/MM/YYYY')}\n\n` +
                        `*🌹 Hi, I am ${global.botname}, a friendly WhatsApp bot from Uganda 🇺🇬, created by Kelvin Tech.*\n\n` +
                        `*My owner cannot receive calls at this moment. Please avoid unnecessary calling.*\n\n` +
                        `> ${global.wm}`;
                }

                await kelvin.sendMessage(from, { 
                    text: warningMessage,
                    mentions: [from]
                });
                
                console.log(chalk.green(`[ANTICALL] Warning message sent to chat: ${from}`));
                
            } catch (msgError) {
                console.error(chalk.red('[ANTICALL] Failed to send message to chat:'), msgError);
            }
            
            try {
                if (typeof kelvin.rejectCall === 'function') {
                    await kelvin.rejectCall(callId, from);
                    console.log(chalk.green(`[ANTICALL] Successfully ${anticallSetting === 'block' ? 'blocked' : 'declined'} call from: ${from}`));
                    
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



const porDir = path.join(__dirname, 'data');
const porPath = path.join(porDir, 'VesperXmd.html');

// get runtime
function getUptime() {
    return runtime(process.uptime());
}

app.get("/", (req, res) => {
    res.sendFile(porPath);
});

app.get("/uptime", (req, res) => {
    res.json({ uptime: getUptime() });
});

app.listen(port, (err) => {
    if (err) {
        console.error(color(`Failed to start server on port: ${port}`, 'red'));
    } else {
        console.log(color(`[Vesper-Xmd] Running on port: ${port}`, 'white'));
    }
});

clientstart();

let file = require.resolve(__filename);
require('fs').watchFile(file, () => {
    require('fs').unwatchFile(file);
    console.log('\x1b[0;32m' + __filename + ' \x1b[1;32mupdated!\x1b[0m');
    delete require.cache[file];
    require(file);
});