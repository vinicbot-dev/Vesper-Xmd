// activeusers.js
module.exports = [
{
    command: ['listactive', 'activeusers'],
    operate: async ({ kelvin, m, reply, isGroup, getInactiveUsers, getActiveUsers,  from, groupName }) => {
        if (!isGroup) return reply(global.mess.notgroup);
            
        
        const activeUsers = getActiveUsers(from, 15);
        
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
    operate: async ({ kelvin, m, reply, isGroup, getActiveUsers, getInactiveUsers, from, groupName }) => {
        if (!isGroup) return reply(global.mess.notgroup);
        
        try {
            const metadata = await kelvin.groupMetadata(from);
            const allParticipants = metadata.participants.map(p => p.id);
            const inactiveUsers = getInactiveUsers(from, allParticipants);
            
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
            reply('❌ *Error fetching group data!*');
        }
    }
},
{
    command: ['groupactivity', 'activity'],
    operate: async ({ kelvin, m, reply, isGroup, from, getActiveUsers, getInactiveUsers, groupName }) => {
        if (!isGroup) return reply(global.mess.notgroup);
        
        try {
            const metadata = await kelvin.groupMetadata(from);
            const allParticipants = metadata.participants.map(p => p.id);
            const activeUsers = getActiveUsers(from, 1000);
            const inactiveUsers = getInactiveUsers(from, allParticipants);
            
            let message = `📊 *GROUP ACTIVITY - ${groupName || 'This Group'}*\n\n`;
            message += `*Total Members:* ${allParticipants.length}\n`;
            message += `✅ *Active Users:* ${activeUsers.length}\n`;
            message += `*Inactive Users:* ${inactiveUsers.length}\n\n`;
            
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
            reply('❌ *Error fetching group activity!*');
        }
    }
},
{
    command: ['kickinactive', 'removeinactive'],
    operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin, getActiveUsers, getInactiveUsers, from, prefix }) => {
        if (!isGroup) return reply(global.mess.notgroup);
        if (!isSenderAdmin) return reply(global.mess.notadmin);

        try {
            const metadata = await kelvin.groupMetadata(from);
            const allParticipants = metadata.participants.map(p => p.id);
            const groupAdmins = metadata.participants.filter(p => p.admin).map(p => p.id);
            
            const inactiveUsers = getInactiveUsers(from, allParticipants)
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
    operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin, from, prefix }) => {
        if (!m.isGroup) return reply(mess.notgroup);
        if (!isSenderAdmin) return reply(global.mess.notadmin);
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
        if (!isSenderAdmin) return reply(global.mess.notadmin);

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
            
    if (!(isSenderAdmin || Access)) return reply(global.mess.notadmin);

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
            if (!isSenderAdmin) return reply(global.mess.notadmin);

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
            if (!isSenderAdmin) return reply(global.mess.notadmin);
            if (!isBotAdmin) return reply(global.mess.botnotadmin);
            
            kelvin.groupSettingUpdate(m.chat, "announcement");
            reply("Group closed by admin. Only admins can send messages.");
        }
    },
    {
        command: ['delgrouppp'],
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin, from }) => {
            if (!isGroup) return reply(global.mess.notgroup);
            if (!isSenderAdmin) return reply(global.mess.notadmin);
            
            await kelvin.removeProfilePicture(from);
            reply("Group profile picture has been successfully removed.");
        }
    },
    {
        command: ['setdesc'],
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin, text }) => {
            if (!isGroup) return reply(global.mess.notgroup);
            if (!isSenderAdmin) return reply(global.mess.notadmin);
            
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
            if (!isSenderAdmin) return reply(global.mess.notadmin);

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
            if (!isGroup) return reply(global.mess.notgroup);
            if (!isSenderAdmin) return reply(global.mess.notadmin);
            
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
            if (!isSenderAdmin) return reply(global.mess.notadmin);
            
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
        command: ['listrequest'],
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin }) => {
            if (!isGroup) return reply(global.mess.notgroup);
            if (!isSenderAdmin) return reply(global.mess.notadmin);
            
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
            if (!isGroupAdmins) return reply(global.mess.done);
            
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
            if (!isSenderAdmin) return reply(global.mess.notadmin);
           
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
                reply("❌ *Failed to promote user. They might already be an admin or the bot lacks permissions.*");
            }
        }
    },
    {
        command: ['demote', 'downgrade'],
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin, text, mentionedJid, quoted }) => {
            if (!isGroup) return reply(global.mess.notgroup);
            if (!isSenderAdmin) return reply(global.mess.notadmin);
        
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
                reply("❌ *Failed to demote user. They might already be a member or the bot lacks permissions.*");
            }
        }
    },
    {
        command: ['admins', 'listadmins', 'adminlist'],
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
                    adminList += `👮 *ADMINS* (${regularAdmins.length})\n`;
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
                
                reply('❌ *Failed to get admin list.* Please try again.');
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
            if (!isSenderAdmin) return reply(global.mess.notadmin);

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
            if (!isSenderAdmin) return reply(global.mess.notadmin);
           
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
            if (!Access) return reply('*You are not my owner* 😜!');
            if (!isGroup) return reply('*This command can only be used in groups.*');

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
                if (!isSenderAdmin) return reply(global.mess.notadmin);
                
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
                if (!isSenderAdmin) return reply(global.mess.notadmin);
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
                if (!isSenderAdmin) return reply(global.mess.notadmin);
                await kelvin.groupSettingUpdate(from, 'unlocked');
                reply("🔓 Group settings are now unlocked (all participants)", {
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true
                    }
                });

            } catch (error) {
                console.error("UnlockGS Error:", error);
                reply("❌ Failed to unlock group settings");
            }
        }
    },
    {
        command: ['adminapproval'],
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin, from }) => {
            try {
                if (!isGroup) return reply(global.mess.notgroup);
                if (!isSenderAdmin) return reply(global.mess.notadmin);
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
            if (!isSenderAdmin) return reply(global.mess.notadmin);
            
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
            if (!isSenderAdmin) return reply(global.mess.notadmin);

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
        command: ['totalmembers'],
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin, groupMetadata, participants }) => {
            if (!isGroup) return reply(global.mess.notgroup);
            if (!isSenderAdmin) return reply(global.mess.notadmin);

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
        command: ['mediatag'],
        operate: async ({ kelvin, m, reply, prefix, isGroup, isSenderAdmin, quoted, participants }) => {
            if (!isGroup) return reply(global.mess.notgroup);
            if (!isSenderAdmin) return reply(global.mess.notadmin);
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
        operate: async ({ kelvin, m, reply, prefix, args, isGroup, isSenderAdmin, isBotAdmin, getSetting, updateSetting, botNumber }) => {
            if (!isGroup) return reply(global.mess.notgroup);
            if (!isSenderAdmin) return reply(global.mess.notadmin);
            if (!isBotAdmin) return reply (global.mess.botadmin)
            
            const subcommand = args[0]?.toLowerCase();
            const action = args[1]?.toLowerCase();
            
            if (!subcommand) {
                return reply(`🔗 *Anti-Link System*
                
Usage:
• ${prefix}antilink delete on/off - Delete mode
• ${prefix}antilink warn on/off - Warn mode  
• ${prefix}antilink kick on/off - Kick mode
• ${prefix}antilink status - Show settings

Current Mode: ${getSetting(botNumber, 'antilinkaction', 'delete')}`);
            }
            
            if (subcommand === 'status') {
                const mode = getSetting(botNumber, 'antilinkaction', 'delete');
                const isEnabled = getSetting(botNumber, 'antilinkdelete', true);
                
                reply(`🔗 *Anti-Link Status*
                
• Enabled: ${isEnabled ? '✅ ON' : '❌ OFF'}
• Mode: ${mode}
• Action: ${mode === 'delete' ? 'Delete messages' : 
                   mode === 'warn' ? 'Delete + warn (3 warnings = kick)' : 
                   'Delete + kick'}`);
                return;
            }
            
            if (!['delete', 'warn', 'kick'].includes(subcommand) || !['on', 'off'].includes(action)) {
                reply(`❌ Invalid. Use:\n• ${prefix}antilink delete on/off\n• ${prefix}antilink warn on/off\n• ${prefix}antilink kick on/off`);
                return;
            }
            
            // Set the mode
            await updateSetting(botNumber, 'antilinkaction', subcommand);
            
            // Turn on/off
            const boolValue = action === 'on';
            await updateSetting(botNumber, 'antilinkdelete', boolValue);
            
            reply(`✅ Anti-link ${subcommand} mode ${boolValue ? 'enabled' : 'disabled'}`);
        }
    },
    {
        command: ['antitag'],
        operate: async ({ kelvin, m, reply, prefix, args, isGroup, isSenderAdmin, getSetting, updateSetting, botNumber }) => {
            if (!isGroup) return reply(global.mess.notgroup);
            if (!isSenderAdmin) return reply(global.mess.notadmin);
            
            const subcommand = args[0]?.toLowerCase();
            const action = args[1]?.toLowerCase();
            
            if (!subcommand) {
                return reply(`🏷️ *Anti-Tag System*
                
Usage:
• ${prefix}antitag delete on/off - Delete mode
• ${prefix}antitag warn on/off - Warn mode  
• ${prefix}antitag kick on/off - Kick mode
• ${prefix}antitag status - Show settings

Current Mode: ${getSetting(botNumber, 'antitagaction', 'delete')}`);
            }
            
            if (subcommand === 'status') {
                const mode = getSetting(botNumber, 'antitagaction', 'delete');
                const isEnabled = getSetting(botNumber, 'antitag', false);
                
                reply(`🏷️ *Anti-Tag Status*
                
• Enabled: ${isEnabled ? '✅ ON' : '❌ OFF'}
• Mode: ${mode}
• Action: ${mode === 'delete' ? 'Delete messages' : 
                   mode === 'warn' ? 'Delete + warn' : 
                   'Delete + kick'}`);
                return;
            }
            
            if (!['delete', 'warn', 'kick'].includes(subcommand) || !['on', 'off'].includes(action)) {
                reply(`❌ Invalid. Use:\n• ${prefix}antitag delete on/off\n• ${prefix}antitag warn on/off\n• ${prefix}antitag kick on/off`);
                return;
            }
            
            // Set the mode
            await updateSetting(botNumber, 'antitagaction', subcommand);
            
            // Turn on/off
            const boolValue = action === 'on';
            await updateSetting(botNumber, 'antitag', boolValue);
            
            reply(`✅ Anti-tag ${subcommand} mode ${boolValue ? 'enabled' : 'disabled'}`);
        }
    },
    {
        command: ['tagall2'],
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin, participants, from }) => {
            try {
                if (!isGroup) return reply("❌ This command can only be used in groups");
                if (!isSenderAdmin) return reply(global.mess.notadmin);

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
            if (!isSenderAdmin) return reply('*You are not a group admin*');
            kelvin.groupSettingUpdate(m.chat, "not_announcement");
            reply("Group opened by admin. Members can now send messages.");
        }
    },
    {
        command: ['add'],
        operate: async ({ kelvin, m, reply, prefix, isGroup, isSenderAdmin, text, quoted }) => {
              if (!m.isGroup) return reply(global.mess.notgroup);
        if (!isSenderAdmin) return reply(mess.notadmin);
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
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin, text, mentionedJid, quoted }) => {
            if (!isGroup) return reply(global.mess.notgroup);
            if (!isSenderAdmin) return reply(global.mess.notadmin);

            let bck = mentionedJid[0]
                ? mentionedJid[0]
                : quoted
                ? quoted.sender
                : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
            await kelvin.groupParticipantsUpdate(m.chat, [bck], "remove");
            reply(global.mess.done);
        }
    },
    {
        command: ['kick2'],
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin, mentionedJid, quoted, from }) => {
            try {
                if (!isGroup) return reply(global.mess.notgroup);
                if (!isSenderAdmin) return reply(global.mess.notadmin);
            
                const userId = mentionedJid?.[0] || quoted?.sender;
                if (!userId) return reply("ℹ️ Please mention or quote the user to kick");

                await kelvin.groupParticipantsUpdate(from, [userId], "remove");
                reply(`✅ User @${userId.split('@')[0]} has been removed`, { 
                    mentions: [userId],
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true
                    }
                });

            } catch (error) {
                console.error("Kick Error:", error);
                reply("❌ Failed to remove user from group");
            }
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
                reply("❌ Failed to get group information");
            }
        }
    },
    {
        command: ['resetlinkgc'],
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin, from }) => {
            if (!isGroup) return reply('*This command can only be used in groups.*');
            if (!isSenderAdmin) return reply(global.mess.notadmin);

            kelvin.groupRevokeInvite(from);
            reply("*group link reseted by admin*");
        }
    },
   
