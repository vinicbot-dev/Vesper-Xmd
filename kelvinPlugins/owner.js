// KelvinPlugins/owner.js
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
const { exec } = require('child_process');
const util = require('util');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { generateSettingsText } = require('../start/kelvinCmds/owner');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = [

{
        command: ['getpp', 'pp', 'profilepic', 'getprofile'],
        operate: async ({ kelvin, m, reply, quoted, Access, mess }) => {
            if (!Access) return reply(global.mess.owner);
            
            if (!quoted) {
                // React with 📷 even if no user is quoted
                await kelvin.sendMessage(m.chat, {
                    react: {
                        text: "📷",
                        key: m.key
                    }
                });
                return reply('Reply to a user to get their profile picture.');
            }

            // React with 📷 emoji to the command message
            await kelvin.sendMessage(m.chat, {
                react: {
                    text: "📷",
                    key: m.key
                }
            });

            const userId = quoted.sender;

            try {
                const ppUrl = await kelvin.profilePictureUrl(userId, 'image');

                await kelvin.sendMessage(m.chat, 
                    { 
                        image: { url: ppUrl }, 
                        caption: `⌘ *Profile Picture of:* @${userId.split('@')[0]}`,
                        mentions: [ userId ]
                    }, { quoted: m }); 
            } catch (error) {
                console.error('Error getting profile picture:', error);
                await kelvin.sendMessage(m.chat, { 
                    image: { url: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60' }, 
                    caption: '⚠️ No profile picture found.' 
                }, { quoted: m });
            }
        }
    },
    
    {
        command: ['toviewonce', 'tovo', 'tovv', 'vv'],
        operate: async ({ kelvin, m, reply, quoted, mime, Access, mess }) => {
        if (!Access) return reply(global.mess.owner) 
    try {
        if (!m.quoted) return reply('❌ Reply to a ViewOnce Video, Image, or Audio.');

        const quotedMessage = m.msg.contextInfo.quotedMessage;
        if (!quotedMessage) return reply('❌ No media found in the quoted message.');

        if (quotedMessage.imageMessage) {
            let imageCaption = quotedMessage.imageMessage.caption || '';
            let imageUrl = await kelvin.downloadAndSaveMediaMessage(quotedMessage.imageMessage);
            await kelvin.sendMessage(m.chat, { image: { url: imageUrl }, caption: imageCaption });
        }

        if (quotedMessage.videoMessage) {
            let videoCaption = quotedMessage.videoMessage.caption || '';
            let videoUrl = await kelvin.downloadAndSaveMediaMessage(quotedMessage.videoMessage);
            await kelvin.sendMessage(m.chat, { video: { url: videoUrl }, caption: videoCaption });
        }

        if (quotedMessage.audioMessage) {
            let audioUrl = await kelvin.downloadAndSaveMediaMessage(quotedMessage.audioMessage);
            await kelvin.sendMessage(m.chat, { audio: { url: audioUrl }, mimetype: 'audio/mp4' });
        }

    } catch (error) {
        console.error('Error processing vv command:', error);
        reply('❌ An error occurred while processing your request.');
    }
    
  }
},
{
    command: ['block', 'blockuser'],
    operate: async ({ kelvin, m, reply, quoted, text, mentionedJid, Access, mess }) => {
          if (!Access) return reply(global.mess.owner);
        
        if (!m.quoted && !mentionedJid[0] && !text) return reply("Reply to a message or mention/user ID to block");
        
        const userId = mentionedJid[0] || quoted?.sender || text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        
        try {
            // React with 🚫 emoji
            await kelvin.sendMessage(m.chat, {
                react: {
                    text: "🚫",
                    key: m.key
                }
            });
            
            // Block the user
            await kelvin.updateBlockStatus(userId, "block");
            reply(`✅ Successfully blocked @${userId.split('@')[0]}`);
        } catch (error) {
            console.error('Error blocking user:', error);
            reply(`❌ Failed to block user: ${error.message}`);
        }
    }
},
{
    command: ['unblock', 'unblockuser'],
    operate: async ({ kelvin, m, reply, quoted, text, mentionedJid, Access, mess }) => {
          if (!Access) return reply(global.mess.owner);
        
        if (!m.quoted && !mentionedJid[0] && !text) return reply("Reply to a message or mention/user ID to unblock");
        
        const userId = mentionedJid[0] || quoted?.sender || text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        
        try {
            // React with ✅ emoji
            await kelvin.sendMessage(m.chat, {
                react: {
                    text: "✅",
                    key: m.key
                }
            });
            
            // Unblock the user
            await kelvin.updateBlockStatus(userId, "unblock");
            reply(`✅ Successfully unblocked @${userId.split('@')[0]}`);
        } catch (error) {
            console.error('Error unblocking user:', error);
            reply(`❌ Failed to unblock user: ${error.message}`);
        }
    }
},
{
    command: ['unblockall'],
    operate: async ({ kelvin, m, reply, Access, mess }) => {
          if (!Access) return reply(global.mess.owner);
        
        try {
            const blockedList = await kelvin.fetchBlocklist();
            if (!blockedList.length) return reply("✅ No blocked contacts to unblock.");
            
            for (const user of blockedList) {
                await kelvin.updateBlockStatus(user, "unblock");
            }
            
            reply(`✅ Successfully unblocked *${blockedList.length}* contacts.`);
        } catch (error) {
            console.error('Error unblocking all contacts:', error);
            reply("⚠️ Failed to unblock all contacts.");
        }
    }
},
{
    command: ['listblocked', 'blockedlist', 'showblocked'],
    operate: async ({ kelvin, m, reply, Access, mess }) => {
          if (!Access) return reply(global.mess.owner);
        
        try {
            const blockedList = await kelvin.fetchBlocklist();
            
            if (!blockedList.length) {
                return reply('✅ No contacts are currently blocked.');
            }
            
            // React with 🚫 emoji
            await kelvin.sendMessage(m.chat, {
                react: {
                    text: "🚫",
                    key: m.key
                }
            });
            
            let blockedUsers = blockedList.map((user, index) => `🔹 *${index + 1}.* @${user.split('@')[0]}`).join('\n');
            
            await kelvin.sendMessage(m.chat, {
                text: `🚫 *Blocked Contacts:*\n\n${blockedUsers}`,
                mentions: blockedList
            }, { quoted: m });
            
        } catch (error) {
            console.error('Error fetching blocked contacts:', error);
            reply('⚠️ Unable to fetch blocked contacts.');
        }
    }
},
{
    command: [ 'delpp', 'removepfp', 'deleteprofilepic'],
    operate: async ({ kelvin, m, reply, Access, mess }) => {
          if (!Access) return reply(global.mess.owner);
        
        try {
            
            await kelvin.removeProfilePicture(kelvin.user.id);
            reply("✅ Successfully deleted profile picture");
        } catch (error) {
            console.error('Error removing profile picture:', error);
            reply("❌ Failed to delete profile picture");
        }
    }
},
{
    command: ['creategc', 'creategroup'],
    operate: async ({ kelvin, m, reply, args, prefix, command, Access }) => {
          if (!Access) return reply(global.mess.owner);
        
        if (!args.join(" ")) return reply(`*Example: ${prefix + command} Group Name*`);
        
        try {
            // Create the group
            const createdGroup = await kelvin.groupCreate(args.join(" "), []);
            
            // Get the group invite link
            const inviteCode = await kelvin.groupInviteCode(createdGroup.id);
            
            // Format the creation time
            const creationTime = moment(createdGroup.creation * 1000)
                .tz("Asia/Kolkata")
                .format("DD/MM/YYYY HH:mm:ss");
            
            // Create message text
            const messageText = `     「 Create Group 」

▸ Name : ${createdGroup.subject}
▸ Owner : @${createdGroup.owner.split("@")[0]}
▸ Creation : ${creationTime}

https://chat.whatsapp.com/${inviteCode}`;
            
            // Send the message
            await kelvin.sendMessage(
                m.chat,
                { 
                    text: messageText, 
                    mentions: await kelvin.parseMention(messageText)
                },
                { quoted: m }
            );
            
        } catch (error) {
            console.error('Create group error:', error);
            reply('✅ Group created successfully!');
        }
    }
},
{
    command: ['restart', 'reboot'],
    operate: async ({ kelvin, m, reply, Access, getSetting, botNumber, pushname }) => {
          if (!Access) return reply(global.mess.owner);
        
        try {
            const botName = getSetting(botNumber, 'botname', 'Jexploit');
            
            await reply(`*Restarting ${botName} Bot...*\n\nPlease wait 10-15 seconds for the bot to restart.`);
            
            // A small delay to ensure the message is sent
            await sleep(2000);
            
            // Log the restart action
            console.log(chalk.yellow.bold(`Bot restart initiated by ${pushname} (${m.sender})`));
            
            // Send a goodbye message
            await kelvin.sendMessage(m.chat, {
                text: '*Bot is restarting...*\n\nPlease wait a moment while I restart.',
                mentions: [m.sender]
            });
            
            // Add a small delay before actual restart
            await sleep(1000);
            
            // Close the connection gracefully if available
            if (kelvin && typeof kelvin.end === 'function') {
                await kelvin.end();
            }
            
            // Restart the process
            process.exit(0);
            
        } catch (error) {
            console.error('Error during restart:', error);
            reply('❌ *Failed to restart bot.* Please restart manually.');
        }
    }
},
{
    command: ['join', 'joingroup'],
    operate: async ({ kelvin, m, reply, prefix, args, Access, text, isUrl }) => {
          if (!Access) return reply(global.mess.owner);
        
        if (!text) return reply("Enter group link");
        if (!isUrl(args[0]) && !args[0].includes("whatsapp.com")) return reply("Invalid link");

        try {
            const link = args[0].split("https://chat.whatsapp.com/")[1];
            await kelvin.groupAcceptInvite(link);
            reply("✅ Joined successfully");
        } catch (error) {
            console.error(error);
            reply("❌ Failed to join group. Reason: " + (error.message || "Invalid link or bot is banned"));
        }
    }
},
{
    command: ['groupjids', 'gjids', 'allgroups', 'groupslist'],
    operate: async ({ kelvin, m, reply, prefix, args, Access, text }) => {
          if (!Access) return reply(global.mess.owner);
        
        reply("📝 Fetching all groups...");
        
        try {
            const groups = await kelvin.groupFetchAllParticipating();
            const groupList = Object.keys(groups);
            
            if (groupList.length === 0) {
                return reply("❌ No groups found. The bot is not in any groups.");
            }
            
            let groupInfo = `📊 *TOTAL GROUPS:* ${groupList.length}\n\n`;
            
            for (let i = 0; i < groupList.length; i++) {
                const groupId = groupList[i];
                const group = groups[groupId];
                const groupName = group.subject || "Unnamed Group";
                const participants = group.participants ? group.participants.length : 0;
                
                groupInfo += `*${i + 1}. ${groupName}*\n`;
                groupInfo += `   👥 Members: ${participants}\n`;
                groupInfo += `   🆔 JID: ${groupId}\n\n`;
            }
            
            // If message is too long, split it
            if (groupInfo.length > 4000) {
                const chunks = groupInfo.match(/.{1,4000}/g);
                for (let i = 0; i < chunks.length; i++) {
                    await reply(`📝 *GROUP LIST (Part ${i + 1}/${chunks.length})*\n\n${chunks[i]}`);
                    await sleep(500);
                }
            } else {
                reply(groupInfo);
            }
            
        } catch (error) {
            console.error(error);
            reply("❌ Failed to fetch groups: " + error.message);
        }
    }
},
{
    command: ['request'],
    operate: async ({ kelvin, m, reply, prefix, args, Access, text, sender, pushname }) => {
          if (!Access) return reply(global.mess.owner);
        
        if (!text) return reply(`Example: ${prefix}request I would like a new feature (specify) to be added.`);

        const requestMsg = `
*REQUEST*

*User*: @${sender.split("@")[0]}
*Request*: ${text}
        `;

        const confirmationMsg = `
Hi ${pushname},

Your request has been forwarded to my developer.
Please wait for a reply.

*Details:*
${requestMsg}
        `;

        await kelvin.sendMessage("256742932677@s.whatsapp.net", { text: requestMsg, mentions: [sender] }, { quoted: m });
        await kelvin.sendMessage(m.chat, { text: confirmationMsg, mentions: [sender] }, { quoted: m });
    }
},
{
    command: ['reportbug'],
    operate: async ({ kelvin, m, reply, prefix, args, Access, text, sender, pushname }) => {
          if (!Access) return reply(global.mess.owner);
        
        if (!text) return reply(`Example: ${prefix}reportbug Hey, play command isn't working`);

        const bugReportMsg = `
*BUG REPORT*

*User*: @${sender.split("@")[0]}
*Issue*: ${text}
        `;

        const confirmationMsg = `
Hi ${pushname},

Your bug report has been forwarded to my developer.
Please wait for a reply.

*Details:*
${bugReportMsg}
        `;

        await kelvin.sendMessage("256742932677@s.whatsapp.net", { text: bugReportMsg, mentions: [sender] }, { quoted: m });
        await kelvin.sendMessage(m.chat, { text: confirmationMsg, mentions: [sender] }, { quoted: m });
    }
},
{
    command: ['delete', 'del'],
    operate: async ({ kelvin, m, reply, prefix, args, Access, quoted }) => {
          if (!Access) return reply(global.mess.owner);
        
        if (!quoted) return reply(`*Please reply to a message*`);

        try {
            // Delete the quoted message
            await kelvin.sendMessage(m.chat, {
                delete: {
                    remoteJid: quoted.fakeObj.key.remoteJid,
                    fromMe: quoted.fakeObj.key.fromMe,
                    id: quoted.fakeObj.key.id,
                    participant: quoted.fakeObj.participant,
                }
            });

            // Delete the command message
            await kelvin.sendMessage(m.chat, {
                delete: {
                    remoteJid: m.key.remoteJid,
                    fromMe: m.key.fromMe,
                    id: m.key.id,
                    participant: m.key.participant,
                }
            });

        } catch (err) {
            console.error(err);
            reply("⚠️ Failed to delete message.");
        }
    }
},
{
    command: ['online'],
    operate: async ({ kelvin, m, reply, prefix, args, Access, text, botNumber }) => {
          if (!Access) return reply(global.mess.owner);
        if (!text) return reply(`Options: all/match_last_seen\nExample: ${prefix + command} all`);

        const validOptions = ["all", "match_last_seen"];
        if (!validOptions.includes(args[0])) return reply("Invalid option");

        await kelvin.updateOnlinePrivacy(text);
        await reply('Done');
    }
},
{
    command: ['readreceipts'],
    operate: async ({ kelvin, m, reply, prefix, args, Access, text }) => {
          if (!Access) return reply(global.mess.owner);
        if (!text) return reply(`Options: all/none\nExample: ${prefix + command} all`);

        const validOptions = ["all", "none"];
        if (!validOptions.includes(args[0])) return reply("Invalid option");

        await kelvin.updateReadReceiptsPrivacy(text);
        await reply('Done');
    }
},
{
    command: ['setpp'],
    operate: async ({ kelvin, m, reply, prefix, args, Access, quoted, mime, botNumber, getBuffer }) => {
          if (!Access) return reply(global.mess.owner);
        if (!quoted) return reply(`*Send or reply to an image With captions ${prefix}setpp*`);
        if (!/image/.test(mime)) return reply(`*Send or reply to an image With captions ${prefix}setpp*`);
        if (/webp/.test(mime)) return reply(`*Send or reply to an image With captions ${prefix}setpp*`);

        const fs = require('fs');
        const medis = await kelvin.downloadAndSaveMediaMessage(quoted, "ppbot.jpeg");

        if (args[0] === "full") {
            const generateFullProfilePic = async (imagePath) => {
                const Jimp = require('jimp');
                const jimp = await Jimp.read(imagePath);
                const min = jimp.getWidth();
                const max = jimp.getHeight();
                const cropped = jimp.crop(0, 0, min, max);
                return {
                    img: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG)
                };
            };
            
            const { img } = await generateFullProfilePic(medis);
            await kelvin.query({
                tag: "iq",
                attrs: {
                    to: botNumber,
                    type: "set",
                    xmlns: "w:profile:picture",
                },
                content: [
                    {
                        tag: "picture",
                        attrs: {
                            type: "image",
                        },
                        content: img,
                    },
                ],
            });
            fs.unlinkSync(medis);
            reply('Done');
        } else {
            await kelvin.updateProfilePicture(botNumber, {
                url: medis,
            });
            fs.unlinkSync(medis);
            reply('Done');
        }
    }
},
{
    command: ['readreceipt', 'readprivacy'],
    operate: async ({ kelvin, m, reply, prefix, args, Access, text }) => {
          if (!Access) return reply(global.mess.owner);
        if (!text) return reply(`*Usage:* ${prefix}readprivacy [option]\n\n*Options:* all, contacts, none\n*Example:* ${prefix}readprivacy all`);

        const validOptions = ["all", "contacts", "none"];
        const option = args[0].toLowerCase();

        if (!validOptions.includes(option)) {
            return reply(`❌ *Invalid option!*\n\nValid options: ${validOptions.join(', ')}\nExample: ${prefix}readprivacy all`);
        }

        try {
            await kelvin.updateReadReceiptsPrivacy(option);
            
            const getReadReceiptDescription = (opt) => {
                const descriptions = {
                    all: "• Everyone can see your read receipts\n• Shows blue ticks for all messages",
                    contacts: "• Only your contacts can see read receipts\n• Others see single gray ticks",
                    none: "• No one can see your read receipts\n• Shows only single gray ticks for everyone"
                };
                return descriptions[opt] || "Unknown option";
            };
            
            reply(`✅ *Read receipts privacy set to:* ${option.toUpperCase()}\n\n*What this means:*\n${getReadReceiptDescription(option)}`);
        } catch (error) {
            console.error('Error setting read receipts privacy:', error);
            reply('❌ *Failed to update read receipts settings.* Please try again.');
        }
    }
},
{
    command: ['deletepp', 'delpp'],
    operate: async ({ kelvin, m, reply, Access }) => {
          if (!Access) return reply(global.mess.owner);
        
        try {
            await kelvin.removeProfilePicture(kelvin.user.id);
            reply("*Successfully deleted profile pic*");
        } catch (error) {
            console.error(error);
            reply("⚠️ Failed to delete profile picture.");
        }
    }
},
{
    command: ['setprefix'],
    operate: async ({ kelvin, m, reply, args, prefix, botNumber, getSetting, updateSetting, Access, mess }) => {
        if (!Access) return reply(global.mess.owner);
        
        const newPrefix = args[0];
        if (!newPrefix || newPrefix.length < 1 || newPrefix.length > 3) {
            return reply(`❌ Usage: ${prefix}setprefix <new_prefix>\nExample: ${prefix}setprefix !\nNote: Prefix must be 1-3 characters`);
        }
        
        if (newPrefix.includes(' ')) {
            return reply('❌ Prefix cannot contain spaces');
        }
        
        // Get current prefix before update
        const oldPrefix = getSetting(botNumber, 'prefix', '.');
        
        
        const success = updateSetting(botNumber, 'prefix', newPrefix);
        
        if (success) {
            // Update local variable
            prefix = newPrefix;
            
            reply(`✅ Prefix updated to ${newPrefix}`);
        } else {
            reply('❌ Failed to update prefix');
        }
    }
},
{
    command: ['setownername'],
    operate: async ({ kelvin, m, reply, args, text, prefix, botNumber, getSetting, updateSetting, Access, mess }) => {
        if (!Access) return reply(global.mess.owner);
        
        if (!text) {
            return reply(`*SET OWNER NAME*\n\n*Usage:* ${prefix}setownername [new owner name]\n*Example:* ${prefix}setownername Kelvin Tech\n\n*Current owner name:* ${getSetting(botNumber, 'ownername', 'Not set')}`);
        }

        try {
            // Validate name length
            if (text.length > 30) {
                return reply('*Owner name too long!* Maximum 30 characters allowed.');
            }
            
            if (text.length < 2) {
                return reply('*Owner name too short!* Minimum 2 characters required.');
            }

            await updateSetting(botNumber, 'ownername', text.trim());

            // Simple success message
            reply(`✅ Owner name set to: ${text.trim()}`);

        } catch (error) {
            console.error('Error in setownername command:', error);
            reply('*Failed to update owner name.* Please try again.');
        }
    }
},
{
    command: ['setownernumber'],
    operate: async ({ kelvin, m, reply, args, prefix, command, botNumber, getSetting, updateSetting, Access, mess }) => {
        if (!Access) return reply(global.mess.owner);
        
        if (args.length < 1) return reply(`Example: ${prefix + command} 256755585369\n\nThis will change the owner's number in the database`);

        // Join all arguments to capture the full number including spaces
        let fullInput = args.join(' ');
        let newNumber = fullInput.replace(/\D/g, '');

        console.log(`Input: ${fullInput}, Extracted Number: ${newNumber}`); // Debug log

        if (newNumber.startsWith('0')) {
            return reply("⚠️ Phone numbers should not start with *0*. Use the full international format (e.g., *256...* instead of *07...*)");
        }

        if (newNumber.length < 5 || newNumber.length > 15) {
            return reply(`⚠️ Please provide a valid phone number (5-15 digits)\n\nYou provided: ${newNumber.length} digits: ${newNumber}`);
        }

        // Store the old number for comparison
        const oldNumber = getSetting(botNumber, 'ownernumber', 'Not set');

        // Update owner number in SettingsManager
        await updateSetting(botNumber, 'ownernumber', newNumber);

        // Update owner array in global
        const newOwnerJid = newNumber + "@s.whatsapp.net";
        global.owner = [newOwnerJid]; // Replace entire array with new owner

        // Update sudo array if needed
        if (!global.sudo) global.sudo = [];
        if (!global.sudo.includes(newOwnerJid)) {
            global.sudo.push(newOwnerJid);
        }

        reply(`✅ Owner number set to: ${newNumber}`);
    }
},
{
    command: ['delsudo'],
    operate: async ({ kelvin, m, reply, text, mentionedJid, quoted, Access, mess }) => {
        if (!Access) return reply(global.mess.owner);
        
        if (m.chat.endsWith('@g.us') && !(mentionedJid && mentionedJid[0]) && !(quoted && quoted.sender)) {
            return reply('Reply to or tag a person!');
        }

        let mentionedUser = mentionedJid && mentionedJid[0];
        let quotedUser = quoted && quoted.sender;
        let userToRemove = mentionedUser || quotedUser || (text ? text.replace(/\D/g, "") + "@s.whatsapp.net" : null) || m.chat;

        if (!userToRemove) return reply('Mention a user or reply to their message to remove them from the sudo list.');

        const sudoList = global.sudo;
        const index = sudoList.indexOf(userToRemove);

        if (index !== -1) {
            sudoList.splice(index, 1);
            await reply(`+${userToRemove.split('@')[0]} removed from the sudo list.`);
        } else {
            await reply(`+${userToRemove.split('@')[0]} is not in the sudo list.`);
        }
    }
},
{
    command: ['addowner', 'addsudo'],
    operate: async ({ kelvin, m, reply, text, mentionedJid, quoted, botNumber, Access, mess, addSudo }) => {
        if (!Access) return reply(global.mess.owner);
        
        if (m.chat.endsWith('@g.us') && !(mentionedJid && mentionedJid[0]) && !(quoted && quoted.sender)) {
            return reply('Reply to or tag a person!');
        }

        let mentionedUser = mentionedJid && mentionedJid[0];
        let quotedUser = quoted && quoted.sender;
        let userToAdd = mentionedUser || quotedUser || (text ? text.replace(/\D/g, "") + "@s.whatsapp.net" : null) || m.chat;

        if (!userToAdd) return reply('Mention a user or reply to their message to add them to the sudo list.');

        // Add to database.json
        const success = await addSudo(botNumber, userToAdd);
        
        if (success) {
            // Also update global.sudo for immediate use
            if (!global.sudo) global.sudo = [];
            if (!global.sudo.includes(userToAdd)) {
                global.sudo.push(userToAdd);
            }
            await reply(`✅ +${userToAdd.split('@')[0]} added to the sudo list.\nThey can now use any function of the bot even in private mode.`);
        } else {
            await reply(`ℹ️ +${userToAdd.split('@')[0]} is already a sudo user.`);
        }
    }
},
{
    command: ['listsudo'],
    operate: async ({ kelvin, m, reply, botNumber, Access, mess, getSudo }) => {
        if (!Access) return reply(global.mess.owner);
        
        // Get sudo list from database.json
        const sudoList = getSudo(botNumber);
        
        // Also sync with global.sudo for consistency
        global.sudo = sudoList;

        if (sudoList.length === 0) {
            reply('The sudo list is empty.');
        } else {
            let sudoText = '*SUDO USERS LIST*\n\n';
            sudoList.forEach((jid, index) => {
                const number = jid.split('@')[0];
                sudoText += `${index + 1}. wa.me/${number}\n`;
            });
            sudoText += `\nTotal: ${sudoList.length} user(s)`;
            reply(sudoText);
        }
    }
},
{
    command: ['settings', 'config'],
    operate: async ({ kelvin, m, reply, botNumber, getSetting, Access, mess }) => {
        if (!Access) return reply(global.mess.owner);
        
        // Get current prefix
        const currentPrefix = getSetting(botNumber, 'prefix', '.');
        
        // Generate settings text using the function
        const settingsText = generateSettingsText(botNumber, currentPrefix);
        
        reply(settingsText);
    }
}
            

];