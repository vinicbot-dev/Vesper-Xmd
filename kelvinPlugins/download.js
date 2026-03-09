/*Kelvin Tech*/

const axios = require('axios');
const fs = require('fs');
const fg = require('api-dylux')
const path = require('path');
const fetch = require('node-fetch');
const yts = require('yt-search');
const { KelvinVideo } = require('../start/kelvinCmds/video');
const {  } = require('../start/lib/myfunction');
const { 
    playCommand, 
    InstagramCommand, 
    handleMediafireDownload, 
    ytplayCommand, 
    videoCommand, 
    takeCommand 
} = require('../start/kelvinCmds/commands');

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


module.exports = [

{
    command: ['song', 'mp3'],
    operate: async ({ kelvin, m, reply, text, prefix, command }) => {
        
        if (!text) return reply(`📌 Example: ${prefix + command} shape of you`);
        
        try {
            await reply("🔍 Searching...");
            
            // Encode the search query
            const searchQuery = encodeURIComponent(text);
            
           
            const apiUrl = `https://apis.xwolf.space/download/mp3?url=${searchQuery}`;
            
            const response = await axios.get(apiUrl, { timeout: 30000 });
            const data = response.data;
            
            // Check if response is successful
            if (!data || !data.success) {
                throw new Error(data?.message || 'API returned an error');
            }
            
            const title = data.title || text;
            const videoId = data.videoId || '';
            const thumbnail = data.thumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            const audioUrl = data.downloadUrl || data.streamUrl;
            
            if (!audioUrl) {
                return reply("❌ Couldn't get audio download link.");
            }
            
            // React
            await kelvin.sendMessage(m.chat, {
                react: { text: "🎵", key: m.key }
            });
            
            // Send song info with thumbnail
            await kelvin.sendMessage(
                m.chat,
                {
                    image: { url: thumbnail },
                    caption: `🎵 *${title}*\n\n` +
                        `📥 Downloading...`,
                    mentions: [m.sender]
                },
                { quoted: m }
            );
            
            // Send audio
            await kelvin.sendMessage(
                m.chat,
                {
                    audio: { url: audioUrl },
                    mimetype: "audio/mpeg",
                    fileName: `${title.substring(0, 50)}.mp3`.replace(/[<>:"/\\|?*]/g, '_')
                },
                { quoted: m }
            );
            
            // Success reaction
            await kelvin.sendMessage(m.chat, {
                react: { text: "✅", key: m.key }
            });
            
        } catch (err) {
            console.error('Song command error:', err);
            
            let errorMessage = '❌ Error downloading song. ';
            
            if (err.message.includes('timeout')) {
                errorMessage += 'Request timed out.';
            } else if (err.message.includes('API returned an error')) {
                errorMessage += 'Service unavailable.';
            } else {
                errorMessage += err.message;
            }
            
            reply(errorMessage);
            
            // Error reaction
            await kelvin.sendMessage(m.chat, {
                react: { text: "❌", key: m.key }
            });
        }
    }
},
{
    command: ['play2',],
    operate: async ({ kelvin, m, reply, text, prefix,  mess, command }) => {
        
        if (!text) return reply("*Please provide a song name!*\nExample: `.play2 despacito`");
        
        try {
            const searchQuery = text.trim();
            
            if (!searchQuery) {
                return reply("*Please provide a song name!*\nExample: `.play2 despacito`");
            }
            
            // React with 🎵 emoji
            await kelvin.sendMessage(m.chat, {
                react: {
                    text: "🎵",
                    key: m.key
                }
            });
            
            // Search YouTube
            const { videos } = await yts(searchQuery);
            if (!videos || videos.length === 0) {
                return reply("⚠️ *No results found for your query!*");
            }
            
            // Use first video
            const video = videos[0];
            const videoUrl = video.url;
            
            // Send video info before download
            await reply("⏳ *Searching and downloading audio... Please wait*");
            
            await kelvin.sendMessage(m.chat, {
                image: { url: video.thumbnail },
                caption: `*${video.title}*\n⏱ *Duration:* ${video.timestamp}\n👁 *Views:* ${video.views.toLocaleString()}\n\n⏳ *Downloading audio...*`
            }, { quoted: m });
            
            // Call the API with ?url= style
            const apiUrl = `https://yt-dl.officialhectormanuel.workers.dev/?url=${encodeURIComponent(videoUrl)}`;
            const response = await axios.get(apiUrl);
            const data = response.data;
            
            if (!data?.status) {
                return reply("🚫 *Failed to fetch audio from API. Try again later.*");
            }
            
            // The API returns fields: title, thumbnail, audio, videos, etc.
            const audioUrl = data.audio;
            const title = data.title || video.title;
            
            if (!audioUrl) {
                return reply("🚫 *No audio URL found in the response.*");
            }
            
            // Send the audio file
            await kelvin.sendMessage(m.chat, {
                audio: { url: audioUrl },
                mimetype: "audio/mpeg",
                fileName: `${title.replace(/[^\w\s]/gi, '')}.mp3`,
                ptt: false
            }, { quoted: m });
            
        } catch (error) {
            console.error('Error in play2 command:', error);
            reply("❌ *Download failed. Please try again later.*");
        }
    }
},
{
        command: ['play'],
        operate: async ({ kelvin, m, reply, args, text }) => {
            await playCommand(kelvin, m.chat, m, args);
        }
    },
    {
    command: ['play3', 'song3', 'ytmp3', 'Robertplay'],
    operate: async ({ kelvin, m, reply, text, prefix, command }) => {
        
        if (!text) return reply(`Please Provide Me A song Query or Link\n\nExample: ${prefix + command} shape of you`);

        try {
            await kelvin.sendMessage(m.chat, { 
                react: { text: "⏳", key: m.key } 
            });

            // Search YouTube
            const search = await yts(text);
            
            if (!search.videos || !search.videos.length) {
                return reply("No result Found");
            }

            const video = search.videos[0];
            
            // MP3 API using Arslan
            const apiUrl = `https://arslan-apis.vercel.app/download/ytmp3?url=${video.url}`;
            const res = await axios.get(apiUrl, { timeout: 60000 });

            if (!res.data || !res.data.status || !res.data.result || !res.data.result.download || !res.data.result.download.url) {
                return reply("❌ Audio Not Generated");
            }

            const dlUrl = res.data.result.download.url;
            const meta = res.data.result.metadata;
            const quality = res.data.result.download.quality || "128kbps";

            // Send song info with thumbnail
            await kelvin.sendMessage(
                m.chat,
                {
                    image: { url: video.thumbnail },
                    caption: `🎵 *${meta.title || video.title}*\n` +
                             `🎚️ Quality: ${quality}\n\n` +
                             `⬇️ Downloading audio...`
                },
                { quoted: m }
            );

            // Send audio
            await kelvin.sendMessage(
                m.chat,
                {
                    audio: { url: dlUrl },
                    mimetype: "audio/mpeg",
                    ptt: false,
                    fileName: `${meta.title || video.title}.mp3`.replace(/[<>:"/\\|?*]/g, '_'),
                    caption: `> ${global.wm || ''}`,
                    contextInfo: {
                        externalAdReply: {
                            title: meta.title ? meta.title.substring(0, 40) : "YouTube Song",
                            body: "YouTube MP3",
                            thumbnailUrl: video.thumbnail,
                            sourceUrl: video.url,
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                },
                { quoted: m }
            );

            await kelvin.sendMessage(m.chat, { 
                react: { text: "✅", key: m.key } 
            });

        } catch (err) {
            console.error("PLAY ERROR:", err);
            reply("❌ Error Found Please Try Later");
            await kelvin.sendMessage(m.chat, { 
                react: { text: "❌", key: m.key } 
            });
        }
    }
},
    
    // Instagram command
    {
        command: ['instagram', 'ig', 'insta'],
        operate: async ({ kelvin, m, reply, args, text }) => {
            await InstagramCommand(kelvin, m.chat, m);
        }
    },
    
    {
    command: ['mediafire', 'mf', 'mfire'],
    operate: async ({ kelvin, m, reply, text }) => {
        if (!text) return reply('*Please provide a MediaFire url!*');

        try {
            await kelvin.sendMessage(m.chat, { 
                react: { text: "⏳", key: m.key } 
            });

            const apiUrl = `https://arslan-apis.vercel.app/download/mfire?url=${encodeURIComponent(text)}`;
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (!data.status || !data.result?.dl_link) {
                throw new Error('Failed to fetch file');
            }

            const file = data.result;

            await kelvin.sendMessage(
                m.chat,
                {
                    document: { url: file.dl_link },
                    fileName: file.fileName,
                    mimetype: file.fileType || 'application/octet-stream',
                    caption: `> ${global.wm || ''}`
                },
                { quoted: m }
            );
            
            await kelvin.sendMessage(m.chat, { 
                react: { text: "✅", key: m.key } 
            });

        } catch (error) {
            console.error('MediaFire error:', error);
            await kelvin.sendMessage(m.chat, { 
                react: { text: "❌", key: m.key } 
            });
            reply(`❌ *Error:* ${error.message}`);
        }
    }
},
    
    // YTPlay command
    {
        command: ['ytplay', 'yplay', 'youtubeplay'],
        operate: async ({ kelvin, m, reply, args, text }) => {
            const query = args.join(' ') || text;
            await ytplayCommand(kelvin, m.chat, query, m);
        }
    },
    
    // Video command
    {
        command: ['video', 'ytvideo', 'youtubevideo'],
        operate: async ({ kelvin, m, reply, args, text }) => {
            await videoCommand(kelvin, m.chat, m);
        }
    },
    {
        command: ['song2',  'music'],
        operate: async ({ kelvin, m, reply, text, fetchMp3DownloadUrl }) => {
            if (!text) return reply('*Please provide a song name!*');

            try {
                const search = await yts(text);
                if (!search || search.all.length === 0) return reply('*The song you are looking for was not found.*');

                const video = search.all[0];
                const downloadUrl = await fetchMp3DownloadUrl(video.url);

                await kelvin.sendMessage(m.chat, {
                    audio: { url: downloadUrl },
                    mimetype: 'audio/mpeg',
                    fileName: `${video.title}.mp3`
                }, { quoted: m });

            } catch (error) {
                console.error('song2 command failed:', error);
                reply(`Error: ${error.message}`);
            }
        }
    },
    {
        command: ['gitclone', 'githubclone', 'gitdl'],
        operate: async ({ kelvin, m, reply, args, text }) => {
            if (!text) return reply("*Please provide gitHub repository link*");
            
            let regex = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i;
            if (!regex.test(text)) return reply("*Invalid link*");
            
            try {
                let [, user, repo] = args[0].match(regex) || [];
                repo = repo.replace(/.git$/, '');
                let url = `https://api.github.com/repos/${user}/${repo}/zipball`;
                
                let filename = (await fetch(url, {method: 'HEAD'})).headers.get('content-disposition').match(/attachment; filename=(.*)/)[1];
                
                kelvin.sendMessage(m.chat, { 
                    document: { url: url }, 
                    mimetype: 'application/zip', 
                    fileName: `${filename}`
                }, { quoted: m });
                
            } catch (e) {
                await reply(`*Error! Repository Not Found*`);
            }
        }
    },
    {
        command: ['download', 'dl', 'filedownload'],
        operate: async ({ kelvin, m, reply, text }) => {
            if (!text) return reply('Enter download URL');
            
            try {
                let res = await fetch(text, { method: 'GET', redirect: 'follow' });
                let contentType = res.headers.get('content-type');
                let buffer = await res.arrayBuffer();
                let extension = contentType.split('/')[1]; 
                let filename = res.headers.get('content-disposition')?.match(/filename="(.*)"/)?.[1] || `download-${Math.random().toString(36).slice(2, 10)}.${extension}`;

                let mimeType;
                switch (contentType) {
                    case 'audio/mpeg':
                        mimeType = 'audio/mpeg';
                        break;
                    case 'image/png':
                        mimeType = 'image/png';
                        break;
                    case 'image/jpeg':
                        mimeType = 'image/jpeg';
                        break;
                    case 'application/pdf':
                        mimeType = 'application/pdf';
                        break;
                    case 'application/zip':
                        mimeType = 'application/zip';
                        break;
                    case 'video/mp4':
                        mimeType = 'video/mp4';
                        break;
                    case 'video/webm':
                        mimeType = 'video/webm';
                        break;
                    case 'application/vnd.android.package-archive':
                        mimeType = 'application/vnd.android.package-archive';
                        break;
                    default:
                        mimeType = 'application/octet-stream';
                }

                kelvin.sendMessage(m.chat, { 
                    document: Buffer.from(buffer), 
                    mimetype: mimeType, 
                    fileName: filename 
                }, { quoted: m });
                
            } catch (error) {
                reply(`Error downloading file: ${error.message}`);
            }
        }
    },
    {
        command: ['apk', 'androidapk', 'downloadapk'],
        operate: async ({ kelvin, m, reply, fetchJson, text, botNumber }) => {
            if (!text) return reply("*Which apk do you want to download?*");
            
            try {
                const botname = global.botname || 'Vesper-Xmd';
                let apiUrl = await fetchJson(`https://api.bk9.dev/search/apk?q=${text}`);
                let kelvinData = await fetchJson(`https://api.bk9.dev/download/apk?id=${apiUrl.BK9[0].id}`);

                await kelvin.sendMessage(
                    m.chat,
                    {
                        document: { url: kelvinData.BK9.dllink },
                        fileName: kelvinData.BK9.name,
                        mimetype: "application/vnd.android.package-archive",
                        contextInfo: {
                            externalAdReply: {
                                title: botname,
                                body: `${kelvinData.BK9.name}`,
                                thumbnailUrl: `${kelvinData.BK9.icon}`,
                                sourceUrl: `${kelvinData.BK9.dllink}`,
                                mediaType: 2,
                                showAdAttribution: true,
                                renderLargerThumbnail: true
                            }
                        }
                    },
                    { quoted: m }
                );
            } catch (error) {
                console.error(error);
                reply(global.mess?.error || "*Failed to download APK*");
            }
        }
    },
    {
        command: ['gdrive', 'googledrive', 'gdrivedl'],
        operate: async ({ kelvin, m, reply, text }) => {
            if (!text) return reply("*Please provide a Google Drive file URL*");

            try {
                const siputzx = global.siputzx || 'https://api.siputzx.my.id';
                let response = await fetch(`${siputzx}/api/d/gdrive?url=${encodeURIComponent(text)}`);
                let data = await response.json();

                if (response.status !== 200 || !data.status || !data.data) {
                    return reply("*Please try again later or try another command!*");
                }

                const downloadUrl = data.data.download;
                const filePath = path.join(__dirname, `${Date.now()}_${data.data.name}`);

                const writer = fs.createWriteStream(filePath);
                const fileResponse = await axios({
                    url: downloadUrl,
                    method: 'GET',
                    responseType: 'stream'
                });

                fileResponse.data.pipe(writer);

                writer.on('finish', async () => {
                    await kelvin.sendMessage(m.chat, {
                        document: fs.readFileSync(filePath),
                        fileName: data.data.name,
                        mimetype: fileResponse.headers['content-type'] || 'application/octet-stream'
                    }, { quoted: m });

                    fs.unlinkSync(filePath);
                });

                writer.on('error', (err) => {
                    console.error('Error downloading the file:', err);
                    reply("An error occurred while downloading the file.");
                });

            } catch (error) {
                console.error('Error fetching Google Drive file details:', error);
                reply(global.mess?.error || "*Failed to download from Google Drive*");
            }
        }
    },
    {
        command: ['savestatus', 'save', 'savestatis'],
        operate: async ({ kelvin, m, saveStatusMessage }) => {
          
                await saveStatusMessage(m);
            
        }
    },
    {
        command: ['ringtone', 'rtone', 'ringtones'],
        operate: async ({ kelvin, m, reply, args, from }) => {
            try {
                const query = args.join(" ");
                if (!query) {
                    return reply("Please provide a search query! Example: .ringtone Suna");
                }

                const { data } = await axios.get(`https://www.dark-yasiya-api.site/download/ringtone?text=${encodeURIComponent(query)}`);

                if (!data.status || !data.result || data.result.length === 0) {
                    return reply("No ringtones found for your query. Please try a different keyword.");
                }

                const randomRingtone = data.result[Math.floor(Math.random() * data.result.length)];

                await kelvin.sendMessage(
                    from,
                    {
                        audio: { url: randomRingtone.dl_link },
                        mimetype: "audio/mpeg",
                        fileName: `${randomRingtone.title}.mp3`,
                    },
                    { quoted: m }
                );
            } catch (error) {
                console.error("Error in ringtone command:", error);
                reply("Sorry, something went wrong while fetching the ringtone. Please try again later.");
            }
        }
    },
    {
        command: ['playdoc', 'songdoc', 'musicdoc'],
        operate: async ({ kelvin, m, reply, text, fetchMp3DownloadUrl }) => {
            if (!text) return reply('*Please provide a song name!*');

            try {
                const search = await yts(text);
                if (!search || search.all.length === 0) return reply('*The song you are looking for was not found.*');

                const video = search.all[0];
                const downloadUrl = await fetchMp3DownloadUrl(video.url);

                await kelvin.sendMessage(m.chat, {
                    document: { url: downloadUrl },
                    mimetype: 'audio/mpeg',
                    fileName: `${video.title}.mp3`
                }, { quoted: m });

            } catch (error) {
                console.error('playdoc command failed:', error);
                reply(`Error: ${error.message}`);
            }
        }
    },
    {
        command: ['itunes', 'applemusic', 'apple'],
        operate: async ({ kelvin, m, reply, text }) => {
            if (!text) return reply("*Please provide a song name*");
            
            try {
                let res = await fetch(`https://api.popcat.xyz/itunes?q=${encodeURIComponent(text)}`);
                if (!res.ok) {
                    throw new Error(`*API request failed with status ${res.status}*`);
                }
                let json = await res.json();
                let songInfo = `*Song Information:*\n\n• *Name:* ${json.name}\n• *Artist:* ${json.artist}\n• *Album:* ${json.album}\n• *Release Date:* ${json.release_date}\n• *Price:* ${json.price}\n• *Length:* ${json.length}\n• *Genre:* ${json.genre}\n• *URL:* ${json.url}`;
                
                if (json.thumbnail) {
                    await kelvin.sendMessage(
                        m.chat,
                        { image: { url: json.thumbnail }, caption: songInfo },
                        { quoted: m }
                    );
                } else {
                    reply(songInfo);
                }
            } catch (error) {
                console.error(error);
                reply(global.mess?.error || "*Failed to fetch iTunes information*");
            }
        }
    },

    // TikTok command (version 1)
    {
        command: ['tiktok', 'tt'],
        operate: async ({ kelvin, m, reply, text, prefix, command, botNumber }) => {
            if (!text) return reply(`Use : ${prefix + command} link`)
            
            try {
                await kelvin.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
                
                let data = await fg.tiktok(text);
                let json = data.result;
                let botname = `${global.botname}`;
                let caption = `[ TIKTOK - DOWNLOAD ]\n\n`;
                caption += `◦ *Id* : ${json.id}\n`;
                caption += `◦ *Username* : ${json.author.nickname}\n`;
                caption += `◦ *Title* : ${(json.title)}\n`;
                caption += `◦ *Like* : ${(json.digg_count)}\n`;
                caption += `◦ *Comments* : ${(json.comment_count)}\n`;
                caption += `◦ *Share* : ${(json.share_count)}\n`;
                caption += `◦ *Play* : ${(json.play_count)}\n`;
                caption += `◦ *Created* : ${json.create_time}\n`;
                caption += `◦ *Size* : ${json.size}\n`;
                caption += `◦ *Duration* : ${json.duration}`;
                
                if (json.images) {
                    json.images.forEach(async (k) => {
                        await kelvin.sendMessage(m.chat, { image: { url: k }}, { quoted: m });
                    });
                } else {
                    kelvin.sendMessage(m.chat, { 
                        video: { url: json.play }, 
                        mimetype: 'video/mp4', 
                        caption: caption 
                    }, { quoted: m });
                    
                    setTimeout(() => {
                        kelvin.sendMessage(m.chat, { 
                            audio: { url: json.music }, 
                            mimetype: 'audio/mpeg' 
                        }, { quoted: m });
                    }, 3000);
                }
                
                await kelvin.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
                
            } catch (error) {
                console.error('TikTok error:', error);
                await kelvin.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
                reply('❌ Failed to download TikTok content.');
            }
        }
    },

   {
    command: ['facebook', 'fb'],
    operate: async ({ kelvin, m, reply, text }) => {
        if (!text) return reply('Usage: .fb <facebook_url>');
        
        try {
            await reply('📥 Downloading...');
            
            // Using Arslan API
            const apiUrl = `https://arslan-apis.vercel.app/download/fbdown?url=${encodeURIComponent(text)}`;
            const res = await fetch(apiUrl);
            const data = await res.json();
            
            if (data.status && data.result?.download) {
                const download = data.result.download;
                const metadata = data.result.metadata || {};
                
                // Try HD first, fallback to SD
                const videoUrl = download.hd || download.sd;
                
                if (!videoUrl) {
                    return reply('❌ No download link found');
                }
                
                const caption = `*Facebook Video*\n\n` +
                               `*Title:* ${metadata.title || 'N/A'}\n` +
                               `*Duration:* ${metadata.duration || 'N/A'}\n` +
                               `\n> ${global.wm || ''}`;
                
                await kelvin.sendMessage(m.chat, {
                    video: { url: videoUrl },
                    caption: caption,
                    contextInfo: {
                        externalAdReply: {
                            title: "Facebook Video",
                            body: metadata.title || "Downloaded",
                            thumbnailUrl: metadata.thumbnail,
                            mediaType: 1,
                            sourceUrl: text
                        }
                    }
                }, { quoted: m });
                
                await kelvin.sendMessage(m.chat, { 
                    react: { text: "✅", key: m.key } 
                });
                
            } else {
                reply('❌ Download failed: Invalid response');
            }
            
        } catch (error) {
            console.error('Facebook error:', error);
            reply(`❌ Error: ${error.message}`);
            await kelvin.sendMessage(m.chat, { 
                react: { text: "❌", key: m.key } 
            });
        }
    }
},
    {
    command: ['twitter', 'x', 'tw'],
    operate: async ({ kelvin, m, reply, text }) => {
        if (!text) return reply('*Please provide Twitter/X link or url!*');

        try {
            await kelvin.sendMessage(m.chat, { 
                react: { text: "⏳", key: m.key } 
            });

            // Using Arslan API
            const apiUrl = `https://arslan-apis.vercel.app/download/twitter?url=${encodeURIComponent(text)}`;
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (!data.status || !data.result) {
                throw new Error('Invalid response');
            }

            const result = data.result;
            
            // Choose video quality (HD preferred, fallback to SD)
            const videoUrl = result.video_hd || result.video_sd;
            
            if (!videoUrl) {
                throw new Error('No video found');
            }

            // Send video with ONLY global.wm as caption
            await kelvin.sendMessage(
                m.chat,
                {
                    video: { url: videoUrl },
                    caption: `${global.wm || ''}`,
                    contextInfo: {
                        externalAdReply: {
                            title: "Twitter Video",
                            body: result.desc?.substring(0, 50) || "Downloaded",
                            thumbnailUrl: result.thumb,
                            mediaType: 1,
                            sourceUrl: text
                        }
                    }
                },
                { quoted: m }
            );
            
            await kelvin.sendMessage(m.chat, { 
                react: { text: "✅", key: m.key } 
            });

        } catch (error) {
            console.error('Twitter command error:', error);
            await kelvin.sendMessage(m.chat, { 
                react: { text: "❌", key: m.key } 
            });
            reply(`❌ *Failed to download:* ${error.message}`);
        }
    }
},
    {
        command: ['tiktok2', 'tt2'],
        operate: async ({ kelvin, m, reply, args, fetchJson }) => {
            if (!args[0]) return reply('*Please provide a TikTok video url!*');
            
            try {
                await kelvin.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
                
                let apiUrl = await fetchJson(`https://api-aswin-sparky.koyeb.app/api/downloader/tiktok?url=${args[0]}`);
                
                await kelvin.sendMessage(
                    m.chat,
                    {
                        caption: global.wm || '',
                        video: { url: apiUrl.data.video },
                        fileName: "video.mp4",
                        mimetype: "video/mp4",
                    },
                    { quoted: m }
                );
                
                await kelvin.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
                
            } catch (error) {
                console.error(error);
                await kelvin.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
                reply(global.mess?.error || "*Failed to download TikTok*");
            }
        }
    },

    // TikTok audio command
    {
        command: ['tiktokaudio', 'tta'],
        operate: async ({ kelvin, m, reply, args, fetchJson }) => {
            if (!args[0]) return reply('*Please provide a TikTok audio url!*');
            
            try {
                await kelvin.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
                
                let apiUrl = await fetchJson(`https://api-aswin-sparky.koyeb.app/api/downloader/tiktok?url=${args[0]}`);
                
                await kelvin.sendMessage(
                    m.chat,
                    {
                        audio: { url: apiUrl.data.audio },
                        fileName: "tiktok.mp3",
                        mimetype: "audio/mpeg",
                    },
                    { quoted: m }
                );
                
                await kelvin.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
                
            } catch (error) {
                console.error(error);
                await kelvin.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
                reply(global.mess?.error || "*Failed to download TikTok audio*");
            }
        }
    },
   {
    command: ['ytmp4', 'ytv'],
    operate: async ({ kelvin, m, reply, text }) => {
        if (!text) return reply('.ytmp4 <YouTube URL>');
        
        try {
            await reply('⏳ Downloading video...');
            
            const apiUrl = `https://apiskeith.top/download/mp4?url=${encodeURIComponent(text)}`;
            const res = await axios.get(apiUrl);
            const data = res.data;
            
            if (data.status && data.result) {
                await kelvin.sendMessage(m.chat, {
                    video: { url: data.result },
                    caption: `📹 *YouTube Video*\n\n${global.wm || ''}`
                }, { quoted: m });
            } else {
                reply('Failed to download video');
            }
            
        } catch (error) {
            console.error('ytmp4 error:', error);
            reply('Error: ' + error.message);
        }
    }
},
{
    command: ['pinterest', 'pini', 'pint'],
    operate: async ({ kelvin, m, reply, text }) => {
        if (!text) return reply('*Please provide a search query!*\nExample: .pinterest car');

        try {
            await kelvin.sendMessage(m.chat, { 
                react: { text: "🔍", key: m.key } 
            });

            // Using Arslan API
            const apiUrl = `https://arslan-apis.vercel.app/download/piniimg?text=${encodeURIComponent(text)}`;
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (!data.status) {
                throw new Error('API returned error');
            }

            // Check if results exist
            if (!data.result || data.result.length === 0) {
                return reply(`❌ No images found for "${text}". Try another keyword.`);
            }

            // Get random image from results
            const randomIndex = Math.floor(Math.random() * data.result.length);
            const imageUrl = data.result[randomIndex];

            // Send the image
            await kelvin.sendMessage(
                m.chat,
                {
                    image: { url: imageUrl },
                    caption: `🖼️ *Pinterest Result*\n\n🔍 *Query:* ${text}\n\n> ${global.wm || ''}`
                },
                { quoted: m }
            );
            
            await kelvin.sendMessage(m.chat, { 
                react: { text: "✅", key: m.key } 
            });

        } catch (error) {
            console.error('Pinterest error:', error);
            await kelvin.sendMessage(m.chat, { 
                react: { text: "❌", key: m.key } 
            });
            reply(`❌ *Error:* ${error.message}`);
        }
    }
},
{
    command: ['spotify', 'sp', 'spotifydl'],
    operate: async ({ kelvin, m, reply, text }) => {
        if (!text) return reply('*Please provide a Spotify track URL!*\nExample: .spotify https://open.spotify.com/track/0RX5UmW4ID0NtobeGupa6x');

        try {
            await kelvin.sendMessage(m.chat, { 
                react: { text: "🎵", key: m.key } 
            });

            // Using Arslan API
            const apiUrl = `https://arslan-apis.vercel.app/download/spotifydl?url=${encodeURIComponent(text)}`;
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (!data.status || !data.result) {
                throw new Error('Failed to fetch track info');
            }

            const track = data.result;
            
            // Check if download URL is valid
            if (!track.download || track.download.includes('undefined')) {
                return reply('❌ Download link not available. The API might be having issues.');
            }

            // Format duration (convert from milliseconds)
            const duration = Math.floor(track.durasi / 1000);
            const minutes = Math.floor(duration / 60);
            const seconds = duration % 60;
            const durationStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            // Send track info with thumbnail
            await kelvin.sendMessage(
                m.chat,
                {
                    image: { url: track.image },
                    caption: `🎵 *Spotify Track*\n\n` +
                             `*Title:* ${track.title}\n` +
                             `*Artist:* ${track.artis}\n` +
                             `*Duration:* ${durationStr}\n\n` +
                             `⬇️ Downloading audio...`
                },
                { quoted: m }
            );

            // Download and send audio
            try {
                await kelvin.sendMessage(
                    m.chat,
                    {
                        audio: { url: track.download },
                        mimetype: 'audio/mpeg',
                        fileName: `${track.title} - ${track.artis}.mp3`.replace(/[<>:"/\\|?*]/g, '_')
                    },
                    { quoted: m }
                );
                
                await kelvin.sendMessage(m.chat, { 
                    react: { text: "✅", key: m.key } 
                });
                
            } catch (audioError) {
                console.error('Audio download error:', audioError);
                reply('❌ Failed to download audio. The download link may be invalid.');
                await kelvin.sendMessage(m.chat, { 
                    react: { text: "❌", key: m.key } 
                });
            }

        } catch (error) {
            console.error('Spotify error:', error);
            await kelvin.sendMessage(m.chat, { 
                react: { text: "❌", key: m.key } 
            });
            reply(`❌ *Error:* ${error.message}`);
        }
    }
}
    
];