{
    command: ['antidemote'],
    operate: async ({ m, reply, prefix, args, Access, botNumber, kelvin }) => {
        if (!m.isGroup) return reply(global.notgroup);
        if (!Access) return reply(mess.owner);
        
        const action = args[0]?.toLowerCase();
        
        
        if (!action || !['on', 'off'].includes(action)) {
            const isEnabled = global.settingsManager?.getSetting(botNumber, 'antidemote', true);
            return reply(`*Anti-Demote:* ${isEnabled ? '✅ ON' : '❌ OFF'}\n${prefix}antidemote on/off`);
        }
        
        if (action === 'on') {
            await global.settingsManager?.updateSetting(botNumber, 'antidemote', true);
            reply(`✅ *Antidemote successfully enabled*`);
        } else {
            await global.settingsManager?.updateSetting(botNumber, 'antidemote', false);
            reply(`✅ *Antidemote successfully disabled*`);
        }
    }
},
{
    command: ['antipromote'],
    operate: async ({ m, reply, prefix, args, Access, botNumber, kelvin }) => {
        if (!m.isGroup) return reply(global.notgroup);
        if (!Access) return reply(mess.owner);
        
        const action = args[0]?.toLowerCase();
        
        if (!action || !['on', 'off'].includes(action)) {
            const isEnabled = global.settingsManager?.getSetting(botNumber, 'antipromote', true);
            return reply(`*Anti-Promote:* ${isEnabled ? '✅ ON' : '❌ OFF'}\n${prefix}antipromote on/off`);
        }
        
        if (action === 'on') {
            await global.settingsManager?.updateSetting(botNumber, 'antipromote', true);
            reply(`✅ *Antipromote successfully enabled*`);
        } else {
            await global.settingsManager?.updateSetting(botNumber, 'antipromote', false);
            reply(`✅ *Antipromote successfully disabled*`);
        }
    }
},
{
    command: ['antitagadmin'],
    operate: async ({ m, reply, prefix, args, Access, botNumber, kelvin }) => {
        if (!m.isGroup) return reply(global.notgroup);
        if (!Access) return reply(mess.owner);
        
        const action = args[0]?.toLowerCase();
        
        if (!action || !['on', 'off'].includes(action)) {
            const isEnabled = global.settingsManager?.getSetting(botNumber, 'antitagadmin', false);
            return reply(`*Anti-Tag Admin:* ${isEnabled ? '✅ ON' : '❌ OFF'}\n${prefix}antitagadmin on/off`);
        }
        
        if (action === 'on') {
            await global.settingsManager?.updateSetting(botNumber, 'antitagadmin', true);
            reply(`✅ *Antitagadmin successfully enabled*`);
        } else {
            await global.settingsManager?.updateSetting(botNumber, 'antitagadmin', false);
            reply(`✅ *Antitagadmin successfully disabled*`);
        }
    }
},
    {
        command: ['userjid', 'userid'],
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin }) => {
            if (!isGroup) return reply(global.mess.notgroup);
            if (!isSenderAdmin) return reply(global.mess.notadmin);
            
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
            if (!isSenderAdmin) return reply(global.mess.notadmin);

            await kelvin.groupToggleEphemeral(m.chat, 90*24*3600);
            reply('Dissapearing messages successfully turned on for 90 days!');
        }
    },
    {
        command: ['dispoff'],
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin }) => {
            if (!isGroup) return reply(global.mess.notgroup);
            if (!isSenderAdmin) return reply(global.mess.notadmin);

            await kelvin.groupToggleEphemeral(m.chat, 0);
            reply('Dissapearing messages successfully turned off!');
        }
    },
    {
        command: ['disp24hours'],
        operate: async ({ kelvin, m, reply, isGroup, isSenderAdmin}) => {
            if (!isGroup) return reply(global.mess.notgroup);
            if (!isSenderAdmin) return reply(global.mess.notadmin);

            await kelvin.groupToggleEphemeral(m.chat, 1*24*3600);
            reply('Dissapearing messages successfully turned on for 24hrs!');
        }
    }

]

