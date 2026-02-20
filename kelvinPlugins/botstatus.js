
const { runtime,
formatSize,
getBuffer
 } = require('../start/lib/myfunction');
 const moment = require('moment-timezone');
 const os = require('os');
 const { performance } = require("perf_hooks");
const fetch = require('node-fetch');
const axios = require('axios');
const checkDiskSpace = require('check-disk-space').default;

// Function to check bandwidth (simplified version)
async function checkBandwidth() {
    return {
        download: formatSize(0), // You can implement actual bandwidth tracking
        upload: formatSize(0)    // You can implement actual bandwidth tracking
    };
}

module.exports = [

{
        command: ['ping', 'p'],
        operate: async ({ m, kelvin, botNumber }) => {
            const startTime = performance.now();

            try {
                const sentMessage = await kelvin.sendMessage(m.chat, {
                    text: "🔸Pong!",
                    contextInfo: { quotedMessage: m.message }
                });
                
                const endTime = performance.now();
                const latency = `${(endTime - startTime).toFixed(2)} ms`;
                
                await kelvin.sendMessage(m.chat, {
                    text: `*🏓 ${global.botname} Speed:* ${latency}`,
                    edit: sentMessage.key, 
                    contextInfo: { quotedMessage: m.message }
                });

            } catch (error) {
                console.error('Error sending ping message:', error);
                await kelvin.sendMessage(m.chat, {
                    text: 'An error occurred while trying to ping.',
                    contextInfo: { quotedMessage: m.message }
                });
            }
        }
    },
    {
        command: ['alive'],
        operate: async ({ kelvin, m, reply, botNumber }) => {
            const botUptime = runtime(process.uptime());
            
            // Array of image URLs
            const imageUrls = [
                "https://files.catbox.moe/qhgj50.jpg",
                "https://files.catbox.moe/0pab6g.jpg"
            ];
            
            // Array of audio URLs
            const audioUrls = [
                "https://files.catbox.moe/ndrrz3.mp3",
                "https://files.catbox.moe/yny58w.mp3",
                "https://files.catbox.moe/ckie6b.m4a",
                 "https://files.catbox.moe/sbaian.mp3",
                "https://files.catbox.moe/e0dwjw.mp3",
                "https://files.catbox.moe/zhr5m2.mp3"
            ];
            
            // Randomly select an image URL
            const randomImageUrl = imageUrls[Math.floor(Math.random() * imageUrls.length)];
            
            // Randomly select an audio URL
            const randomAudioUrl = audioUrls[Math.floor(Math.random() * audioUrls.length)];
            
            // Send the randomly selected image with caption
            await kelvin.sendMessage(
                m.chat, 
                { 
                    image: { url: randomImageUrl },
                    caption: `*🌹Hi. I am 👑 ${global.botname}, a friendly advanced WhatsApp bot.  Don't worry, I'm still Alive☺🚀*\n\n*⏰ Uptime: ${botUptime}*`
                },
                { quoted: m }
            );
            
            // Send the randomly selected audio as PTT
            await kelvin.sendMessage(
                m.chat,
                {
                    audio: { url: randomAudioUrl },
                    mp3: true,
                    mimetype: 'audio/mp4'
                },
                { quoted: m }
            );
        }
    },
    {
        command: ['bothosting', 'deploy', 'hosting', 'deploybot'],
        operate: async ({ kelvin, m, reply, from }) => {
            try {
                const message = `
*STEPS ON HOW TO DEPLOY A WHATSAPP BOT*
First you need a GitHub account.
Create one using the link:
https://github.com/

Secondly create a discord account.
https://discord.com/login

Once your done creating and verifying the two account, move over to the next step.

*NEXT STEPS*
Next step is to fork the bot repository. Click the link
https://github.com/Kevintech-hub/Vesper-Xmd

Then download the zip file.

Now authorise your discord account then claim coins for 3days, each day u can claim 10 coins.

https://bot-hosting.net/?aff=1334589985369624636

*NOTE:* Some bot require larger server to process while. (25 coin)

When your done creating a server (25 coin) open the server.

Upload your bot code you have downloaded

Start server Enjoy 😉
                `.trim();

                await kelvin.sendMessage(from, {
                    image: { url: 'https://files.catbox.moe/xd8cvb.jpg' },
                    caption: message,
                    contextInfo: {
                        mentionedJid: [m.sender],
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363401548261516@newsletter',
                            newsletterName: '🪀『VESPER-XMD』🪀',
                            serverMessageId: 143
                        }
                    }
                }, { quoted: m });

            } catch (e) {
                console.error("Support Cmd Error:", e);
                reply(`⚠️ An error occurred:\n${e.message}`);
            }
        }
    },
    {
        command: ['uptime', 'up'],
        operate: async ({ kelvin, m, reply, botNumber }) => {
            const startTime = performance.now();

            try {
                const sentMessage = await kelvin.sendMessage(m.chat, {
                    text: "⚡ Testing connection...",
                    contextInfo: { quotedMessage: m.message }
                });
                
                const endTime = performance.now();
                const ping = `${(endTime - startTime).toFixed(2)}`;
                
                // Get uptime
                const uptime = process.uptime();
                const uptimeFormatted = runtime(uptime); // Using your existing runtime function
                
                // Get bot name from settings
                const botname = `${global.botname}`;
                
                // Get version from global or use default
                const version = global.versions || '1.4.0';
                
                // Formatted response
                const botInfo = `
╭──❍ 💫 ${botname} ❍─
┊ 🚀 ᴘɪɴɢ    : ${ping} ms
┊ ⏱  ᴜᴘᴛɪᴍᴇ  : ${uptimeFormatted}
┊ 🔖 ᴠᴇʀsɪᴏɴ  : ${version}
╰━━━━━━━━━`;
                
                await kelvin.sendMessage(m.chat, {
                    text: botInfo,
                    edit: sentMessage.key,
                    contextInfo: { quotedMessage: m.message }
                });

            } catch (error) {
                await kelvin.sendMessage(m.chat, {
                    text: '❌ An error occurred while testing connection.',
                    contextInfo: { quotedMessage: m.message }
                });
            }
        }
    },
        {
        command: ['botinfo', 'info', 'about'],
        operate: async ({ kelvin, m, reply, botNumber }) => {
            const botname = `${global.botname}`;
            const ownername = "Kelvin Tech";
            
            const botInfo = `
╭─ ⌬ Bot Info
│ • Name     : ${botname}
│ • Owner    : ${ownername}
│ • Version  : ${global.versions || '1.4.0'}
│ • ᴄᴍᴅs    : 100+
│ • Developer: Kelvin tech
│ • Runtime  : ${runtime(process.uptime())}
╰─────────────`;

            const imageUrl = "https://files.catbox.moe/xd8cvb.jpg";
            
            // Array of audio URLs
            const audioUrls = [
                "https://files.catbox.moe/ndrrz3.mp3",
                "https://files.catbox.moe/yny58w.mp3",
                "https://files.catbox.moe/ckie6b.m4a",
                 "https://files.catbox.moe/sbaian.mp3",
                "https://files.catbox.moe/e0dwjw.mp3",
                "https://files.catbox.moe/zhr5m2.mp3"
            ];
            
            // Randomly select an audio URL
            const randomAudioUrl = audioUrls[Math.floor(Math.random() * audioUrls.length)];
            
            // Send the image with caption
            await kelvin.sendMessage(
                m.chat, 
                { 
                    image: { url: imageUrl },
                    caption: `*🌹Hi. I am 👑 ${global.botname}, a friendly WhatsApp bot.*${botInfo}`
                },
                { quoted: m }
            );
            
            // Send the randomly selected audio as PTT
            await kelvin.sendMessage(
                m.chat,
                {
                    audio: { url: randomAudioUrl },
                    mp3: true,
                    mimetype: 'audio/mp4'
                },
                { quoted: m }
            );
        }
    },
    {
        command: ['botstatus', 'systeminfo'],
        operate: async ({ kelvin, m, reply }) => {
            const used = process.memoryUsage();
            const ramUsage = `${formatSize(used.heapUsed)} / ${formatSize(os.totalmem())}`;
            const freeRam = formatSize(os.freemem());
            
            // Properly await checkDiskSpace
            const disk = await checkDiskSpace(process.cwd()); 
            
            const latencyStart = performance.now();
            await reply("⏳ *Calculating ping...*");
            const latencyEnd = performance.now();
            const ping = `${(latencyEnd - latencyStart).toFixed(2)} ms`;

            const { download, upload } = await checkBandwidth();
            const uptime = runtime(process.uptime());

            const response = `
* BOT STATUS *

*Ping:* ${ping}
*Uptime:* ${uptime}
*RAM Usage:* ${ramUsage}
*Free RAM:* ${freeRam}
*Disk Usage:* ${formatSize(disk.size - disk.free)} / ${formatSize(disk.size)}
*Free Disk:* ${formatSize(disk.free)}
*Platform:* ${os.platform()}
*NodeJS Version:* ${process.version}
*CPU Model:* ${os.cpus()[0].model}
*Downloaded:* ${download}
*Uploaded:* ${upload}
`;
            await kelvin.sendMessage(m.chat, { text: response.trim() }, { quoted: m });
        }
    },
    {
        command: ['repo', 'source', 'sourcecode', 'repository'],
        operate: async ({ kelvin, m, reply }) => {
            try {
                // GitHub repository details
                const repoOwner = "Kevintech-hub";
                const repoName = "Vesper-Xmd";
                const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}`;
                
                // Fetch repository data with error handling
                const { data } = await axios.get(apiUrl, {
                    timeout: 5000, // 5 second timeout
                    headers: {
                        'User-Agent': 'javelin Bot' // GitHub requires user-agent
                    }
                }).catch(err => {
                    console.error('GitHub API Error:', err);
                    throw new Error('Failed to connect to GitHub API');
                });

                // Validate response data
                if (!data || typeof data !== 'object') {
                    throw new Error('Invalid GitHub API response');
                }

                // Format repository information
                const repoInfo = `
*BOT REPOSITORY*

*Name:* ${String(data.name || repoName).padEnd(20)}
*Stars:* ${String(data.stargazers_count || 0).padEnd(20)}
*Forks:* ${String(data.forks_count || 0).padEnd(21)}
*Watchers:* ${String(data.watchers_count || 0).padEnd(18)}
*Language:* ${String(data.language || 'Not specified').padEnd(16)}
*License:* ${String(data.license?.name || 'None').padEnd(19)}
*GitHub Link:* 
https://github.com/${repoOwner}/${repoName}

*Session Id:* https://vinic-xmd-pairing-site-dsf-crew-devs.onrender.com/
────────────────────────────────
@${m.sender.split("@")[0]}👋, Don't forget to star and fork my repository!`;

                // Get thumbnail buffer
                const thumbnailBuffer = await getBuffer('https://files.catbox.moe/0pab6g.jpg');
                
                // Send the response with thumbnail
                await kelvin.sendMessage(
                    m.chat,
                    {
                        text: repoInfo.trim(),
                        contextInfo: {
                            mentionedJid: [m.sender],
                            externalAdReply: {
                                title: "Vesper-Xmd repository",
                                body: `⭐ Star the repo to support development!`,
                                thumbnail: thumbnailBuffer,
                                mediaType: 1,
                                sourceUrl: `https://github.com/${repoOwner}/${repoName}`
                            }
                        }
                    },
                    { quoted: m }
                );

            } catch (error) {
                console.error('Repo command error:', error);
                
                // Fallback response when GitHub API fails
                const fallbackInfo = `
*BOT REPOSITORY*

*Name:* Vesper-Xmd
*GitHub Link:* 
https://github.com/Kevintech-hub/Vesper-Xmd

@${m.sender.split("@")[0]}👋, Visit the repository for more info!`;

                await kelvin.sendMessage(
                    m.chat,
                    { 
                        text: fallbackInfo,
                        contextInfo: {
                            mentionedJid: [m.sender]
                        }
                    },
                    { quoted: m }
                );
            }
        }
}


];