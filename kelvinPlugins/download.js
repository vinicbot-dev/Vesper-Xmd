/*Kelvin Tech*/

const axios = require('axios');
const fs = require('fs');
const fg = require('api-dylux')
const path = require('path');
const fetch = require('node-fetch');
const yts = require('yt-search');
const { KelvinVideo } = require('../start/kelvinCmds/video');
const { fetchMp3, fetchVideo } =require('../start/lib/converter');
const {  } = require('../start/lib/myfunction');
const { 
    playCommand, 
    InstagramCommand, 
    handleMediafireDownload,
    videoCommand, 
    takeCommand 
} = require('../start/kelvinCmds/commands');

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


module.exports = [

{
    command: ['song', 'music', 'audio'],
    operate: async ({ kelvin, m, reply, args, prefix }) => {
        const query = args.join(" ");
        if (!query) return reply(`Example: ${prefix}song Faded`);

        try {
            const apiUrl = `https://apis.davidcyril.name.ng/song?query=${encodeURIComponent(query)}`;
            const response = await axios.get(apiUrl);
            
            if (response.data?.status && response.data?.result) {
                const { title, audio } = response.data.result;
                
                if (!audio || !audio.download_url) {
                    return reply(`No audio found for "${query}"`);
                }
                
                await kelvin.sendMessage(m.chat, {
                    audio: { url: audio.download_url },
                    mimetype: 'audio/mpeg',
                    fileName: `${title.replace(/[^\w\s]/gi, '')}.mp3`,
                    ptt: false
                }, { quoted: m });
                
            } else {
                reply(`No results found for "${query}"`);
            }
        } catch (error) {
            console.error('Song error:', error.message);
            reply(`Error: ${error.message}`);
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
    command: ['play3'],
    operate: async ({ kelvin, text, m, reply, args, prefix }) => {
        if (!text) return reply(`Example: ${prefix}play3 kunsi by vyroota`);

    try {
        await kelvin.sendMessage(m.chat, {
            react: { text: '🔍', key: m.key }
        });

        // Call the songCommand function
        await fetchMp3(conn, m.chat, m);

    } catch (error) {
        console.error('Song command error:', error);
        reply(`❌ Error: ${error.message}`);
    }
 }
},
{
  command: ['instadl', 'igdl', 'instagramdl', 'reeldl'],
  operate: async ({ m, reply, args, kelvin }) => {
    const url = args[0];
    
    if (!url) return reply("*Please provide an Instagram URL.*`");
    
    try {
      const response = await fetch(`${global.api}/download/instadl?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (!data.status || !data.result) {
        return reply(`❌ Failed to download from Instagram. Check the URL.`);
      }
      
      const videoUrl = data.result;
      
      await kelvin.sendMessage(m.chat, {
        video: { url: videoUrl },
        caption: "✅ *Instagram Video Downloaded*",
      }, { quoted: m });
      
    } catch (error) {
      console.error('Instagram Download Error:', error);
      reply("❌ Error downloading from Instagram. Try again later.");
    }
  }
},
{
    command: ['mediafire', 'mf', 'mfdl'],
    operate: async ({ kelvin, m, reply, args, prefix }) => {
        const url = args[0];
        
        if (!url) return reply(`*Please provide mediafire url!*`);
        
        if (!url.includes('mediafire.com')) {
            return reply('*Please provide a valid MediaFire URL*.');
        }

        try {
            const apiUrl = `https://api.princetechn.com/api/download/mediafire?apikey=prince&url=${encodeURIComponent(url)}`;
            const response = await axios.get(apiUrl);
            
            if (response.data?.success && response.data?.result) {
                const { downloadUrl, fileName } = response.data.result;
                
                await kelvin.sendMessage(m.chat, {
                    document: { url: downloadUrl },
                    fileName: fileName
                }, { quoted: m });
                
            } else {
                reply('Failed to fetch file from MediaFire.');
            }
        } catch (error) {
            console.error(error);
            reply('Error downloading file. Please try again.');
        }
    }
},
{
    command: ['ytmp3'],
    operate: async ({ kelvin, m, reply, text, prefix, command }) => {
        if (!text) return reply(`📌 Example: ${prefix + command} shape of you or ${prefix + command} https://youtube.com/watch?v=...`);
        
        await reply("🎵 Fetching audio...");
        
        try {
            const isUrl = text.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)/i);
            
            
            const url = isUrl ? text : `https://youtube.com/watch?v=${text}`;
            
            const response = await fetch(`${global.api}/download/audio?url=${encodeURIComponent(url)}`);
            const data = await response.json();
            
            if (!data.status || !data.result) {
                return reply("❌ Couldn't get audio. Try a different song or URL.");
            }
            
            await kelvin.sendMessage(m.chat, {
                audio: { url: data.result },
                mimetype: "audio/mpeg"
            }, { quoted: m });
            
            await kelvin.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
            
        } catch (error) {
            console.error('Song error:', error);
            reply("❌ Error fetching audio");
            await kelvin.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        }
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
    command: ['facebook', 'fb', 'fbdl', 'facebookdl', 'fbvideo'],
    operate: async ({ kelvin, m, reply, text }) => {
        if (!text) return reply('*Please provide a Facebook URL*');
        
        await reply('📥 Downloading...');
        
        try {
            // Use siputzx API
            let res = await fetch(`https://api.siputzx.my.id/api/d/facebook?url=${encodeURIComponent(text)}`);
            let data = await res.json();
            
            // Check if API returned success
            if (!data.status || !data.data) {
                return reply('Failed to fetch video. Check the URL and try again.');
            }
            
            const videoData = data.data;
            const downloads = videoData.downloads || [];
            
            let videoUrl = null;
            
            // Try to get HD (720p)
            const hdVideo = downloads.find(d => d.quality === '720p (HD)' && d.type === 'video');
            if (hdVideo) {
                videoUrl = hdVideo.url;
            } else {
                // Fallback to SD (360p)
                const sdVideo = downloads.find(d => d.quality === '360p (SD)' && d.type === 'video');
                if (sdVideo) {
                    videoUrl = sdVideo.url;
                }
            }
            
            if (!videoUrl) return reply('No video download link found');
            
            await kelvin.sendMessage(m.chat, {
                video: { url: videoUrl },
                caption: `${global.wm || ''}`,
                contextInfo: { 
                    externalAdReply: { 
                        title: "Facebook Video",
                        body: "Downloaded",
                        thumbnailUrl: videoData.thumbnail || '',
                        sourceUrl: text,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    } 
                }
            }, { quoted: m });
            
            await kelvin.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
            
        } catch (error) {
            console.error('Facebook error:', error);
            reply(`❌ Error: ${error.message}`);
            await kelvin.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        }
    }
},
{
    command: ['twitter', 'tw', 'x'],
    operate: async ({ kelvin, m, reply, args, prefix }) => {
        const url = args[0];
        
        if (!url) return reply(`*Please provide twitter URL!*`);
        
        if (!url.includes('x.com') && !url.includes('twitter.com')) {
            return reply('*Please provide a valid Twitter/X URL*.');
        }

        try {
            await reply('Fetching video...');
            const apiUrl = `https://apis.davidcyril.name.ng/twitter?url=${encodeURIComponent(url)}`;
            const response = await axios.get(apiUrl);
            
            if (response.data?.success) {
                const videoUrl = response.data.video_hd || response.data.video_sd;
                
                if (!videoUrl) {
                    return reply('No video found in this tweet.');
                }
                
                await kelvin.sendMessage(m.chat, {
                    video: { url: videoUrl },
                    caption: response.data.description || 'Twitter Video'
                }, { quoted: m });
                
            } else {
                reply('Failed to fetch Twitter video.');
            }
        } catch (error) {
            console.error('Twitter error:', error);
            reply('Error downloading video.');
        }
    }
},
{
    command: ['tiktok2'],
    operate: async ({ kelvin, m, reply, args, prefix }) => {
        const url = args[0];
        
        if (!url) return reply(`*Please provide tiktok video url!*`);
        
        if (!url.includes('tiktok.com')) {
            return reply('*Please provide a valid TikTok URL*.');
        }

        try {
            const apiUrl = `https://apis.davidcyril.name.ng/download/tiktok?url=${encodeURIComponent(url)}`;
            const response = await axios.get(apiUrl);
            
            if (response.data?.success && response.data?.result?.video) {
                const videoUrl = response.data.result.video;
                const caption = `> ${global.wm || 'Vesper-Xmd'}`;
                
                await kelvin.sendMessage(m.chat, {
                    video: { url: videoUrl },
                    caption: caption
                }, { quoted: m });
                
            } else {
                reply('Failed to fetch TikTok video.');
            }
        } catch (error) {
            console.error('TikTok error:', error);
            reply('Error downloading TikTok video.');
        }
    }
},
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
            
            const apiUrl = `${global.api}/download/mp4?url=${encodeURIComponent(text)}`;
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
    command: ['video', 'videoplay'],
    operate: async ({ kelvin, m, reply, text, prefix, mess, fetchVideoDownloadUrl }) => {
        
        if (!text) return reply("*Please provide a song or video URL*");
        
        try {
            const searchQuery = text.trim();
            
            await kelvin.sendMessage(m.chat, {
                react: { text: "🎬", key: m.key }
            });
            
            const { videos } = await yts(searchQuery);
            if (!videos || videos.length === 0) {
                return reply("⚠️ *No results found for your query!*");
            }
            
            const video = videos[0];
            const videoUrl = video.url;
            
            await reply("⏳ *Searching and downloading video... Please wait*");
            
            await kelvin.sendMessage(m.chat, {
                image: { url: video.thumbnail },
                caption: `*${video.title}*\n⏱ *Duration:* ${video.timestamp}\n👁 *Views:* ${video.views.toLocaleString()}\n\n⏳ *Downloading video...*`
            }, { quoted: m });
            
            // Use fetchVideoDownloadUrl (DavidXTech first, then Hector Manuel)
            const videoDownloadUrl = await fetchVideoDownloadUrl(videoUrl);
            
            if (!videoDownloadUrl) {
                return reply("🚫 *Failed to fetch video. Try again later.*");
            }
            
            await kelvin.sendMessage(m.chat, {
                video: { url: videoDownloadUrl },
                mimetype: "video/mp4",
                fileName: `${video.title.replace(/[^\w\s]/gi, "")}.mp4`,
                caption: `🎬 *${video.title}*\n⏱ *Duration:* ${video.timestamp}`
            }, { quoted: m });
            
            await kelvin.sendMessage(m.chat, {
                react: { text: "✅", key: m.key }
            });
            
        } catch (error) {
            console.error('Error in video command:', error);
            await kelvin.sendMessage(m.chat, {
                react: { text: "❌", key: m.key }
            });
            reply("❌ *Download failed. Please try again later.*");
        }
    }
},
{
    command: ['video2'],
    operate: async ({ kelvin, text, m, reply, args, prefix }) => {
        if (!text) return reply(`Example: ${prefix}video2 Born to win by fikfamaic`);

        try {
            await reply(`🔍 Searching for "${text}"...`);

            const { videos } = await yts(text);
            if (!videos || videos.length === 0) {
                return reply(`❌ No results found for "${text}"`);
            }

            const video = videos[0];
            const videoUrl = video.url;
            let videoTitle = video.title;

            await kelvin.sendMessage(m.chat, {
                react: { text: '⏳', key: m.key }
            });

            await reply(`📥 Downloading: ${videoTitle}`);

            // Define APIs with fallback order (Keith first, then DavidCyril)
            const apis = [
                {
                    name: "Keith API",
                    fetch: async () => {
                        const apiUrl = `${global.api}/download/mp4?url=${encodeURIComponent(videoUrl)}`;
                        const response = await axios.get(apiUrl, { timeout: 60000 });
                        
                        if (!response.data?.status || !response.data?.result) {
                            throw new Error('Keith API returned no video URL');
                        }
                        
                        return {
                            downloadUrl: response.data.result,
                            title: videoTitle
                        };
                    }
                },
                {
                    name: "DavidCyril API",
                    fetch: async () => {
                        const encodedUrl = encodeURIComponent(videoUrl);
                        const apiUrl = `https://apis.davidcyril.name.ng/download/youtube-mp4?url=${encodedUrl}&quality=480`;
                        const response = await axios.get(apiUrl, { timeout: 60000 });
                        
                        if (!response.data?.status || !response.data?.download_url) {
                            throw new Error('DavidCyril API returned no video URL');
                        }
                        
                        return {
                            downloadUrl: response.data.download_url,
                            title: response.data.title || videoTitle
                        };
                    }
                }
            ];

            let downloadUrl;
            let finalTitle;

            // Try APIs in order
            for (const api of apis) {
                try {
                    console.log(`🔄 Trying ${api.name} for video2...`);
                    const result = await api.fetch();
                    downloadUrl = result.downloadUrl;
                    finalTitle = result.title;
                    console.log(`✅ ${api.name} successful!`);
                    break;
                } catch (err) {
                    console.warn(`❌ ${api.name} failed: ${err.message}`);
                    continue;
                }
            }

            if (!downloadUrl) {
                return reply(`❌ All download APIs failed. Please try again later.`);
            }

            await kelvin.sendMessage(m.chat, {
                video: { url: downloadUrl },
                mimetype: 'video/mp4',
                fileName: `${finalTitle.replace(/[^\w\s]/gi, '')}.mp4`,
                caption: `🎬 *${finalTitle}*\n\n> ${global.wm || 'Kevin Tech'}`
            }, { quoted: m });

            await kelvin.sendMessage(m.chat, {
                react: { text: '✅', key: m.key }
            });

        } catch (error) {
            console.error('Video2 error:', error);
            await kelvin.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            reply(`❌ Error: ${error.message}`);
        }
    }
},
{
  command: ['pindl', 'pinterestdl', 'pindownload'],
  operate: async ({ m, reply, args, kelvin }) => {
    const url = args[0];
    
    if (!url) return reply("*Please provide a Pinterest URL. Example: `.pindl https://pin.it/1zdlg6EPT*`");
    
    try {
      const response = await fetch(`${global.api}/download/pindl3?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (!data.status || !data.result) {
        return reply(`Failed to download from Pinterest. Check the URL.`);
      }
      
      const { thumb, video, image } = data.result;
      
      // If it's a video
      if (video) {
        await kelvin.sendMessage(m.chat, {
          video: { url: video },
          caption: "✅ *Pinterest Video Downloaded*",
          thumbnail: { url: thumb }
        }, { quoted: m });
      }
      // If it's an image
      else if (image) {
        await kelvin.sendMessage(m.chat, {
          image: { url: image },
          caption: "✅ *Pinterest Image Downloaded*"
        }, { quoted: m });
      }
      else {
        reply("❌ No downloadable content found.");
      }
      
    } catch (error) {
      console.error('Pinterest Download Error:', error);
      reply("❌ Error downloading from Pinterest. Try again later.");
    }
  }
},
{
  command: ['instaposts', 'igposts', 'instagramposts'],
  operate: async ({ m, reply, args, kelvin }) => {
    const query = args.join(' ');
    
    if (!query) return reply("*Please provide a search term. Example: `.instaposts ronaldo*`");
    
    try {
      const response = await fetch(`${global.api}/download/instaposts?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (!data.status) {
        return reply(`Failed to fetch Instagram posts.`);
      }
      
      if (data.result.total === 0 || !data.result.items?.length) {
        return reply(`No Instagram posts found for "${query}"`);
      }
      
      let message = `*Instagram Posts for "${query}"*\n\n`;
      message += `*📊 Total:* ${data.result.total}\n\n`;
      
      data.result.items.slice(0, 5).forEach((post, i) => {
        message += `*${i + 1}. Post*\n`;
        if (post.caption) message += `📝 ${post.caption.substring(0, 100)}${post.caption.length > 100 ? '...' : ''}\n`;
        if (post.likes) message += `❤️ Likes: ${post.likes}\n`;
        if (post.comments) message += `💬 Comments: ${post.comments}\n`;
        if (post.url) message += `🔗 ${post.url}\n`;
        message += `\n`;
      });
      
      reply(message);
    } catch (error) {
      console.error('Instagram Posts Error:', error);
      reply("❌ Error fetching Instagram posts. Try again later.");
    }
  }
},
{
    command: ['spotify', 'sp', 'spotifydl'],
    operate: async ({ kelvin, m, reply, args, prefix }) => {
        const url = args[0];
        
        if (!url) return reply(`Example: ${prefix}spotify https://open.spotify.com/track/xxxxx`);
        
        if (!url.includes('spotify.com')) {
            return reply('Please provide a valid Spotify URL.');
        }

        try {
            await reply('Fetching Spotify track...');
            const apiUrl = `https://apis.davidcyril.name.ng/spotifydl?url=${encodeURIComponent(url)}`;
            const response = await axios.get(apiUrl);
            
            if (response.data?.success && response.data?.DownloadLink) {
                const { title, DownloadLink, thumbnail } = response.data;
                const caption = `🎵 ${title}\n> ${global.wm || 'Vesper-Xmd'}`;
                
                if (thumbnail) {
                    await kelvin.sendMessage(m.chat, {
                        image: { url: thumbnail },
                        caption: caption
                    }, { quoted: m });
                }
                
                await kelvin.sendMessage(m.chat, {
                    audio: { url: DownloadLink },
                    mimetype: 'audio/mpeg',
                    fileName: `${title}.mp3`
                }, { quoted: m });
                
            } else {
                reply('Failed to fetch Spotify track.');
            }
        } catch (error) {
            console.error('Spotify error:', error);
            reply('Error downloading Spotify track.');
        }
    }
},
{
  command: ['capcut', 'cc', 'capcutdl'],
  operate: async ({ m, reply, args, kelvin }) => {
    const url = args[0];
    
    if (!url) return reply("*Please provide a CapCut template URL.*`");
    
    try {
      await reply("📥 Downloading CapCut template...");
      
      const response = await fetch(`${global.siputzx}/api/d/capcut?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (!data.status || !data.data || !data.data.originalVideoUrl) {
        return reply("*Failed to download CapCut template. Check the URL*.");
      }
      
      const { title, originalVideoUrl, authorName } = data.data;
      
      await kelvin.sendMessage(m.chat, {
        video: { url: originalVideoUrl },
        caption: `📹 *CapCut Template*\n📝 ${title || 'No title'}\n👤 By: ${authorName || 'Unknown'}\n\n> ${global.wm || ''}`
      }, { quoted: m });
      
      await kelvin.sendMessage(m.chat, { 
        react: { text: "✅", key: m.key } 
      });
      
    } catch (error) {
      console.error('CapCut download error:', error);
      reply("*Error downloading CapCut template. Try again later.*");
      await kelvin.sendMessage(m.chat, { 
        react: { text: "❌", key: m.key } 
      });
    }
  }
},
{
    command: ['apkdl', 'apk', 'downloadapk'],
    operate: async ({ kelvin, m, reply, args, prefix }) => {
        const appName = args.join(" ");
        
        if (!appName) return reply(`Example: ${prefix}apkdl Apk Editor`);

        try {
            await reply(`Searching for ${appName}...`);
            const apiUrl = `https://apis.davidcyril.name.ng/download/apk?text=${encodeURIComponent(appName)}`;
            const response = await axios.get(apiUrl);
            
            if (response.data?.status && response.data?.apk) {
                const { name, icon, downloadLink } = response.data.apk;
                
                if (icon) {
                    await kelvin.sendMessage(m.chat, {
                        image: { url: icon },
                        caption: name
                    }, { quoted: m });
                }
                
                await kelvin.sendMessage(m.chat, {
                    document: { url: downloadLink },
                    mimetype: 'application/vnd.android.package-archive'
                }, { quoted: m });
                
            } else {
                reply(`No APK found for "${appName}"`);
            }
        } catch (error) {
            console.error('APK error:', error);
            reply('Error downloading APK.');
        }
    }
}
    
];