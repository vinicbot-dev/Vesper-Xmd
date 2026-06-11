const cheerio = require('cheerio')
const axios = require('axios')
const yts = require('yt-search');
const fs = require('fs');
const path = require('path');

// fetchMp3 function using the API (yt-mp3) - sends as document with normal quality
async function fetchMp3(kelvin, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        if (!text) {
            await kelvin.sendMessage(chatId, { text: 'Usage: .song <song name or YouTube link>' }, { quoted: message });
            return;
        }

        let videoUrl;
        let videoTitle;
        let videoThumbnail;

        if (text.includes('youtube.com') || text.includes('youtu.be')) {
            videoUrl = text;
            const search = await yts({ videoId: extractVideoId(text) });
            if (search && search.title) {
                videoTitle = search.title;
                videoThumbnail = search.thumbnail;
            } else {
                videoTitle = "YouTube Video";
                videoThumbnail = "";
            }
        } else {
            const search = await yts(text);
            if (!search || !search.videos.length) {
                await kelvin.sendMessage(chatId, { text: 'No results found.' }, { quoted: message });
                return;
            }
            videoUrl = search.videos[0].url;
            videoTitle = search.videos[0].title;
            videoThumbnail = search.videos[0].thumbnail;
        }

        await kelvin.sendMessage(chatId, {
            image: { url: videoThumbnail },
            caption: `🎵 *${videoTitle}*\n\n📥 Downloading audio...`
        }, { quoted: message });

        // API call for MP3 (normal quality)
        const apiUrl = 'https://ktrenqecceeooyrquooc.supabase.co/functions/v1/api-proxy';
        const requestBody = {
            apiKey: "guru_x3jr526k5pqbl91wqubhws3y48qj6zbo",
            action: "yt-mp3",
            payload: {
                url: videoUrl,
                quality: "normal"
            }
        };

        const response = await axios.post(apiUrl, requestBody, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 60000
        });

        const result = response.data;

        if (!result || !result.download || !result.download.url) {
            throw new Error('No download URL received');
        }

        const audioUrl = result.download.url;
        const audioTitle = result.title || videoTitle;

        // Download audio buffer
        const audioResponse = await axios.get(audioUrl, {
            responseType: 'arraybuffer',
            timeout: 90000
        });
        
        const audioBuffer = Buffer.from(audioResponse.data);

        // Send as document
        await kelvin.sendMessage(chatId, {
            document: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${audioTitle.replace(/[^\w\s-]/g, '')}.mp3`,
            caption: `🎵 *${audioTitle}*\n\n> ${global.wm || 'JEXPLOIT'}`
        }, { quoted: message });

    } catch (err) {
        console.error('fetchMp3 error:', err);
        await kelvin.sendMessage(chatId, { 
            text: '❌ Failed to download song. Please try again later.' 
        }, { quoted: message });
    }
}

// fetchVideo function using the API (yt-mp4)
async function fetchVideo(kelvin, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        if (!text) {
            await kelvin.sendMessage(chatId, { text: 'Usage: .video <song name or YouTube link>' }, { quoted: message });
            return;
        }

        let videoUrl;
        let videoTitle;
        let videoThumbnail;
        let videoViews;

        if (text.includes('youtube.com') || text.includes('youtu.be')) {
            videoUrl = text;
            const search = await yts({ videoId: extractVideoId(text) });
            if (search) {
                videoTitle = search.title;
                videoThumbnail = search.thumbnail;
                videoViews = search.views;
            } else {
                videoTitle = "YouTube Video";
                videoThumbnail = "";
                videoViews = 0;
            }
        } else {
            const search = await yts(text);
            if (!search || !search.videos.length) {
                await kelvin.sendMessage(chatId, { text: 'No results found.' }, { quoted: message });
                return;
            }
            videoUrl = search.videos[0].url;
            videoTitle = search.videos[0].title;
            videoThumbnail = search.videos[0].thumbnail;
            videoViews = search.videos[0].views;
        }

        await kelvin.sendMessage(chatId, {
            image: { url: videoThumbnail },
            caption: `🎬 *${videoTitle}*\n👁 Views: ${videoViews?.toLocaleString() || 'N/A'}\n\n📥 Downloading video...`
        }, { quoted: message });

        // API call for MP4
        const apiUrl = 'https://ktrenqecceeooyrquooc.supabase.co/functions/v1/api-proxy';
        const requestBody = {
            apiKey: "guru_x3jr526k5pqbl91wqubhws3y48qj6zbo",
            action: "yt-mp4",
            payload: {
                url: videoUrl
            }
        };

        const response = await axios.post(apiUrl, requestBody, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 60000
        });

        const result = response.data;

        if (!result || !result.download || !result.download.url) {
            throw new Error('No video download URL received');
        }

        const videoDownloadUrl = result.download.url;
        const videoQuality = result.download.quality || 'HD';
        const videoFormat = result.download.format || 'mp4';

        // Download video buffer
        const videoResponse = await axios.get(videoDownloadUrl, {
            responseType: 'arraybuffer',
            timeout: 120000
        });
        
        const videoBuffer = Buffer.from(videoResponse.data);

        await kelvin.sendMessage(chatId, {
            video: videoBuffer,
            mimetype: 'video/mp4',
            fileName: `${videoTitle.replace(/[^\w\s-]/g, '')}.mp4`,
            caption: `🎬 *${videoTitle}*\n🎚 Quality: ${videoQuality}`
        }, { quoted: message });

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