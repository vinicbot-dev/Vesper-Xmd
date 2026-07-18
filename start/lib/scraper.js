const cheerio = require('cheerio')
const axios = require('axios')
const yts = require('yt-search');
const fs = require('fs');
const path = require('path');
const FileType = require('file-type');

// Confirms a downloaded buffer is real, playable media before it gets sent -
// a dead/expired link from these third-party APIs often still returns 200
// with a small HTML error page or JSON error body, which would otherwise get
// forwarded to WhatsApp as if it were the real file.
async function assertPlayable(buffer, kind) {
    if (!buffer || buffer.length < 2048) {
        throw new Error(`Downloaded ${kind} is too small to be real media (${buffer ? buffer.length : 0} bytes) - likely a dead or expired link`);
    }
    const detected = await FileType.fromBuffer(buffer).catch(() => null);
    if (!detected || !detected.mime.startsWith(`${kind}/`)) {
        throw new Error(`Downloaded file is not playable ${kind} (got ${detected ? detected.mime : 'unknown type'})`);
    }
    return detected;
}

// fetchMp3 function 
async function fetchMp3(kelvin, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        if (!text) {
            await kelvin.sendMessage(chatId, { text: 'Usage: .song <song name or YouTube link>' }, { quoted: message });
            return;
        }

        let query = text;
        let videoTitle = "YouTube Audio";
        let videoThumbnail = "";
        let downloadUrl = "";

        // Check if it's a YouTube URL or search query
        if (text.includes('youtube.com') || text.includes('youtu.be')) {
            // Extract video ID from URL
            const videoId = extractVideoId(text);
            if (videoId) {
                query = `https://www.youtube.com/watch?v=${videoId}`;
                // Get video info using yt-search
                const search = await yts({ videoId: videoId });
                if (search && search.title) {
                    videoTitle = search.title;
                    videoThumbnail = search.thumbnail;
                }
            } else {
                await kelvin.sendMessage(chatId, { text: '❌ Invalid YouTube URL.' }, { quoted: message });
                return;
            }
        } else {
            // Search for the video first using yt-search to get the URL
            const search = await yts(text);
            if (!search || !search.videos.length) {
                await kelvin.sendMessage(chatId, { text: 'No results found.' }, { quoted: message });
                return;
            }
            const video = search.videos[0];
            query = video.url;
            videoTitle = video.title;
            videoThumbnail = video.thumbnail;
        }

        // First try the new API
        try {
            const apiUrl = 'https://api.drexapp.space/downloader/ytplay';
            const response = await axios.get(apiUrl, {
                params: { q: query },
                timeout: 30000
            });

            const result = response.data;
            
            if (result && result.status && result.result && result.result.download_url) {
                downloadUrl = result.result.download_url;
                videoTitle = result.result.title || videoTitle;
                videoThumbnail = result.result.thumbnail || videoThumbnail;
                
                // Send thumbnail with caption
                await kelvin.sendMessage(chatId, {
                    image: { url: videoThumbnail },
                    caption: `🎵 *${videoTitle}*\n📥 Downloading audio please wait...`
                }, { quoted: message });
            } else {
                throw new Error('No download URL from primary API');
            }
        } catch (primaryError) {
            console.log('Primary API failed, falling back to backup API:', primaryError.message);
            
            // Fallback to the original API
            await kelvin.sendMessage(chatId, {
                image: { url: videoThumbnail },
                caption: `🎵 *${videoTitle}*\n📥 Using backup source...`
            }, { quoted: message });

            const fallbackApiUrl = 'https://ktrenqecceeooyrquooc.supabase.co/functions/v1/api-proxy';
            const fallbackRequestBody = {
                apiKey: "guru_x3jr526k5pqbl91wqubhws3y48qj6zbo",
                action: "yt-mp3",
                payload: {
                    url: query,
                    quality: "normal"
                }
            };

            const fallbackResponse = await axios.post(fallbackApiUrl, fallbackRequestBody, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 60000
            });

            const fallbackResult = fallbackResponse.data;
            if (!fallbackResult || !fallbackResult.download || !fallbackResult.download.url) {
                throw new Error('No download URL from backup API');
            }
            
            downloadUrl = fallbackResult.download.url;
            videoTitle = fallbackResult.title || videoTitle;
        }

        // Download audio buffer
        const audioResponse = await axios.get(downloadUrl, {
            responseType: 'arraybuffer',
            timeout: 90000
        });
        
        const audioBuffer = Buffer.from(audioResponse.data);
        await assertPlayable(audioBuffer, 'audio');

        // Send as document
        await kelvin.sendMessage(chatId, {
            document: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${videoTitle.replace(/[^\w\s-]/g, '')}.mp3`,
            caption: `🎵 *${videoTitle}*\n\n> ${global.wm || 'JEXPLOIT'}`
        }, { quoted: message });

    } catch (err) {
        console.error('fetchMp3 error:', err);
        await kelvin.sendMessage(chatId, { 
            text: '❌ Failed to download song. Please try again later.' 
        }, { quoted: message });
    }
}

// fetchVideo function 
async function fetchVideo(kelvin, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        if (!text) {
            await kelvin.sendMessage(chatId, { text: 'Usage: .video <song name or YouTube link>' }, { quoted: message });
            return;
        }

        let query = text;
        let videoTitle = "YouTube Video";
        let videoThumbnail = "";
        let videoViews = 0;
        let downloadUrl = "";
        let videoQuality = "mp4";

        // Check if it's a YouTube URL or search query
        if (text.includes('youtube.com') || text.includes('youtu.be')) {
            // Extract video ID from URL
            const videoId = extractVideoId(text);
            if (videoId) {
                query = `https://www.youtube.com/watch?v=${videoId}`;
                // Get video info using yt-search
                const search = await yts({ videoId: videoId });
                if (search) {
                    videoTitle = search.title || videoTitle;
                    videoThumbnail = search.thumbnail || videoThumbnail;
                    videoViews = search.views || 0;
                }
            } else {
                await kelvin.sendMessage(chatId, { text: '❌ Invalid YouTube URL.' }, { quoted: message });
                return;
            }
        } else {
            // Search for the video first using yt-search
            const search = await yts(text);
            if (!search || !search.videos.length) {
                await kelvin.sendMessage(chatId, { text: 'No results found.' }, { quoted: message });
                return;
            }
            const video = search.videos[0];
            query = video.url;
            videoTitle = video.title;
            videoThumbnail = video.thumbnail;
            videoViews = video.views || 0;
        }

        // Send initial info with thumbnail
        await kelvin.sendMessage(chatId, {
            image: { url: videoThumbnail },
            caption: `🎬 *${videoTitle}*\n👁 Views: ${videoViews?.toLocaleString() || 'N/A'}\n\n⏳ Fetching video...`
        }, { quoted: message });

        // Define APIs with fallback order (Faa API first, then backup)
        const apis = [
            {
                name: "Faa Video API",
                fetch: async () => {
                    const apiUrl = `https://api-faa.my.id/faa/ytmp4?url=${encodeURIComponent(query)}`;
                    const response = await axios.get(apiUrl, { timeout: 30000 });
                    
                    if (!response.data?.status || !response.data?.result?.download_url) {
                        throw new Error('Faa API returned no video data');
                    }
                    
                    return {
                        downloadUrl: response.data.result.download_url,
                        title: videoTitle,
                        thumbnail: videoThumbnail,
                        quality: response.data.result.format || 'mp4'
                    };
                }
            },
            {
                name: "Backup API",
                fetch: async () => {
                    const fallbackApiUrl = 'https://ktrenqecceeooyrquooc.supabase.co/functions/v1/api-proxy';
                    const fallbackRequestBody = {
                        apiKey: "guru_x3jr526k5pqbl91wqubhws3y48qj6zbo",
                        action: "yt-mp4",
                        payload: {
                            url: query
                        }
                    };

                    const fallbackResponse = await axios.post(fallbackApiUrl, fallbackRequestBody, {
                        headers: { 'Content-Type': 'application/json' },
                        timeout: 60000
                    });

                    const fallbackResult = fallbackResponse.data;
                    if (!fallbackResult || !fallbackResult.download || !fallbackResult.download.url) {
                        throw new Error('Backup API returned no video data');
                    }
                    
                    return {
                        downloadUrl: fallbackResult.download.url,
                        title: fallbackResult.title || videoTitle,
                        thumbnail: fallbackResult.thumbnail || videoThumbnail,
                        quality: fallbackResult.download?.quality || 'HD'
                    };
                }
            }
        ];

        // Try APIs in order (Faa API first, then backup)
        for (const api of apis) {
            try {
                console.log(`🔄 Trying ${api.name} for fetchVideo...`);
                const result = await api.fetch();
                downloadUrl = result.downloadUrl;
                videoTitle = result.title;
                videoThumbnail = result.thumbnail;
                videoQuality = result.quality;
                console.log(`✅ ${api.name} successful!`);
                break;
            } catch (err) {
                console.warn(`❌ ${api.name} failed: ${err.message}`);
                continue;
            }
        }

        if (!downloadUrl) {
            throw new Error('All video download APIs failed.');
        }

        // Format selection menu
        const formatMenu = `🎬 *${videoTitle}*\n🎚 Format: ${videoQuality}\n\n*Choose download format:*\n\n` +
                          `1️⃣ Send as Video\n` +
                          `2️⃣ Send as Document\n\n` +
                          `_Reply with 1 or 2 to this message to download the format you prefer._`;
        
        // Send format selection menu
        const videoMsg = await kelvin.sendMessage(chatId, { 
            text: formatMenu 
        }, { quoted: message });

        // Store the message ID for response handling
        const selectionHandler = async (msgUpdate) => {
            try {
                const msg = msgUpdate.messages[0];
                if (!msg.message || !msg.message.extendedTextMessage) return;
                if (msg.key.remoteJid !== chatId) return;

                const selectedOption = msg.message.extendedTextMessage.text.trim();

                if (
                    msg.message.extendedTextMessage.contextInfo &&
                    msg.message.extendedTextMessage.contextInfo.stanzaId === videoMsg.key.id
                ) {
                    // Remove the listener to prevent multiple responses
                    kelvin.ev.off('messages.upsert', selectionHandler);
                    
                    await kelvin.sendMessage(chatId, { react: { text: "⬇️", key: msg.key } });

                    // Download video buffer
                    const videoResponse = await axios.get(downloadUrl, {
                        responseType: 'arraybuffer',
                        timeout: 120000
                    });
                    
                    const videoBuffer = Buffer.from(videoResponse.data);
                    await assertPlayable(videoBuffer, 'video');

                    switch (selectedOption) {
                        case "1":   
                            // Send as video
                            await kelvin.sendMessage(chatId, {
                                video: videoBuffer,
                                mimetype: 'video/mp4',
                                fileName: `${videoTitle.replace(/[^\w\s-]/g, '')}.mp4`,
                                caption: `🎬 *${videoTitle}*\n🎚 Format: ${videoQuality}\n\n✅ Downloaded successfully!`
                            }, { quoted: msg });
                            break;
                            
                        case "2":   
                            // Send as document
                            await kelvin.sendMessage(chatId, {
                                document: videoBuffer,
                                mimetype: 'video/mp4',
                                fileName: `${videoTitle.replace(/[^\w\s-]/g, '')}.mp4`,
                                caption: `🎬 *${videoTitle}*\n🎚 Format: ${videoQuality}\n\n✅ Downloaded successfully!`
                            }, { quoted: msg });
                            break;

                        default:
                            await kelvin.sendMessage(
                                chatId,
                                {
                                    text: "*❌ Invalid selection! Please reply with 1 or 2*",
                                },
                                { quoted: msg }
                            );
                            // Re-add listener for invalid selection
                            kelvin.ev.on('messages.upsert', selectionHandler);
                            return;
                    }
                    
                    // Success reaction
                    await kelvin.sendMessage(chatId, { react: { text: '✅', key: msg.key } });
                }
            } catch (error) {
                console.error('Video selection handler error:', error);
                await kelvin.sendMessage(chatId, { 
                    text: '❌ Error sending video. Please try again.' 
                }, { quoted: message });
            }
        };

        // Add the listener for format selection
        kelvin.ev.on('messages.upsert', selectionHandler);

        // Set timeout to remove listener after 2 minutes
        setTimeout(() => {
            kelvin.ev.off('messages.upsert', selectionHandler);
        }, 120000);

    } catch (err) {
        console.error('fetchVideo error:', err);
        await kelvin.sendMessage(chatId, { 
            text: '❌ Failed to download video. Please try again later.' 
        }, { quoted: message });
    }
}

