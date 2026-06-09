const cheerio = require('cheerio')
const fetch = require('node-fetch')
const axios = require('axios')
const yts = require('yt-search');
const fs = require('fs');
const path = require('path');
const fileTypeFromBuffer = require('file-type')
const { ytdl } = require('ytdl-plus');
const randomarray = async (array) => {
	return array[Math.floor(Math.random() * array.length)]
}

// fetchMp3 function (Audio using ytdl-plus)
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
            // Get video info from URL
            const info = await ytdl.getInfo(text);
            videoUrl = text;
            videoTitle = info.videoDetails.title;
            videoThumbnail = info.videoDetails.thumbnails[0]?.url || '';
        } else {
            // Search using yts first
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

        // Download audio using ytdl-plus
        const result = await ytdl.downloadAudio(videoUrl, {
            format: 'mp3',
            quality: 'highestaudio'
        });

        // Read the downloaded file
        const audioBuffer = fs.readFileSync(result.outputPath);
        
        if (!audioBuffer || audioBuffer.length === 0) {
            throw new Error('No audio data received');
        }

        await kelvin.sendMessage(chatId, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${videoTitle.replace(/[^\w\s-]/g, '')}.mp3`,
            ptt: false
        }, { quoted: message });

        // Clean up temp file
        try {
            if (fs.existsSync(result.outputPath)) {
                fs.unlinkSync(result.outputPath);
            }
        } catch (e) {}

    } catch (err) {
        console.error('fetchMp3 error:', err);
        await kelvin.sendMessage(chatId, { 
            text: '❌ Failed to download song. Please try again later.' 
        }, { quoted: message });
    }
}

// fetchVideo function (Video using ytdl-plus)
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
            // Get video info from URL
            const info = await ytdl.getInfo(text);
            videoUrl = text;
            videoTitle = info.videoDetails.title;
            videoThumbnail = info.videoDetails.thumbnails[0]?.url || '';
            videoViews = info.videoDetails.viewCount;
        } else {
            // Search using yts first
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

        // Download video using ytdl-plus
        const result = await ytdl.download(videoUrl, {
            quality: 'highest',
            format: 'mp4'
        });

        // Read the downloaded file
        const videoBuffer = fs.readFileSync(result.outputPath);
        
        if (!videoBuffer || videoBuffer.length === 0) {
            throw new Error('No video data received');
        }

        await kelvin.sendMessage(chatId, {
            video: videoBuffer,
            mimetype: 'video/mp4',
            fileName: `${videoTitle.replace(/[^\w\s-]/g, '')}.mp4`,
            caption: `🎬 *${videoTitle}*`
        }, { quoted: message });

        // Clean up temp file
        try {
            if (fs.existsSync(result.outputPath)) {
                fs.unlinkSync(result.outputPath);
            }
        } catch (e) {}

    } catch (err) {
        console.error('fetchVideo error:', err);
        await kelvin.sendMessage(chatId, { 
            text: '❌ Failed to download video. Please try again later.' 
        }, { quoted: message });
    }
}

// Keep other functions as they are (instagram, pinterest, spotify, etc.)
async function instagramDownload(url) {
    const apiUrl = `https://go-api-six.vercel.app/instagram/stream?url=${encodeURIComponent(url)}`;
    const res = await axios.get(apiUrl, { timeout: 30000 });
    return res.data;
}

async function pinterestDownload(url) {
    const apiUrl = `https://go-api-six.vercel.app/pinterest/stream?url=${encodeURIComponent(url)}`;
    const res = await axios.get(apiUrl, { timeout: 30000 });
    return res.data;
}

async function spotifySearch(query) {
    const apiUrl = `https://go-api-six.vercel.app/spotify/search?q=${encodeURIComponent(query)}`;
    const res = await axios.get(apiUrl, { timeout: 30000 });
    return res.data;
}

async function spotifyStream(url) {
    const apiUrl = `https://go-api-six.vercel.app/spotify/stream?url=${encodeURIComponent(url)}`;
    const res = await axios.get(apiUrl, { timeout: 30000 });
    return res.data;
}

async function tiktokDownload(url) {
    const apiUrl = `https://go-api-six.vercel.app/tiktok/download?url=${encodeURIComponent(url)}`;
    const res = await axios.get(apiUrl, { timeout: 30000 });
    return res.data;
}

async function twitterDownload(url) {
    const apiUrl = `https://go-api-six.vercel.app/x/download?url=${encodeURIComponent(url)}`;
    const res = await axios.get(apiUrl, { timeout: 30000 });
    return res.data;
}

// Wallpaper function
function wallpaper(title, page = '1') {
    return new Promise((resolve, reject) => {
        axios.get(`https://www.besthdwallpaper.com/search?CurrentPage=${page}&q=${title}`)
        .then(({ data }) => {
            let $ = cheerio.load(data)
            let hasil = []
            $('div.grid-item').each(function (a, b) {
                hasil.push({
                    title: $(b).find('div.info > a > h3').text(),
                    type: $(b).find('div.info > a:nth-child(2)').text(),
                    source: 'https://www.besthdwallpaper.com/'+$(b).find('div > a:nth-child(3)').attr('href'),
                    image: [$(b).find('picture > img').attr('data-src') || $(b).find('picture > img').attr('src'), $(b).find('picture > source:nth-child(1)').attr('srcset'), $(b).find('picture > source:nth-child(2)').attr('srcset')]
                })
            })
            resolve(hasil)
        })
    })
}

// Wikimedia function
function wikimedia(title) {
    return new Promise((resolve, reject) => {
        axios.get(`https://commons.wikimedia.org/w/index.php?search=${title}&title=Special:MediaSearch&go=Go&type=image`)
        .then((res) => {
            let $ = cheerio.load(res.data)
            let hasil = []
            $('.sdms-search-results__list-wrapper > div > a').each(function (a, b) {
                hasil.push({
                    title: $(b).find('img').attr('alt'),
                    source: $(b).attr('href'),
                    image: $(b).find('img').attr('data-src') || $(b).find('img').attr('src')
                })
            })
            resolve(hasil)
        })
    })
}

// Ringtone function
function ringtone(title) {
    return new Promise((resolve, reject) => {
        axios.get('https://meloboom.com/en/search/'+title)
        .then((get) => {
            let $ = cheerio.load(get.data)
            let hasil = []
            $('#__next > main > section > div.jsx-2244708474.container > div > div > div > div:nth-child(4) > div > div > div > ul > li').each(function (a, b) {
                hasil.push({ title: $(b).find('h4').text(), source: 'https://meloboom.com/'+$(b).find('a').attr('href'), audio: $(b).find('audio').attr('src') })
            })
            resolve(hasil)
        })
    })
}

// Style text function
function styletext(teks) {
    return new Promise((resolve, reject) => {
        axios.get('http://qaz.wtf/u/convert.cgi?text='+teks)
        .then(({ data }) => {
            let $ = cheerio.load(data)
            let hasil = []
            $('table > tbody > tr').each(function (a, b) {
                hasil.push({ name: $(b).find('td:nth-child(1) > span').text(), result: $(b).find('td:nth-child(2)').text().trim() })
            })
            resolve(hasil)
        })
    })
}

module.exports = { 
    wallpaper, 
    fetchMp3, 
    fetchVideo, 
    wikimedia, 
    ringtone, 
    styletext,
    instagramDownload,
    pinterestDownload,
    spotifySearch,
    spotifyStream,
    tiktokDownload,
    twitterDownload
}