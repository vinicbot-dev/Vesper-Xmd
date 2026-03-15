/*Kelvin Tech*/


const { runtime,
formatSize,
sleep,
getBuffer
 } = require('../start/lib/myfunction');
 const moment = require('moment-timezone');
 const os = require('os');
 const fs = require('fs');
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
    operate: async ({ kelvin, m, reply }) => {
        const start = performance.now();
        
        const sent = await kelvin.sendMessage(m.chat, { 
            text: "▸ *Pong!*" 
        }, { quoted: m });
        
        const ping = (performance.now() - start).toFixed(1);
        
        const response = `
╭──❖ 「 PONG 」 ❖──
│
🔸 *Speed* : ${ping}ms
🔹 *Status* : ${ping < 300 ? '✅ Fast' : ping < 600 ? '⚠️ Medium' : '🐢 Slow'}
│
╰──────────────❖`;

        await kelvin.sendMessage(m.chat, {
            text: response,
            edit: sent.key
        });
    }
},
    {
    command: ['alive'],
    operate: async ({ kelvin, m, reply, getServerUptime }) => { 
        const serverUptime = getServerUptime();
        
        // Array of image URLs
        const imageUrls = [
            './start/lib/Media/Images/Vesper1.jpg',
            './start/lib/Media/Images/Vesper2.jpg',
            './start/lib/Media/Images/Vesper3.jpg',
            './start/lib/Media/Images/Vesper4.jpg'
        ];
        
        const audioUrls = [
            './start/lib/Media/JexAudio1.mp3',
            './start/lib/Media/JexAudio2.mp3',
            './start/lib/Media/JexAudio3.mp3',
            './start/lib/Media/JexAudio4.mp3',
            './start/lib/Media/JexAudio5.mp3',
            './start/lib/Media/JexAudio6.mp3',
            './start/lib/Media/JexAudio8.mp3',
            './start/lib/Media/JexAudio7.mp3'
        ];
        
        // Randomly select an image and audio
        const randomImageUrl = imageUrls[Math.floor(Math.random() * imageUrls.length)];
        const randomAudioUrl = audioUrls[Math.floor(Math.random() * audioUrls.length)];
        
        // Send the randomly selected image with caption (using server uptime)
        await kelvin.sendMessage(
            m.chat, 
            { 
                image: { url: randomImageUrl },
                caption: `*🌹Hi. I am 👑 ${global.botname}, a friendly advanced WhatsApp bot. Don't worry, I'm still Alive☺🚀*\n\n*⏰ Server Uptime: ${serverUptime}*`
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
    command: ['uptime', 'up', 'runtime'],
    operate: async ({ kelvin, m, reply, getServerUptime }) => { 
        const serverUptime = getServerUptime();
        
        const info = `🔸 *Server Uptime* : *${serverUptime}*`;

        await kelvin.sendMessage(m.chat, { text: info }, { quoted: m });
    }
},
    {
    command: ['pair', 'pairing', 'getcode'],
    operate: async ({ kelvin, m, reply, text, prefix, command, args }) => {
        if (!text) {
            return reply(
                `Oops! You forgot the number.\n\nExample:\n${prefix + command} 25674293XXXX`
            );
        }

        // Normalize and validate numbers
        const numbers = text.split(",")
            .map(v => v.replace(/[^0-9]/g, "")) // keep only digits
            .filter(v => v.length >= 6 && v.length <= 20);

        if (numbers.length === 0) {
            await kelvin.sendMessage(
                m.chat,
                { text: "Invalid number format. Please use digits only (6–20 digits)." },
                { quoted: m }
            );
            return;
        }

        for (const number of numbers) {
            const whatsappID = `${number}@s.whatsapp.net`;
            
            try {
                // Check if number exists on WhatsApp
                const result = await kelvin.onWhatsApp(whatsappID);

                if (!result?.[0]?.exists) {
                    await kelvin.sendMessage(
                        m.chat,
                        { text: `Number ${number} is not registered on WhatsApp.` },
                        { quoted: m }
                    );
                    continue;
                }

                // Notify processing
                await kelvin.sendMessage(
                    m.chat,
                    { text: `Generating code for: ${number}` },
                    { quoted: m }
                );

                // Fetch pairing code from API
                const axios = require('axios');
                const response = await axios.get(
                    `https://vinic-xmd-pairing-site-dsf-crew-devs-4o7e.onrender.com/code?number=${number}`,
                    { timeout: 20000 }
                );

                const code = response.data?.code;
                if (!code || code === "Service Unavailable") {
                    throw new Error("Service Unavailable");
                }

                // Send the pairing code
                await sleep(3000);
                await kelvin.sendMessage(
                    m.chat,
                    { text: `${code}` },
                    { quoted: m }
                );

                // Send help instructions
                await kelvin.sendMessage(
                    m.chat,
                    { 
                        text: `How to Link ${number}\n\n` +
                              `1. Copy the code above\n` +
                              `2. Open WhatsApp\n` +
                              `3. Go to Settings > Linked Devices\n` +
                              `4. Tap Link a Device\n` +
                              `5. Enter the code\n` +
                              `6. Wait for it to load\n` +
                              `7. Done! Your device is now linked.\n\n` +
                              `Tip: Use the session_id in your DM to deploy.`
                    },
                    { quoted: m }
                );

            } catch (apiError) {
                console.error("API Error:", apiError.message);
                
                const errorMessage = apiError.message === "Service Unavailable"
                    ? "Service is currently unavailable. Please try again later."
                    : "Failed to generate pairing code. Please try again later.";

                await kelvin.sendMessage(
                    m.chat,
                    { text: errorMessage },
                    { quoted: m }
                );
            }
        }
    }
},
        {
        command: ['botinfo', 'info', 'about'],
        operate: async ({ kelvin, m, reply, botNumber }) => {
            const botname = `${global.botname}`;
            const ownername = "Kelvin Tech";
            
            const botInfo = `
╭──❖ 「 BOT INFORMATION 」 ❖──
│
│  *Name*    : ${global.botname || 'Vesper-Xmd'}
│  *Owner*   : Kelvin Tech
│  *Version* : ${global.versions || '1.4.0'}
│  *Commands*: 100+
│  *Runtime* : ${runtime(process.uptime())}
│
╰─────────────────────❖`;

            const imageUrl = [
                './start/lib/Media/Images/Vesper1.jpg',
                './start/lib/Media/Images/Vesper2.jpg',
                './start/lib/Media/Images/Vesper3.jpg',
                './start/lib/Media/Images/Vesper4.jpg'
                
            ];
            
           const audioUrls = [
    './start/lib/Media/JexAudio1.mp3',
    './start/lib/Media/JexAudio2.mp3',
    './start/lib/Media/JexAudio3.mp3',
    './start/lib/Media/JexAudio8.mp3',
    './start/lib/Media/JexAudio4.mp3',
    './start/lib/Media/JexAudio5.mp3',
    './start/lib/Media/JexAudio6.mp3',
    './start/lib/Media/JexAudio7.mp3'
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
    command: ['botstatus', 'systeminfo', 'stats'],
    operate: async ({ kelvin, m, reply, getHostPlatform, getServerUptime }) => {
        const used = process.memoryUsage();
        const totalRam = os.totalmem();
        const freeRam = os.freemem();
        const usedRam = totalRam - freeRam;
        const ramPercent = ((usedRam / totalRam) * 100).toFixed(1);
        
        const disk = await checkDiskSpace(process.cwd());
        const diskUsed = disk.size - disk.free;
        const diskPercent = ((diskUsed / disk.size) * 100).toFixed(1);
        
        const start = performance.now();
        await reply("⏳ *Calculating system Info...*");
        const ping = (performance.now() - start).toFixed(2);
        
        const serverUptime = getServerUptime();
        
        const cpus = os.cpus();
        const cpuModel = cpus[0].model;
        const cpuCores = cpus.length;
        const loadAvg = os.loadavg();
        
        const status = `
╭──❖ 「 BOT STATUS 」 ❖──
│
🔸 *Ping*          : ${ping}ms
🔸 *Server Uptime* : ${serverUptime}
│
🔹 *RAM*           : ${formatSize(usedRam)} / ${formatSize(totalRam)} (${ramPercent}%)
🔹 *Heap*          : ${formatSize(used.heapUsed)} / ${formatSize(used.heapTotal)}
│
🔸 *Disk*          : ${formatSize(diskUsed)} / ${formatSize(disk.size)} (${diskPercent}%)
🔸 *Free Disk*     : ${formatSize(disk.free)}
│
🔹 *CPU*           : ${cpuModel.substring(0, 25)}... (${cpuCores} cores)
🔹 *Load*          : ${loadAvg[0].toFixed(2)}%, ${loadAvg[1].toFixed(2)}%, ${loadAvg[2].toFixed(2)}%
│
🔸 *Platform*      : ${getHostPlatform()} ${os.release()}
🔸 *Node*          : ${process.version}
🔸 *Host*          : ${os.hostname()}
│
╰────────────────────❖`;

        await kelvin.sendMessage(m.chat, { text: status }, { quoted: m });
    }
},
    {
    command: ['repo', 'source', 'sourcecode', 'repository'],
    operate: async ({ kelvin, m, reply }) => {
        try {
            const repoOwner = "Kevintech-hub";
            const repoName = "Vesper-Xmd";
            const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}`;
            
            const { data } = await axios.get(apiUrl, {
                timeout: 5000,
                headers: { 'User-Agent': 'Vesper-Xmd Bot' }
            });

            const repoInfo = `
╭──❖ 「 *Vesper-Xmd Repository*」 ❖──
│
🔸 *Repository*  : ${data.name || repoName}
🔸 *Owner*       : ${repoOwner}
🔸 *Description* : ${data.description || 'No description'}
│
🔹 *Stars*       :  ${data.stargazers_count || 0}
🔹 *Forks*       :  ${data.forks_count || 0}
🔹 *Issues*      :  ${data.open_issues_count || 0}
🔹 *Watchers*    : 👀 ${data.watchers_count || 0}
│
🔸 *Language*    : ${data.language || 'N/A'}
🔸 *License*     : ${data.license?.name || 'None'}
🔸 *Created*     : ${new Date(data.created_at).toLocaleDateString()}
🔸 *Updated*     :  ${new Date(data.updated_at).toLocaleDateString()}
│
🔹 *GitHub Link* :
🔹 https://github.com/${repoOwner}/${repoName}
│
╰─────────────────❖

✨ @${m.sender.split("@")[0]} *Don't forget to ⭐ star the repo!* ✨`;

            const thumbnail = fs.readFileSync('./start/lib/Media/Images/Vesper3.jpg');
            
            await kelvin.sendMessage(m.chat, {
                text: repoInfo,
                contextInfo: {
                    mentionedJid: [m.sender],
                    externalAdReply: {
                        title: "🌟 Vesper-Xmd Repository",
                        body: `⭐ ${data.stargazers_count || 0} Stars | 🍴 ${data.forks_count || 0} Forks`,
                        thumbnail: thumbnail,  
                        sourceUrl: `https://github.com/${repoOwner}/${repoName}`,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });

        } catch (error) {
            console.error('Repo error:', error);
            const fallbackInfo = `
╭──❖ 「 REPOSITORY 」 ❖──
│
🔸 *Repository* : Vesper-Xmd
🔸 *Owner*      : Kevintech-hub
🔸 *GitHub*     : https://github.com/Kevintech-hub/Vesper-Xmd
│
╰─────────────────❖

✨ @${m.sender.split("@")[0]} *Visit the repo to ⭐ star!* ✨`;

            await kelvin.sendMessage(m.chat, { 
                text: fallbackInfo,
                contextInfo: { mentionedJid: [m.sender] }
            }, { quoted: m });
        }
    }
}


];