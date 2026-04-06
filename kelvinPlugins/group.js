/*Kelvin Tech*/

const { downloadContentFromMessage,getContentType,
generateWAMessageFromContent,
generateWAMessageContent } = require('@whiskeysockets/baileys');
const crypto = require('crypto')
const jimp = require('jimp');
const fs = require('fs');
const {
antidemoteCommand,
antipromoteCommand
} = require('../start/kevin');
 

// Helper functions
async function buildPayloadFromQuoted(quotedMessage, kelvin) {
    if (quotedMessage.videoMessage) {
        const buffer = await downloadToBuffer(quotedMessage.videoMessage, 'video');
        return { 
            video: buffer, 
            caption: quotedMessage.videoMessage.caption || '',
            gifPlayback: quotedMessage.videoMessage.gifPlayback || false,
            mimetype: quotedMessage.videoMessage.mimetype || 'video/mp4'
        };
    } else if (quotedMessage.imageMessage) {
        const buffer = await downloadToBuffer(quotedMessage.imageMessage, 'image');
        return { 
            image: buffer, 
            caption: quotedMessage.imageMessage.caption || '',
            mimetype: quotedMessage.imageMessage.mimetype || 'image/jpeg'
        };
    } else if (quotedMessage.audioMessage) {
        const buffer = await downloadToBuffer(quotedMessage.audioMessage, 'audio');
        if (quotedMessage.audioMessage.ptt) {
            const audioVn = await toVN(buffer);
            return { audio: audioVn, mimetype: "audio/ogg; codecs=opus", ptt: true };
        } else {
            return { audio: buffer, mimetype: quotedMessage.audioMessage.mimetype || 'audio/mpeg', ptt: false };
        }
    } else if (quotedMessage.stickerMessage) {
        try {
            const buffer = await downloadToBuffer(quotedMessage.stickerMessage, 'sticker');
            const imageBuffer = await convertStickerToImage(buffer, quotedMessage.stickerMessage.mimetype);
            return { 
                image: imageBuffer, 
                caption: quotedMessage.stickerMessage.caption || '',
                mimetype: 'image/png',
                convertedSticker: true,
                originalMimetype: quotedMessage.stickerMessage.mimetype
            };
        } catch (conversionError) {
            console.error('Sticker conversion failed:', conversionError);
            return { text: `⚠️ Sticker conversion failed (${quotedMessage.stickerMessage.mimetype || 'unknown'})` };
        }
    } else if (quotedMessage.conversation || quotedMessage.extendedTextMessage?.text) {
        const textContent = quotedMessage.conversation || quotedMessage.extendedTextMessage?.text || '';
        return { text: textContent };
    }
    return null;
}

async function downloadToBuffer(message, type) {
    const stream = await downloadContentFromMessage(message, type);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
    return buffer;
}

async function convertStickerToImage(stickerBuffer, mimetype = 'image/webp') {
    try {
        return await convertStickerToImageSimple(stickerBuffer);
    } catch (error) {
        console.error('Sticker conversion failed:', error);
        throw new Error(`Sticker conversion failed: ${error.message}`);
    }
}

async function convertStickerToImageSimple(stickerBuffer) {
    if (stickerBuffer.slice(0, 12).toString('hex').includes('52494646')) { // RIFF header
        console.log('Detected WebP sticker, using fallback conversion');
        return stickerBuffer; 
    }
    return stickerBuffer;
}

async function toVN(inputBuffer) {
    return new Promise((resolve, reject) => {
        const inStream = new PassThrough();
        inStream.end(inputBuffer);
        const outStream = new PassThrough();
        const chunks = [];
        ffmpeg(inStream)
            .noVideo()
            .audioCodec("libopus")
            .format("ogg")
            .audioBitrate("48k")
            .audioChannels(1)
            .audioFrequency(48000)
            .on("error", reject)
            .on("end", () => resolve(Buffer.concat(chunks)))
            .pipe(outStream, { end: true });
        outStream.on("data", chunk => chunks.push(chunk));
    });
}

async function sendGroupStatus(kelvin, jid, content) {
    const inside = await generateWAMessageContent(content, { upload: kelvin.waUploadToServer });
    const messageSecret = crypto.randomBytes(32);
    const m = generateWAMessageFromContent(jid, {
        messageContextInfo: { messageSecret },
        groupStatusMessageV2: { message: { ...inside, messageContextInfo: { messageSecret } } }
    }, {});
    await kelvin.relayMessage(jid, m.message, { messageId: m.key.id });
    return m;
}

function detectMediaType(quotedMessage, payload = null) {
    if (!quotedMessage) return 'Text';
    if (quotedMessage.videoMessage) return 'Video';
    if (quotedMessage.imageMessage) return 'Image';
    if (quotedMessage.audioMessage) return 'Audio';
    if (quotedMessage.stickerMessage) {
        if (payload && payload.convertedSticker) return 'Sticker → Image';
        return 'Sticker';
    }
    return 'Text';
}

function getHelpText() {
    return `
✦ *GROUP STATUS* ✦

Commands:
✦ togroupstatus / .tosgroup

Usage:
✦ tosgroup text
✦ Reply to media/sticker with .tosgroup
✦ Add caption after command`;
}

async function generateProfilePicture(buffer) {
    let buff;
    if (Buffer.isBuffer(buffer)) {
        buff = buffer;
    } else if (typeof buffer === 'string' && fs.existsSync(buffer)) {
        buff = fs.readFileSync(buffer);
    } else if (typeof buffer === 'string' && buffer.startsWith('http')) {
        buff = await getBuffer(buffer);
    }
    const image = await jimp.read(buff);
    const min = Math.min(image.getWidth(), image.getHeight());
    const cropped = image.crop(0, 0, min, min);
    const img = await cropped.scaleToFit(720, 720).getBufferAsync(jimp.MIME_JPEG);
    return { img };
}