// Helper function to extract video ID from URL
function extractVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=)([^&]+)/,
        /(?:youtu\.be\/)([^?]+)/,
        /(?:youtube\.com\/embed\/)([^/?]+)/
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

// Wallpaper function
async function wallpaper(title, page = '1') {
    try {
        const response = await axios.get(`https://www.besthdwallpaper.com/search?CurrentPage=${page}&q=${title}`);
        const $ = cheerio.load(response.data);
        const hasil = [];
        
        $('div.grid-item').each(function (a, b) {
            hasil.push({
                title: $(b).find('div.info > a > h3').text(),
                type: $(b).find('div.info > a:nth-child(2)').text(),
                source: 'https://www.besthdwallpaper.com/' + $(b).find('div > a:nth-child(3)').attr('href'),
                image: [
                    $(b).find('picture > img').attr('data-src') || $(b).find('picture > img').attr('src'),
                    $(b).find('picture > source:nth-child(1)').attr('srcset'),
                    $(b).find('picture > source:nth-child(2)').attr('srcset')
                ]
            });
        });
        
        return hasil;
    } catch (error) {
        console.error('Wallpaper error:', error);
        return [];
    }
}

// Wikipedia function
async function wikipedia(query) {
    try {
        const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
        const response = await axios.get(searchUrl);
        
        if (response.data && response.data.extract) {
            return {
                title: response.data.title,
                description: response.data.extract,
                url: response.data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
                thumbnail: response.data.thumbnail?.source || null
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Wikipedia error:', error);
        return null;
    }
}

// Ringtone function
async function ringtone(title) {
    try {
        const response = await axios.get('https://meloboom.com/en/search/' + title);
        const $ = cheerio.load(response.data);
        const hasil = [];
        
        $('#__next > main > section > div.jsx-2244708474.container > div > div > div > div:nth-child(4) > div > div > div > ul > li').each(function (a, b) {
            hasil.push({ 
                title: $(b).find('h4').text(), 
                source: 'https://meloboom.com/' + $(b).find('a').attr('href'), 
                audio: $(b).find('audio').attr('src') 
            });
        });
        
        return hasil;
    } catch (error) {
        console.error('Ringtone error:', error);
        return [];
    }
}

// Style text function
async function styletext(teks) {
    try {
        const response = await axios.get('http://qaz.wtf/u/convert.cgi?text=' + teks);
        const $ = cheerio.load(response.data);
        const hasil = [];
        
        $('table > tbody > tr').each(function (a, b) {
            hasil.push({ 
                name: $(b).find('td:nth-child(1) > span').text(), 
                result: $(b).find('td:nth-child(2)').text().trim() 
            });
        });
        
        return hasil;
    } catch (error) {
        console.error('Styletext error:', error);
        return [];
    }
}

module.exports = { 
    wallpaper,
    wikipedia,
    fetchMp3, 
    fetchVideo, 
    ringtone, 
    styletext
};