module.exports = [
{
    command: ['listactive', 'activeusers'],
    operate: async ({ kelvin, m, reply, isGroup, from, GroupDB, groupName }) => {
        if (!isGroup) return reply(global.mess.notgroup);
        
        const activeUsers = await GroupDB.getActiveUsers(from, 15);
        
        if (!activeUsers.length) {
            return reply('*📊 No active users found in this group.*\n\nSend some messages first to track activity!');
        }
        
        let message = `📊 *ACTIVE USERS - ${groupName || 'This Group'}*\n\n`;
        
        activeUsers.forEach((user, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🔹';
            message += `${medal} ${index + 1}. @${user.jid.split('@')[0]} - *${user.count} messages*\n`;
        });
        
        message += `\n📈 *Total tracked users:* ${activeUsers.length}`;
        
        await kelvin.sendMessage(m.chat, { 
            text: message, 
            mentions: activeUsers.map(u => u.jid) 
        }, { quoted: m });
    }
},
{
    command: ['listinactive', 'inactiveusers'],
    operate: async ({ kelvin, m, reply, isGroup, from, GroupDB, groupName }) => {
        if (!isGroup) return reply(global.mess.notgroup);
        
        try {
            const metadata = await kelvin.groupMetadata(from);
            const allParticipants = metadata.participants.map(p => p.id);
            
            const inactiveUsers = await GroupDB.getInactiveUsers(from, allParticipants);
            
            if (!inactiveUsers.length) {
                return reply('*✅ No inactive users found in this group!*\n\nAll participants have sent messages.');
            }
            
            let message = `⚠️ *INACTIVE USERS - ${groupName || 'This Group'}*\n\n`;
            message += `_Users who haven't sent any messages:_\n\n`;
            message += inactiveUsers.map((user, i) => `🔹 ${i + 1}. @${user.split('@')[0]}`).join('\n');
            message += `\n\n📊 *Total inactive:* ${inactiveUsers.length}`;

            await kelvin.sendMessage(m.chat, { 
                text: message, 
                mentions: inactiveUsers 
            }, { quoted: m });
            
        } catch (error) {
            console.error('Error in listinactive command:', error);
            reply('*Error fetching group data!*');
        }
    }
},
{
    command: ['groupactivity', 'activity'],
    operate: async ({ kelvin, m, reply, text, isGroup, GroupDB, from,groupName }) => {
        if (!isGroup) return reply(global.mess.notgroup);
        
        try {
            const metadata = await kelvin.groupMetadata(from);
            const allParticipants = metadata.participants.map(p => p.id);
            const activeUsers = await GroupDB.getActiveUsers(from, 1000);
            const inactiveUsers = await GroupDB.getInactiveUsers(kelvin, from, allParticipants);
            
            let message = `📊 *GROUP ACTIVITY - ${groupName || 'This Group'}*\n\n`;
            message += `*Total Members:* ${allParticipants.length}\n`;
            message += `✅ *Active Users:* ${activeUsers.length}\n`;
            message += `⚠️ *Inactive Users:* ${inactiveUsers.length}\n\n`;
            
            if (activeUsers.length > 0) {
                message += `🏆 *Top 3 Active Users:*\n`;
                activeUsers.slice(0, 3).forEach((user, index) => {
                    const medals = ['🥇', '🥈', '🥉'];
                    message += `${medals[index]} @${user.jid.split('@')[0]} - *${user.count} messages*\n`;
                });
                message += `\n`;
            }
            
            if (inactiveUsers.length > 0) {
                message += `💤 *Inactive Users (${inactiveUsers.length}):*\n`;
                inactiveUsers.slice(0, 5).forEach((user, index) => {
                    message += `${index + 1}. @${user.split('@')[0]}\n`;
                });
                if (inactiveUsers.length > 5) {
                    message += `... and ${inactiveUsers.length - 5} more`;
                }
            }

            const mentions = [
                ...activeUsers.slice(0, 3).map(u => u.jid),
                ...inactiveUsers.slice(0, 5)
            ];
            
            await kelvin.sendMessage(m.chat, { 
                text: message, 
                mentions: mentions 
            }, { quoted: m });
            
        } catch (error) {
            console.error('Error in groupactivity command:', error);
            reply('*Error fetching group activity!*');
        }
    }
},
{
    command: ['kickinactive', 'removeinactive'],
    operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin, GroupDB, from, prefix }) => {
        if (!isGroup) return reply(global.mess.notgroup);
      if (!m.isAdmin) return reply(global.mess.notadmin);
      if (!m.isBotAdmin) return reply(global.mess.botadmin);

        try {
            const metadata = await kelvin.groupMetadata(from);
            const allParticipants = metadata.participants.map(p => p.id);
            const groupAdmins = metadata.participants.filter(p => p.admin).map(p => p.id);
            
            const inactiveUsers = await GroupDB.getInactiveUsers(from, allParticipants)
                .filter(user => !groupAdmins.includes(user));

            if (!inactiveUsers.length) {
                return reply('*✅ No inactive users found to kick!*\n\nAll participants have sent messages or are admins.');
            }

            let message = `🚨 *KICKING INACTIVE USERS - ${metadata.subject || 'This Group'}*\n\n`;
            message += `_The following users will be kicked in 25 seconds:_\n\n`;
            message += inactiveUsers.map((user, i) => `🔹 ${i + 1}. @${user.split('@')[0]}`).join('\n');
            message += `\n\n📊 *Total to kick:* ${inactiveUsers.length}`;
            message += `\n⏰ *Time:* 25 seconds`;
            message += `\n❌ *Cancel:* Use *${prefix}cancelkick* to stop`;

            await kelvin.sendMessage(m.chat, { 
                text: message, 
                mentions: inactiveUsers 
            }, { quoted: m });

            if (!global.kickQueue) global.kickQueue = new Map();
            global.kickQueue.set(m.chat, { 
                type: 'inactive', 
                users: inactiveUsers,
                timestamp: Date.now()
            });

            setTimeout(async () => {
                if (!global.kickQueue.has(m.chat)) return;
                
                const queueData = global.kickQueue.get(m.chat);
                if (queueData.type === 'inactive') {
                    for (let user of inactiveUsers) {
                        try {
                            await kelvin.groupParticipantsUpdate(m.chat, [user], "remove");
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        } catch (userError) {
                            console.error(`Failed to kick ${user}:`, userError);
                        }
                    }
                    reply('✅ *Inactive users have been kicked successfully!*');
                    global.kickQueue.delete(m.chat);
                }
            }, 25000);

        } catch (error) {
            console.error('Error in kickinactive command:', error);
            reply('*Error processing kick command!*');
        }
    }
},
{
    command: ['kickall', 'removeall'],
    operate: async ({ kelvin, text, m, reply, isGroup, isSenderAdmin, from, prefix }) => {
        if (!m.isGroup) return reply(mess.notgroup);
        if (!m.isAdmin) return reply(global.mess.notadmin);
      if (!m.isBotAdmin) return reply(global.mess.botadmin);
        let bck = m.mentionedJid[0]
            ? m.mentionedJid[0]
            : m.quoted
            ? m.quoted.sender
            : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        await kelvin.groupParticipantsUpdate(m.chat, [bck], "remove");
        reply(global.mess.done);
    }
},
{
    command: ['cancelkick'],
    operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin }) => {
        if (!isGroup) return reply(global.mess.notgroup);
        if (!m.isAdmin) return reply(global.mess.notadmin);
      if (!m.isBotAdmin) return reply(global.mess.botadmin);

        try {
            if (global.kickQueue && global.kickQueue.has(m.chat)) {
                const queueData = global.kickQueue.get(m.chat);
                const usersCount = queueData.users ? queueData.users.length : 0;
                const kickType = queueData.type === 'inactive' ? 'Inactive Users Kick' : 
                                queueData.type === 'all' ? 'Kick All Members' : 'Unknown Kick';
                
                global.kickQueue.delete(m.chat);
                
                let cancelMessage = `*KICK OPERATION CANCELLED!*\n\n`;
                cancelMessage += `*Type:* ${kickType}\n`;
                cancelMessage += `👥 *Users affected:* ${usersCount}\n`;
                cancelMessage += `*Cancelled by:* @${m.sender.split('@')[0]}\n`;
                cancelMessage += `✅ *Status:* Successfully cancelled`;
                
                await kelvin.sendMessage(m.chat, { 
                    text: cancelMessage, 
                    mentions: [m.sender]
                });
                
            } else {
                reply('*No kick operation in progress!*\n\nThere is no active kick process to cancel.');
            }
        } catch (error) {
            console.error('Error in cancelkick command:', error);
            reply('*Error cancelling kick operation!*');
        }
    }
},
{
        command: ['totalmembers'],
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin, Access, participants, text }) => {
            if (!isGroup) return reply(global.mess.notgroup);
            
   if (!m.isAdmin) return reply(global.mess.notadmin);
   if (!m.isBotAdmin) return reply(global.mess.botadmin);
      
    await kelvin.sendMessage(
      m.chat,
      {
        text: `*GROUP*: ${groupMetadata.subject}\n*MEMBERS*: ${participants.length}`,
      },
      { quoted: m, ephemeralExpiration: 86400 }
    );
  }
},
{
        command: ['tagall'],
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin, participants, text }) => {
            if (!isGroup) return reply(global.mess.notgroup);
            if (!m.isAdmin) return reply(global.mess.notadmin);
            if (!m.isBotAdmin) return reply(global.mess.botadmin);

            let kev = m.sender;
            let q = text.split(' ').slice(1).join(' ').trim();
            let teks = `*TAGGED BY:* @${kev.split("@")[0]}\n\n*MESSAGE:* ${q || "No message"}\n\n`;
            
            for (let mem of participants) {
                teks += `@${mem.id.split("@")[0]}\n`;
            }
            
            kelvin.sendMessage(
                m.chat,
                {
                    text: teks,
                    mentions: participants.map((a) => a.id),
                },
                {
                    quoted: m,
                }
            );
        }
    },
    {
        command: ['mute', 'close'],
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin, isBotAdmin }) => {
            if (!isGroup) return reply(global.mess.notgroup);
            if (!m.isAdmin) return reply(global.mess.notadmin);
            if (!m.isBotAdmin) return reply(global.mess.botadmin);
            
            kelvin.groupSettingUpdate(m.chat, "announcement");
            reply("Group closed by admin. Only admins can send messages.");
        }
    },
    {
        command: ['delgrouppp'],
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin, from }) => {
            if (!isGroup) return reply(global.mess.notgroup);
           if (!m.isAdmin) return reply(global.mess.notadmin);
            if (!m.isBotAdmin) return reply(global.mess.botadmin);
            
            await kelvin.removeProfilePicture(from);
            reply("Group profile picture has been successfully removed.");
        }
    },
    {
        command: ['setdesc'],
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin, text }) => {
            if (!isGroup) return reply(global.mess.notgroup);
            if (!m.isAdmin) return reply(global.mess.notadmin);
            if (!m.isBotAdmin) return reply(global.mess.botadmin);
            
            if (!text) return reply("*Please enter a text*");
            
            await kelvin.groupUpdateDescription(m.chat, text);
            reply(global.mess.done);
        }
    },
    {
        command: ['vcf'],
        operate: async ({ kelvin, m, reply, isGroup, Access, quoted, groupMetadata, from, getSetting, botNumber, sleep }) => {
            try {
                if (!isGroup) return reply(global.mess.notgroup);
                if (!Access) return reply("*_This command is for the owner only_*");

                let card = quoted || m;
                let cmiggc = groupMetadata;
                const { participants } = groupMetadata;
                
                let orgiggc = participants.map(a => a.id);
                let vcard = '';
                let noPort = 0;
                
                for (let a of cmiggc.participants) {
                    vcard += `BEGIN:VCARD\nVERSION:3.0\nFN:[${noPort++}] +${a.id.split("@")[0]}\nTEL;type=CELL;type=VOICE;waid=${a.id.split("@")[0]}:+${a.id.split("@")[0]}\nEND:VCARD\n`;
                }

                const fs = require('fs');
                let nmfilect = './contacts.vcf';
                reply('Saving ' + cmiggc.participants.length + ' participants contact');

                fs.writeFileSync(nmfilect, vcard.trim());
                await sleep(2000);

                await kelvin.sendMessage(from, {
                    document: fs.readFileSync(nmfilect), 
                    mimetype: 'text/vcard', 
                    fileName: 'jexploit.vcf', 
                    caption: `\nDone saving.\nGroup Name: *${cmiggc.subject}*\nContacts: *${cmiggc.participants.length}*\n> Powered by ${getSetting(botNumber, 'botname', 'Jexploit')} `}, { quoted: m });

                fs.unlinkSync(nmfilect);
            } catch (err) {
                reply(err.toString());
            }
        }
    },
    {
        command: ['approve'],
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin, getSetting, botNumber }) => {
            if (!isGroup) return reply(global.mess.notgroup);
            if (!m.isAdmin) return reply(global.mess.notadmin);
            if (!m.isBotAdmin) return reply(global.mess.botadmin);

            const responseList = await kelvin.groupRequestParticipantsList(m.chat);

            if (responseList.length === 0) return reply("*No pending requests detected at the moment!*");

            for (const participan of responseList) {
                const response = await kelvin.groupRequestParticipantsUpdate(
                    m.chat, 
                    [participan.jid],
                    "approve"
                );
                console.log(response);
            }
            reply(`*${getSetting(botNumber, 'botname', 'Jexploit')} has approved all pending requests✅*`);
        }
    },
    {
        command: ['approveall'],
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin }) => {
            if (!m.isAdmin) return reply(global.mess.notadmin);
            if (!m.isBotAdmin) return reply(global.mess.botadmin);
            
            const groupId = m.chat;
            
            const approveAllRequests = async (message, chatId) => {
                const responseList = await kelvin.groupRequestParticipantsList(chatId);
                
                if (responseList.length === 0) {
                    return message.reply("*No pending requests found!*");
                }
                
                const jids = responseList.map(participant => participant.jid);
                
                try {
                    const response = await kelvin.groupRequestParticipantsUpdate(
                        chatId,
                        jids,
                        "approve"
                    );
                    message.reply(`*✅ Successfully approved ${responseList.length} requests!*`);
                } catch (error) {
                    console.error(error);
                    message.reply("*❌ Failed to approve all requests!*");
                }
            };
            
            await approveAllRequests(m, groupId);
        }
    },
    {
        command: ['disapproveall'],
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin }) => {
            if (!isGroup) return reply(global.mess.notgroup);
            if (!m.isAdmin) return reply(global.mess.notadmin);
            if (!m.isBotAdmin) return reply(global.mess.botadmin);
            
            const groupId = m.chat;
            
            const disapproveAllRequests = async (message, chatId) => {
                const responseList = await kelvin.groupRequestParticipantsList(chatId);
                
                if (responseList.length === 0) {
                    return message.reply("*No pending requests found!*");
                }
                
                const jids = responseList.map(participant => participant.jid);
                
                try {
                    const response = await kelvin.groupRequestParticipantsUpdate(
                        chatId,
                        jids,
                        "reject"
                    );
                    message.reply(`*❌ Successfully rejected ${responseList.length} requests!*`);
                } catch (error) {
                    console.error(error);
                    message.reply("*❌ Failed to reject all requests!*");
                }
            };
            
            await disapproveAllRequests(m, groupId);
        }
    },
    {
    command: ['setgrouppp', 'setgrouppic'],
    operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin, prefix, quoted, mime, args }) => {
        
        if (!m.isGroup) return reply(mess.notgroup);
        if (!m.isAdmin) return reply(global.mess.notadmin);
        if (!m.isBotAdmin) return reply(global.mess.botadmin);
        if (!quoted) return reply(`Reply to an image!\nExample: ${prefix + command}`);
        if (!/image/.test(mime)) return reply(`Reply to an image, not a sticker!`);
        
        try {
            await kelvin.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
            
            const mediaPath = await kelvin.downloadAndSaveMediaMessage(quoted, "pp");
            
            if (args[0] && args[0].toLowerCase() === "full") {
                const img = await jimp.read(mediaPath);
                const min = Math.min(img.getWidth(), img.getHeight());
                const cropped = await img.crop(0, 0, min, min).scaleToFit(720, 720).getBufferAsync(jimp.MIME_JPEG);
                
                await kelvin.query({
                    tag: "iq",
                    attrs: { to: m.chat, type: "set", xmlns: "w:profile:picture" },
                    content: [{ tag: "picture", attrs: { type: "image" }, content: cropped }]
                });
            } else {
                await kelvin.updateProfilePicture(m.chat, { url: mediaPath });
            }
            
            fs.unlinkSync(mediaPath);
            await kelvin.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
            reply(`✅ Group icon updated!`);
            
        } catch (error) {
            await kelvin.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
            reply(`❌ Error: ${error.message}`);
        }
    }
},
    {
        command: ['listrequest'],
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin }) => {
            if (!isGroup) return reply(global.mess.notgroup);
            if (!m.isAdmin) return reply(global.mess.notadmin);
            if (!m.isBotAdmin) return reply(global.mess.botadmin);
            
            const groupId = m.chat;
            
            const listGroupRequests = async (message, chatId) => {
                try {
                    const responseList = await kelvin.groupRequestParticipantsList(chatId);
                    
                    if (responseList.length === 0) {
                        return message.reply("*📭 No pending group requests found!*");
                    }
                    
                    let listMessage = `📋 *PENDING GROUP REQUESTS*\n\n`;
                    listMessage += `📊 *Total Requests:* ${responseList.length}\n\n`;
                    
                    responseList.forEach((participant, index) => {
                        listMessage += `${index + 1}. @${participant.jid.split('@')[0]}\n`;
                    });
                    
                    listMessage += `\n📌 *Use:*\n• .approveall - Approve all\n• .disapproveall - Reject all`;
                    
                    const mentions = responseList.map(p => p.jid);
                    await kelvin.sendMessage(
                        chatId,
                        {
                            text: listMessage,
                            mentions: mentions
                        },
                        { quoted: message }
                    );
                    
                } catch (error) {
                    console.error(error);
                    message.reply("*❌ Failed to fetch group requests!*");
                }
            };
            
            await listGroupRequests(m, groupId);
        }
    },
    {
        command: ['mediatag'],
        operate: async ({ kelvin, m, reply, prefix, isGroup, isGroupAdmins, quoted, participants }) => {
            if (!isGroup) return reply(global.mess.notgroup);
            if (!m.isAdmin) return reply(global.mess.notadmin);
            if (!m.isBotAdmin) return reply(global.mess.botadmin);
            
            if (!quoted) return reply(`Reply to any media with caption ${prefix}mediatag`);

            kelvin.sendMessage(m.chat, {
                forward: quoted.fakeObj,
                mentions: participants.map((a) => a.id),
            });
        }
    },
    {
        command: ['promote', 'upgrade'],
        operate: async ({ kelvin, m, reply, Access, isGroup, isSenderAdmin, text, mentionedJid, quoted }) => {
            if (!isGroup) return reply(global.mess.notgroup);
            if (!isGroup) return reply(global.mess.notgroup);
            if (!m.isAdmin) return reply(global.mess.notadmin);
            if (!m.isBotAdmin) return reply(global.mess.botadmin);
           
            let target = mentionedJid[0] 
                ? mentionedJid[0] 
                : quoted 
                ? quoted.sender 
                : text.replace(/\D/g, "") 
                ? text.replace(/\D/g, "") + "@s.whatsapp.net" 
                : null;

            if (!target) return reply("⚠ *Mention or reply to a user to promote!*");

            try {
                await kelvin.groupParticipantsUpdate(m.chat, [target], "promote");
                reply(`✅ *User promoted successfully!*`);
            } catch (error) {
                reply("*Failed to promote user. They might already be an admin or the bot lacks permissions.*");
            }
        }
    },
    {
        command: ['demote', 'downgrade'],
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin, text, mentionedJid, quoted }) => {
            if (!isGroup) return reply(global.mess.notgroup);
            if (!m.isAdmin) return reply(global.mess.notadmin);
            if (!m.isBotAdmin) return reply(global.mess.botadmin);
        
            let target = mentionedJid[0] 
                ? mentionedJid[0] 
                : quoted 
                ? quoted.sender 
                : text.replace(/\D/g, "") 
                ? text.replace(/\D/g, "") + "@s.whatsapp.net" 
                : null;

            if (!target) return reply("⚠ *Mention or reply to a user to demote!*");

            try {
                await kelvin.groupParticipantsUpdate(m.chat, [target], "demote");
                reply(`✅ *User demoted successfully!*`);
            } catch (error) {
                reply("*Failed to demote user. They might already be a member or the bot lacks permissions.*");
            }
        }
    },
    {
        command: ['tagadmins', 'listadmins', 'adminlist'],
        operate: async ({ kelvin, m, reply, isGroup, groupMetadata, participants }) => {
            if (!isGroup) return reply(global.mess.notgroup);

            try {
                await kelvin.sendMessage(m.chat, {
                    react: {
                        text: "⏳",
                        key: m.key
                    }
                });

                const groupData = await kelvin.groupMetadata(m.chat);
                const groupParticipants = groupData.participants;
                
                const admins = groupParticipants.filter(p => p.admin);
                const superAdmin = groupParticipants.find(p => p.admin === 'superadmin');
                const regularAdmins = groupParticipants.filter(p => p.admin && p.admin !== 'superadmin');

                if (admins.length === 0) {
                    await kelvin.sendMessage(m.chat, {
                        react: {
                            text: "ℹ️",
                            key: m.key
                        }
                    });
                    return reply('ℹ️ *No admins found in this group!*');
                }

                let adminList = `👑 *GROUP ADMINS LIST*\n\n`;
                adminList += `*Group:* ${groupData.subject}\n`;
                adminList += `*Total Admins:* ${admins.length}\n\n`;

                if (superAdmin) {
                    adminList += `🤴 *GROUP OWNER*\n`;
                    adminList += `• @${superAdmin.id.split('@')[0]}\n\n`;
                }

                if (regularAdmins.length > 0) {
                    adminList += `*ADMINS* (${regularAdmins.length})\n`;
                    regularAdmins.forEach((admin, index) => {
                        adminList += `${index + 1}. @${admin.id.split('@')[0]}\n`;
                    });
                }

                await kelvin.sendMessage(m.chat, {
                    react: {
                        text: "✅",
                        key: m.key
                    }
                });

                const mentionJids = admins.map(admin => admin.id);
                reply(adminList, { mentions: mentionJids });

            } catch (error) {
                console.error('Error listing admins:', error);
                
                await kelvin.sendMessage(m.chat, {
                    react: {
                        text: "❌",
                        key: m.key
                    }
                });
                
                reply('*Failed to get admin list.* Please try again.');
            }
        }
    },
    {
        command: ['getgrouppp'],
        operate: async ({ kelvin, quoted, m, reply, isGroup }) => {
            if (!isGroup) return reply(global.mess.notgroup);

            try {
                const ppUrl = await kelvin.profilePictureUrl(m.chat, 'image');

                await kelvin.sendMessage(m.chat, 
                    { 
                        image: { url: ppUrl }, 
                        caption: `🔹 *This Group's Profile Picture*`
                    }, 
                    { quoted: m }
                );
            } catch {
                await kelvin.sendMessage(m.chat, 
                    { 
                        image: { url: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60' }, 
                        caption: '⚠️ No profile picture found for this group.'
                    }, 
                    { quoted: m }
                );
            }
        }
    },
    {
        command: ['listonline'],
        operate: async ({ kelvin, m, reply, isGroup, args, store, botNumber }) => {
    if (!m.isGroup) return reply(mess.notgroup);
    
    let id = args && /\d+\-\d+@g.us/.test(args[0]) ? args[0] : m.chat;
    let presences = store.presences[id];
    
    if (!presences) {
      return reply('*No online members detected in this group.*');
    }

    let online = [...Object.keys(presences), botNumber];
    let liston = 1;
    kelvin.sendText(m.chat, '*ONLINE MEMBERS IN THIS GROUP*\n\n' + online.map(v => `${liston++} . @` + v.replace(/@.+/, '')).join`\n`, m, { mentions: online });
  }
},
    {
        command: ['editinfo'],
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin, args, prefix }) => {
            if (!isGroup) return reply(global.mess.notgroup);
            if (!m.isAdmin) return reply(global.mess.notadmin);
            if (!m.isBotAdmin) return reply(global.mess.botadmin);

            if (args[0] === "on") {
                await kelvin.groupSettingUpdate(m.chat, "unlocked").then(
                    (res) => reply(`*Successful, members can edit group info*`)
                );
            } else if (args[0] === "off") {
                await kelvin.groupSettingUpdate(m.chat, "locked").then((res) =>
                    reply(`*Successful, members cannot edit group info*`)
                );
            } else {
                reply(`Example ${prefix}editinfo on/off`);
            }
        }
    },
    {
        command: ['invite'],
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin, text }) => {
            if (!isGroup) return reply(global.mess.notgroup);
                  
            if (!text)
                return reply(
                    `*Enter the number you want to invite to this group*\n\nExample :\n${prefix}invite 256742932677`
                );
            if (text.includes("+"))
                return reply(`*Enter the number together without* *+*`);
            if (isNaN(text))
                return reply(
                    `*Enter only the numbers with your country code without spaces*`
                );

            let group = m.chat;
            let link = "https://chat.whatsapp.com/" + (await kelvin.groupInviteCode(group));
            await kelvin.sendMessage(text + "@s.whatsapp.net", {
                text: `*GROUP INVITATION*\n\nSomeone invites you to join this group: \n\n${link}`,
                mentions: [m.sender],
            });
            reply(`*Successfully sent invite link*`);
        }
    },
        {
        command: ['linkgc2'],
        operate: async ({ kelvin, m, reply, Access, isGroup, groupMetadata, participants }) => {
           if (!isGroup) return reply(global.mess.notgroup);
            if (!Access) return reply(global.mess.owner);
            
            let response = await kelvin.groupInviteCode(m.chat);
            kelvin.sendMessage(
                m.chat,
                { 
                    text: `*GROUP LINK*\n\n*NAME:* ${groupMetadata.subject}\n\n*OWNER:* ${groupMetadata.owner !== undefined ? "+" + groupMetadata.owner.split`@`[0] : "Unknown"}\n\n*ID:* ${groupMetadata.id}\n\n*LINK:* https://chat.whatsapp.com/${response}\n\n*MEMBERS:* ${participants.length}`,
                    detectLink: true
                },
                { quoted: m }
            );
        }
    },
    {
        command: ['unlockgc'],
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin, from }) => {
            try {
                if (!isGroup) return reply(global.mess.notgroup);
                if (!m.isAdmin) return reply(global.mess.notadmin);
                if (!m.isBotAdmin) return reply(global.mess.botadmin);
                
                await kelvin.groupSettingUpdate(from, "unlocked");
                reply("🔓 Group settings are now unlocked", {
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true
                    }
                });

            } catch (error) {
                console.error("UnlockGS Error:", error);
                reply("Failed to unlock group settings");
            }
        }
    },
    {
        command: ['lockgcsettings', 'lockgc'],
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin, from }) => {
            try {
                if (!isGroup) return reply(global.mess.notgroup);
                if (!m.isAdmin) return reply(global.mess.notadmin);
                if (!m.isBotAdmin) return reply(global.mess.botadmin);
                await kelvin.groupSettingUpdate(from, 'locked');
                reply("🔒 Group settings are now locked (admins only)", {
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true
                    }
                });

            } catch (error) {
                console.error("LockGS Error:", error);
                reply("❌ Failed to lock group settings");
            }
        }
    },
    {
        command: ['unlockgcsettings', 'unlockgc'],
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin, from }) => {
            try {
                if (!isGroup) return reply(global.mess.notgroup);
                if (!m.isAdmin) return reply(global.mess.notadmin);
                if (!m.isBotAdmin) return reply(global.mess.botadmin);
                await kelvin.groupSettingUpdate(from, 'unlocked');
                reply("🔓 Group settings are now unlocked (all participants)", {
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true
                    }
                });

            } catch (error) {
                console.error("UnlockGS Error:", error);
                reply("Failed to unlock group settings");
            }
        }
    },
    {
        command: ['adminapproval'],
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin, from }) => {
            try {
                if (!isGroup) return reply(global.mess.notgroup);
                if (!m.isAdmin) return reply(global.mess.notadmin);
                if (!m.isBotAdmin) return reply(global.mess.botadmin);
                const groupMetadata = await kelvin.groupMetadata(from);
                
                await kelvin.groupSettingUpdate(from, groupMetadata.announce ? 'not_announcement' : 'announcement');
                
                const newState = groupMetadata.announce ? "OFF" : "ON";
                reply(`✅ Admin approval mode turned ${newState}`, {
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true
                    }
                });

            } catch (error) {
                console.error("AdminApproval Error:", error);
                reply("Failed to toggle admin approval mode");
            }
        }
    },
    {
        command: ['closetime'],
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin, args }) => {
            if (!isGroup) return reply(global.mess.notgroup);
            if (!m.isAdmin) return reply(global.mess.notadmin);
            if (!m.isBotAdmin) return reply(global.mess.botadmin);
            
            if (!args[0] || !args[1]) {
                return reply("*Usage:*\n.closetime [duration] [unit]\n\n*Select unit:*\nseconds\nminutes\nhours\ndays\n\n*Example:*\n10 seconds");
            }

            const duration = args[0];
            const unit = args[1].toLowerCase();

            let timer;
            switch (unit) {
                case "seconds":
                    timer = duration * 1000;
                    break;
                case "minutes":
                    timer = duration * 60000;
                    break;
                case "hours":
                    timer = duration * 3600000;
                    break;
                case "days":
                    timer = duration * 86400000;
                    break;
                default:
                    return reply("*Select unit:*\nseconds\nminutes\nhours\ndays\n\n*Example:*\n10 seconds");
            }

            reply(`*Closing group after ${duration} ${unit}*`);
            setTimeout(() => {
                kelvin.groupSettingUpdate(m.chat, "announcement");
                reply("*Group closed by admin. Only admins can send messages.*");
            }, timer);
        }
    },
    {
        command: ['opentime'],
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin, args }) => {
            if (!isGroup) return reply(global.mess.notgroup);
            if (!m.isAdmin) return reply(global.mess.notadmin);
            if (!m.isBotAdmin) return reply(global.mess.botadmin);

            const duration = args[0];
            if (!args[1] || typeof args[1] !== 'string') return reply("*Select unit:*\nseconds\nminutes\nhours\ndays\n\n*Example:*\n10 seconds");
            const unit = args[1].toLowerCase();

            let timer;
            switch (unit) {
                case "seconds":
                    timer = duration * 1000;
                    break;
                case "minutes":
                    timer = duration * 60000;
                    break;
                case "hours":
                    timer = duration * 3600000;
                    break;
                case "days":
                    timer = duration * 86400000;
                    break;
                default:
                    return reply("*Select unit:*\nseconds\nminutes\nhours\ndays\n\n*Example:*\n10 seconds");
            }

            reply(`*Opening group after ${duration} ${unit}*`);
            setTimeout(() => {
                kelvin.groupSettingUpdate(m.chat, "not_announcement");
                reply("*Group opened by admin. Members can now send messages.*");
            }, timer);
        }
    },
    {
        command: ['mediatag'],
        operate: async ({ kelvin, m, reply, prefix, isGroup, isSenderAdmin, quoted, participants }) => {
            if (!isGroup) return reply(global.mess.notgroup);
            if (!m.isAdmin) return reply(global.mess.notadmin);
            if (!m.isBotAdmin) return reply(global.mess.botadmin);
            if (!quoted) return reply(`Reply to any media with caption ${prefix}mediatag`);

            kelvin.sendMessage(m.chat, {
                forward: quoted.fakeObj,
                mentions: participants.map((a) => a.id),
            });
        }
    },
    {
        command: ['poll'],
        operate: async ({ kelvin, m, reply, Access, isGroup, prefix, text }) => {
            if (!Access) return reply('*You are not my owner* 😜!');
            if (!isGroup) return reply(global.mess.notgroup);
            
            let [poll, opt] = text.split("|");
            if (text.split("|") < 2)
                return await reply(
                    `Enter a question and at least 2 options\nExample: ${prefix}poll Who is best player?|Messi,Ronaldo,None...`
                );
            let options = [];
            for (let i of opt.split(",")) {
                options.push(i);
            }
            
            await kelvin.sendMessage(m.chat, {
                poll: {
                    name: poll,
                    values: options,
                },
            });
        }
    },
    {
        command: ['antilink'],
        operate: async ({ kelvin, m, reply, prefix, args, isGroup, db, isBotAdmin, getSetting, botNumber }) => {
            if (!isGroup) return reply(global.mess.notgroup);
            if (!m.isAdmin) return reply(global.mess.notadmin);
            if (!m.isBotAdmin) return reply(global.mess.botadmin);
            
            const mode = args[0]?.toLowerCase();
    const action = args[1]?.toLowerCase(); // Get second argument (on/off)
    
    // Show help if no arguments
    if (!mode) {
        const status = await db.getGroupSetting(botNumber, m.chat, 'antilink', false);
        const currentMode = await db.getGroupSetting(botNumber, m.chat, 'antilinkmode', 'delete');
        return reply(`*ANTILINK SETTINGS*\n\nStatus: ${status ? '✅ ON' : '❌ OFF'}\nMode: ${currentMode}\n\nOptions:\n• ${prefix}antilink on\n• ${prefix}antilink off\n• ${prefix}antilink delete\n• ${prefix}antilink warn\n• ${prefix}antilink kick\n• ${prefix}antilink delete off\n• ${prefix}antilink warn off\n• ${prefix}antilink kick off`);
    }
    
    // Handle on/off (global toggle)
    if (mode === 'on') {
        await db.setGroupSetting(botNumber, m.chat, 'antilink', true);
        return reply('✅ Antilink has been enabled');
    }
    
    if (mode === 'off') {
        await db.setGroupSetting(botNumber, m.chat, 'antilink', false);
        return reply('✅ Antilink has been disabled');
    }
    
    // Handle mode settings with on/off action
    if (mode === 'delete' || mode === 'warn' || mode === 'kick') {
        
        // If user wants to turn this specific mode ON
        if (action === 'on') {
            await db.setGroupSetting(botNumber, m.chat, 'antilinkmode', mode);
            await db.setGroupSetting(botNumber, m.chat, 'antilink', true);
            return reply(`✅ *Successfully enabled antilink ${mode} mode*`);
        }
        
        // If user wants to turn this specific mode OFF
        if (action === 'off') {
            // Check what the current mode is
            const currentMode = await db.getGroupSetting(botNumber, m.chat, 'antilinkmode', 'delete');
            
            // If the current mode matches what they're trying to turn off
            if (currentMode === mode) {
                // Disable antilink completely
                await db.setGroupSetting(botNumber, m.chat, 'antilink', false);
                return reply(`✅ *Antilink has been disabled*`);
            } else {
                // They're trying to turn off a mode that's not active
                return reply(`⚠️ *Antilink is currently in ${currentMode} mode, not ${mode} mode*\n\nUse .antilink off to disable completely.`);
            }
        }
        
        // If no action specified (just ".antilink delete" without on/off)
        if (!action) {
            await db.setGroupSetting(botNumber, m.chat, 'antilinkmode', mode);
            await db.setGroupSetting(botNumber, m.chat, 'antilink', true);
            return reply(`✅ *Successfully enabled antilink ${mode} mode*`);
        }
    }
    
    reply(`Invalid option! Use: on, off, delete, warn, kick, or [mode] on/off`);
    }
},
{
    command: ['antibadword', 'antiword', 'filter'],
    operate: async ({ kelvin, m, reply, args, isGroup, db, botNumber, Access, prefix }) => {
        
            if (!isGroup) return reply(global.mess.notgroup);
            if (!m.isAdmin) return reply(global.mess.notadmin);
            if (!m.isBotAdmin) return reply(global.mess.botadmin);

        const chatId = m.chat;
        const mode = args[0]?.toLowerCase();
        const action = args[1]?.toLowerCase();

        // Show help if no arguments
        if (!mode) {
            const status = await db.getGroupSetting(botNumber, chatId, 'antibadword', false);
            const currentAction = await db.getGroupSetting(botNumber, chatId, 'badwordaction', 'delete');
            const badwords = await db.getGroupSetting(botNumber, chatId, 'badwords', []);
            
            let helpText = `╭──❖ 「 ANTIBADWORD 」 ❖──
│
│  *Status* : ${status ? '✅ ON' : '❌ OFF'}
│  *Action* : ${currentAction}
│  *Words*  : ${badwords.length}
│
│  *Commands:*
│  • ${prefix}antibadword delete on
│  • ${prefix}antibadword delete off
│  • ${prefix}antibadword warn on
│  • ${prefix}antibadword warn off
│  • ${prefix}antibadword kick on
│  • ${prefix}antibadword kick off
│  • ${prefix}antibadword add <word>
│  • ${prefix}antibadword remove <word>
│  • ${prefix}antibadword list
│  • ${prefix}antibadword clear
│
│  *Examples:*
│  • ${prefix}antibadword delete on
│  • ${prefix}antibadword add fuck
│
╰─────────❖`;

            return reply(helpText);
        }

        // Handle add word
        if (mode === 'add') {
            const word = action;
            if (!word) return reply('❌ Please provide a word to add.\nExample: .antibadword add fuck');
            
            let badwords = await db.getGroupSetting(botNumber, chatId, 'badwords', []);
            if (badwords.includes(word.toLowerCase())) {
                return reply(`The word "${word}" is already in the list.`);
            }
            
            badwords.push(word.toLowerCase());
            await db.setGroupSetting(botNumber, chatId, 'badwords', badwords);
            
            return reply(`✅ Added *${word}* to badword list.\nTotal badwords: ${badwords.length}`);
        }

        // Handle remove word
        if (mode === 'remove') {
            const word = action;
            if (!word) return reply('Please provide a word to remove.\nExample: .antibadword remove fuck');
            
            let badwords = await db.getGroupSetting(botNumber, chatId, 'badwords', []);
            const index = badwords.indexOf(word.toLowerCase());
            
            if (index === -1) {
                return reply(`The word "${word}" is not in the list.`);
            }
            
            badwords.splice(index, 1);
            await db.setGroupSetting(botNumber, chatId, 'badwords', badwords);
            
            return reply(`✅ Removed *${word}* from badword list.\nTotal badwords: ${badwords.length}`);
        }

        // Handle list
        if (mode === 'list') {
            let badwords = await db.getGroupSetting(botNumber, chatId, 'badwords', []);
            
            if (badwords.length === 0) {
                return reply('📋 No badwords added yet. Use `.antibadword add <word>` to add some.');
            }
            
            let listText = `╭──❖ 「 BADWORD LIST 」 ❖──\n│\n`;
            badwords.forEach((word, i) => {
                listText += `│  ${i + 1}. ${word}\n`;
            });
            listText += `│\n╰─────────❖`;
            
            return reply(listText);
        }

        // Handle clear
        if (mode === 'clear') {
            await db.setGroupSetting(botNumber, chatId, 'badwords', []);
            return reply('✅ All badwords have been cleared from the list.');
        }

        // Handle action modes (delete, warn, kick)
        if (['delete', 'warn', 'kick'].includes(mode)) {
            if (!action || !['on', 'off'].includes(action)) {
                return reply(`❌ Please specify on or off.\nExample: .antibadword ${mode} on`);
            }

            const enabled = action === 'on';
            
            // Set the action type
            await db.setGroupSetting(botNumber, chatId, 'badwordaction', mode);
            await db.setGroupSetting(botNumber, chatId, 'antibadword', enabled);
            
            return reply(`✅ Antibadword *${mode}* has been *${action}* for this group.`);
        }

        // Invalid command
        reply('Invalid command! Use `.antibadword` to see available commands.');
    }
},
{
    command: ['antisticker', 'nosticker', 'stickerfilter'],
    operate: async ({ kelvin, m, reply, args, isGroup, db, botNumber, Access, prefix }) => {
        
        if (!isGroup) return reply(global.mess.notgroup);
            if (!m.isAdmin) return reply(global.mess.notadmin);
            if (!m.isBotAdmin) return reply(global.mess.botadmin);
            

        const chatId = m.chat;
        const mode = args[0]?.toLowerCase();
        const action = args[1]?.toLowerCase();

        // Show help if no arguments
        if (!mode) {
            const status = await db.getGroupSetting(botNumber, chatId, 'antisticker', false);
            const currentAction = await db.getGroupSetting(botNumber, chatId, 'antistickeraction', 'delete');
            
            let helpText = `╭──❖ 「 ANTISTICKER 」 ❖──
│
│  *Status* : ${status ? '✅ ON' : '❌ OFF'}
│  *Action* : ${currentAction}
│
│  *Commands:*
│  • ${prefix}antisticker delete on
│  • ${prefix}antisticker delete off
│  • ${prefix}antisticker warn on
│  • ${prefix}antisticker warn off
│  • ${prefix}antisticker kick on
│  • ${prefix}antisticker kick off
│
│  *Examples:*
│  • ${prefix}antisticker delete on
│  • ${prefix}antisticker warn on
│
╰─────────❖`;

            return reply(helpText);
        }

        // Handle action modes (delete, warn, kick)
        if (['delete', 'warn', 'kick'].includes(mode)) {
            if (!action || !['on', 'off'].includes(action)) {
                return reply(`Please specify on or off.\nExample: .antisticker ${mode} on`);
            }

            const enabled = action === 'on';
            
            // Set the action type
            await db.setGroupSetting(botNumber, chatId, 'antistickeraction', mode);
            // Enable/disable the feature
            await db.setGroupSetting(botNumber, chatId, 'antisticker', enabled);
            
            return reply(`✅ Antisticker *${mode}* has been *${action}* for this group.`);
        }

        // Invalid command
        reply('Invalid command! Use `.antisticker` to see available commands.');
    }
},
    {
        command: ['antitag'],
        operate: async ({ kelvin, m, reply, prefix, args, isGroup, isSenderAdmin, db, botNumber }) => {
            if (!isGroup) return reply(global.mess.notgroup);
            if (!m.isAdmin) return reply(global.mess.notadmin);
            if (!m.isBotAdmin) return reply(global.mess.botadmin);
            
            const mode = args[0]?.toLowerCase();
    const action = args[1]?.toLowerCase();
    
    // Delete mode
    if (mode === 'delete' && action === 'on') {
        await db.setGroupSetting(botNumber, m.chat, 'antitagmode', 'delete');
        await db.setGroupSetting(botNumber, m.chat, 'antitag', true);
        return reply('✅ *Successfully enabled antitag delete mode*');
    }
    if (mode === 'delete' && action === 'off') {
        await db.setGroupSetting(botNumber, m.chat, 'antitag', false);
        return reply('*Successfully disabled antitag delete mode*');
    }
    
    // Warn mode
    if (mode === 'warn' && action === 'on') {
        await db.setGroupSetting(botNumber, m.chat, 'antitagmode', 'warn');
        await db.setGroupSetting(botNumber, m.chat, 'antitag', true);
        return reply('✅ *Successfully enabled antitag warn mode*');
    }
    if (mode === 'warn' && action === 'off') {
        await db.setGroupSetting(botNumber, m.chat, 'antitag', false);
        return reply('*Successfully disabled antitag warn mode*');
    }
    
    // Kick mode
    if (mode === 'kick' && action === 'on') {
        await db.setGroupSetting(botNumber, m.chat, 'antitagmode', 'kick');
        await db.setGroupSetting(botNumber, m.chat, 'antitag', true);
        return reply('✅ *Successfully enabled antitag kick mode*');
    }
    if (mode === 'kick' && action === 'off') {
        await db.setGroupSetting(botNumber, m.chat, 'antitag', false);
        return reply('*Successfully disabled antitag kick mode*');
    }
    
    // Show help if invalid
    reply('Use: delete on/off, warn on/off, kick on/off');
  }
},
    {
        command: ['tagall2'],
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin, participants, from }) => {
            try {
                if (!isGroup) return reply(global.mess.notgroup);
                if (!m.isAdmin) return reply(global.mess.notadmin);
                if (!m.isBotAdmin) return reply(global.mess.botadmin);

                let message = "📢 *Attention Everyone!* \n\n";
                const mentions = participants.map(p => p.id);
                
                mentions.forEach(userId => {
                    message += `@${userId.split('@')[0]} `;
                });

                await kelvin.sendMessage(from, {
                    text: message,
                    mentions,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true
                    }
                }, { quoted: m });

            } catch (error) {
                console.error("TagAll Error:", error);
                reply("❌ Failed to tag all members");
            }
        }
    },
    {
        command: ['link', 'linkgc'],
        operate: async ({ kelvin, m, reply, Access, isGroup, global }) => {
            if (!Access) return reply(global.mess.owner);
            if (!isGroup) return reply(global.mess.notgroup);
            
            try {
                const freshGroupMetadata = await kelvin.groupMetadata(m.chat);
                let groupInvite = await kelvin.groupInviteCode(m.chat);
                let groupOwner = freshGroupMetadata.owner ? `+${freshGroupMetadata.owner.split('@')[0]}` : "Unknown";
                let groupLink = `https://chat.whatsapp.com/${groupInvite}`;
                let memberCount = freshGroupMetadata.participants.length;

                let message = `🔗 *GROUP LINK*\n\n` +
                              `📌 *Name:* ${freshGroupMetadata.subject}\n` +
                              `👑 *Owner:* ${groupOwner}\n` +
                              `🆔 *Group ID:* ${freshGroupMetadata.id}\n` +
                              `👥 *Members:* ${memberCount}\n\n` +
                              `🌍 *Link:* ${groupLink}\n\n> ${global.wm}`;

                await kelvin.sendMessage(m.chat, { text: message }, { detectLink: true });
            } catch (error) {
                console.error('Error generating group link:', error);
                reply("❌ *Failed to fetch group link. Make sure the bot has admin permissions.*");
            }
        }
    },
    {
        command: ['unmute', 'open'],
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin }) => {
            if (!isGroup) return reply('*This command can only be used in groups.*');
            if (!m.isAdmin) return reply(global.mess.notadmin);
            if (!m.isBotAdmin) return reply(global.mess.botadmin);
            kelvin.groupSettingUpdate(m.chat, "not_announcement");
            reply("Group opened by admin. Members can now send messages.");
        }
    },
    {
        command: ['add'],
        operate: async ({ kelvin, m, reply, prefix, isGroup, isSenderAdmin, text, quoted }) => {
              if (!m.isGroup) return reply(global.mess.notgroup);
              if (!m.isAdmin) return reply(global.mess.notadmin);
            if (!m.isBotAdmin) return reply(global.mess.botadmin);
         if (!text) return reply(`*Please provide phone number with no country code.*\nExample: ${prefix + command} 256755585369`);


        
        let bws = m.quoted
            ? m.quoted.sender
            : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        await kelvin.groupParticipantsUpdate(m.chat, [bws], "add");
        reply(global.mess.done);
    }
},
    {
        command: ['kick'],
        operate: async ({ kelvin, m, reply, isGroup, mentionedJid, quoted, from }) => {
             if (!m.isGroup) return reply(mess.group);
       if (!m.isAdmin) return reply(global mess.notadmin);
       if (!m.isBotAdmin) return reply(global.mess.botadmin);
        let bck = m.mentionedJid[0]
            ? m.mentionedJid[0]
            : m.quoted
            ? m.quoted.sender
            : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        await kelvin.groupParticipantsUpdate(m.chat, [bck], "remove");
        reply(global.mess.done);
             }
    },
    {
        command: ['groupinfo'],
        operate: async ({ kelvin, m, reply, isGroup, groupMetadata, from }) => {
            try {
                if (!isGroup) return reply(global.mess.notgroup);

                const metadata = await kelvin.groupMetadata(from);
                let ppUrl;
                try {
                    ppUrl = await kelvin.profilePictureUrl(from, "image");
                } catch {
                    ppUrl = "https://i.imgur.com/8nLFCVP.png";
                }

                const infoText = `
*${metadata.subject}*

👥 *Participants:* ${metadata.size}
👑 *Owner:* @${metadata.owner.split('@')[0]}
📝 *Description:* ${metadata.desc || "None"}
🆔 *Group ID:* ${metadata.id}
`.trim();

                await kelvin.sendMessage(from, {
                    image: { url: ppUrl },
                    caption: infoText,
                    mentions: [metadata.owner],
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true
                    }
                }, { quoted: m });

            } catch (error) {
                console.error("GInfo Error:", error);
                reply("Failed to get group information");
            }
        }
    },
    {
        command: ['resetlinkgc'],
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin, from }) => {
            if (!isGroup) return reply('*This command can only be used in groups.*');
            if (!m.isAdmin) return reply(global.mess.notadmin);
            if (!m.isBotAdmin) return reply(global.mess.botadmin);

            kelvin.groupRevokeInvite(from);
            reply("*group link reseted by admin*");
        }
    },
   
{
    command: ['antidemote'],
    operate: async ({ m, reply, prefix, args, Access, botNumber, kelvin }) => {
        if (!m.isGroup) return reply(global.notgroup);
        if (!Access) return reply(mess.owner);
        if (!m.isAdmin) return reply(global.mess.notadmin);
        if (!m.isBotAdmin) return reply(global.mess.botadmin);
        
        await antidemoteCommand(kelvin, m, args, botNumber);
    }
},
{
    command: ['antipromote'],
    operate: async ({ m, reply, prefix, args, Access, botNumber, kelvin }) => {
        if (!m.isGroup) return reply(global.notgroup);
        if (!Access) return reply(mess.owner);
        if (!m.isAdmin) return reply(global.mess.notadmin);
        if (!m.isBotAdmin) return reply(global.mess.botadmin);
        
        await antipromoteCommand(kelvin, m, args, botNumber);
    }
},
{
    command: ['antitagadmin'],
    operate: async ({ m, reply, prefix, args, Access, db, botNumber, kelvin }) => {
        if (!m.isGroup) return reply(global.notgroup);
        if (!Access) return reply(mess.owner);
        if (!m.isAdmin) return reply(global.mess.notadmin);
        if (!m.isBotAdmin) return reply(global.mess.botadmin);
        
        const mode = args[0]?.toLowerCase();
    
    if (!mode) {
        const status = await db.getGroupSetting(botNumber, m.chat, 'antitagadmin', false);
        const currentAction = await db.getGroupSetting(botNumber, m.chat, 'antitagadminaction', 'warn');
        return reply(`*👑 ANTITAG ADMIN SETTINGS*\n\nStatus: ${status ? '✅ ON' : '❌ OFF'}\nAction: ${currentAction}\n\nOptions:\n• ${prefix}antitagadmin on\n• ${prefix}antitagadmin off\n• ${prefix}antitagadmin delete\n• ${prefix}antitagadmin warn\n• ${prefix}antitagadmin kick`);
    }
    
    // Handle on/off
    if (mode === 'on') {
        await db.setGroupSetting(botNumber, m.chat, 'antitagadmin', true);
        return reply('✅ Anti-tag admin has been enabled');
    }
    
    if (mode === 'off') {
        await db.setGroupSetting(botNumber, m.chat, 'antitagadmin', false);
        return reply('✅ Anti-tag admin has been disabled');
    }
    
    // Handle action settings
    if (mode === 'delete') {
        await db.setGroupSetting(botNumber, m.chat, 'antitagadminaction', 'delete');
        await db.setGroupSetting(botNumber, m.chat, 'antitagadmin', true); // Auto-enable
        return reply('✅ *Successfully enabled antitagadmin delete mode*');
    }
    
    if (mode === 'warn') {
        await db.setGroupSetting(botNumber, m.chat, 'antitagadminaction', 'warn');
        await db.setGroupSetting(botNumber, m.chat, 'antitagadmin', true); // Auto-enable
        return reply('✅ *Successfully enabled antitagadmin warn mode*');
    }
    
    if (mode === 'kick') {
        await db.setGroupSetting(botNumber, m.chat, 'antitagadminaction', 'kick');
        await db.setGroupSetting(botNumber, m.chat, 'antitagadmin', true); // Auto-enable
        return reply('✅ *Successfully enabled antitagadmin kick mode*');
    }
    
    reply(`Invalid option! Use: on, off, delete, warn, kick`);
    }
},
 {
        command: ['allowlink'],
        operate: async ({ kelvin, m, args, reply, Access, isGroup, prefix, db, text, botNumber, mentionedJid, quoted }) => {
        if (!m.isGroup) return reply(mess.group);
    if (!m.isAdmin && !Access) return reply(mess.notadmin);
    if (!m.isBotAdmin) return reply(mess.botadmin);
    
    const action = args[0]?.toLowerCase();
    let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : args[1]);
    
    if (!action) {
        const allowed = await db.getGroupSetting(botNumber, m.chat, 'allowlink', []);
        return reply(`*📋 ALLOWLINK COMMANDS*\n\n• ${prefix}allowlink add @user (or reply to their message)\n• ${prefix}allowlink remove @user (or reply to their message)\n• ${prefix}allowlink list\n• ${prefix}allowlink clear\n\nTotal allowed: ${allowed.length}`);
    }
    
    // ADD USER
    if (action === 'add') {
        if (!target) return reply('Please mention the user, reply to their message, or provide their number!\nExample: .allowlink add @user');
        
        const jid = target.includes('@s.whatsapp.net') ? target : target + '@s.whatsapp.net';
        let allowed = await db.getGroupSetting(botNumber, m.chat, 'allowlink', []);
        
        if (allowed.includes(jid)) {
            return reply(`@${jid.split('@')[0]} is already in allowlist`, { mentions: [jid] });
        }
        
        allowed.push(jid);
        await db.setGroupSetting(botNumber, m.chat, 'allowlink', allowed);
        
        // Get username for better response
        const name = await kelvin.getName(jid) || jid.split('@')[0];
        return reply(`✅ @${name} can now post links`, { mentions: [jid] });
    }
    
    // REMOVE USER
    if (action === 'remove') {
        if (!target) return reply('Please mention the user, reply to their message, or provide their number!\nExample: .allowlink remove @user');
        
        const jid = target.includes('@s.whatsapp.net') ? target : target + '@s.whatsapp.net';
        let allowed = await db.getGroupSetting(botNumber, m.chat, 'allowlink', []);
        
        const index = allowed.indexOf(jid);
        if (index === -1) {
            return reply(`❌ @${jid.split('@')[0]} is not in allowlist`, { mentions: [jid] });
        }
        
        allowed.splice(index, 1);
        await db.setGroupSetting(botNumber, m.chat, 'allowlink', allowed);
        
        const name = await kelvin.getName(jid) || jid.split('@')[0];
        return reply(`✅ @${name} removed from allowlist`, { mentions: [jid] });
    }
    
    // LIST ALLOWED USERS
    if (action === 'list') {
        let allowed = await db.getGroupSetting(botNumber, m.chat, 'allowlink', []);
        
        if (allowed.length === 0) {
            return reply('📋 No users are allowed to post links');
        }
        
        let msg = `*📋 ALLOWED USERS (${allowed.length})*\n\n`;
        allowed.forEach((jid, i) => {
            msg += `${i + 1}. @${jid.split('@')[0]}\n`;
        });
        
        return kelvin.sendMessage(m.chat, { 
            text: msg, 
            mentions: allowed 
        }, { quoted: m });
    }
    
    // CLEAR ALL ALLOWED USERS
    if (action === 'clear') {
        await db.setGroupSetting(botNumber, m.chat, 'allowlink', []);
        return reply('✅ All users removed from allowlist');
    }
    
    reply(`❌ Invalid action! Use: add, remove, list, clear`);
    }
},
    {
        command: ['userjid', 'userid'],
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin }) => {
            if (!isGroup) return reply(global.mess.notgroup);
            
            const groupMetadata = m.isGroup
                ? await kelvin.groupMetadata(m.chat).catch((e) => {})
                : "";
            const participants = m.isGroup
                ? await groupMetadata.participants
                : "";
            let textt = `Here is jid address of all users of\n *${groupMetadata.subject}*\n\n`;
            for (let mem of participants) {
                textt += `□ ${mem.id}\n`;
            }
            reply(textt);
        }
    },
    {
        command: ['disp90days'],
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin }) => {
            if (!isGroup) return reply(global.mess.notgroup);
            if (!m.isAdmin) return reply(global.mess.notadmin);
            if (!m.isBotAdmin) return reply(global.mess.botadmin);

            await kelvin.groupToggleEphemeral(m.chat, 90*24*3600);
            reply('Dissapearing messages successfully turned on for 90 days!');
        }
    },
    {
        command: ['dispoff'],
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin }) => {
            if (!isGroup) return reply(global.mess.notgroup);
            if (!m.isAdmin) return reply(global.mess.notadmin);
            if (!m.isBotAdmin) return reply(global.mess.botadmin);

            await kelvin.groupToggleEphemeral(m.chat, 0);
            reply('Dissapearing messages successfully turned off!');
        }
    },
    {
        command: ['disp24hours'],
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin}) => {
            if (!isGroup) return reply(global.mess.notgroup);
            if (!m.isAdmin) return reply(global.mess.notadmin);
            if (!m.isBotAdmin) return reply(global.mess.botadmin);

            await kelvin.groupToggleEphemeral(m.chat, 1*24*3600);
            reply('Dissapearing messages successfully turned on for 24hrs!');
        }
    },
    {
    command: ['togstatus', 'swgc', 'groupstatus', 'tosgroup'],
    operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin, isBotAdmin, participants, quoted }) => {
        if (!isGroup) return reply(global.mess.notgroup);
            if (!m.isAdmin) return reply(global.mess.notadmin);
            if (!m.isBotAdmin) return reply(global.mess.botadmin);
        
        try {
            const messageText = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
            const quotedMessage = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const commandRegex = /^[.!#/]?(togstatus|swgc|groupstatus|tosgroup)\s*/i;

            if (!quotedMessage && (!messageText.trim() || messageText.trim().match(commandRegex))) {
                return reply(getHelpText());
            }

            let payload = null;
            let textAfterCommand = '';

            if (messageText.trim()) {
                const match = messageText.match(commandRegex);
                if (match) textAfterCommand = messageText.slice(match[0].length).trim();
            }

            if (quotedMessage) {
                payload = await buildPayloadFromQuoted(quotedMessage, kelvin);
                if (textAfterCommand && payload) {
                    if (payload.video || payload.image || (payload.convertedSticker && payload.image)) {
                        payload.caption = textAfterCommand;
                    }
                }
            } else if (messageText.trim()) {
                if (textAfterCommand) {
                    payload = { text: textAfterCommand };
                } else {
                    return reply(getHelpText());
                }
            }

            if (!payload) {
                return reply(getHelpText());
            }

            // Send group status
            await sendGroupStatus(kelvin, m.chat, payload);

            const mediaType = detectMediaType(quotedMessage, payload);
            let successMsg = `✅ ${mediaType} sent!`;
            if (payload.caption) successMsg += `\n📝 "${payload.caption}"`;
            if (payload.convertedSticker) successMsg += `\n(sticker → image)`;

            await reply(successMsg);

        } catch (error) {
            console.error('Error in group status command:', error);
            await reply(`❌ Error: ${error.message}`);
        }
    }
}
]

