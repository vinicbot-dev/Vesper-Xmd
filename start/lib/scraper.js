const cheerio = require('cheerio')
const fetch = require('node-fetch')
const axios = require('axios')
const yts = require('yt-search');
const fs = require('fs');
const path = require('path');
const fileTypeFromBuffer = require('file-type')
const randomarray = async (array) => {
	return array[Math.floor(Math.random() * array.length)]
}

async function tryRequest(getter, attempts = 3) {
	let lastError;
	for (let attempt = 1; attempt <= attempts; attempt++) {
		try {
			return await getter();
		} catch (err) {
			lastError = err;
			if (attempt < attempts) {
				await new Promise(r => setTimeout(r, 1000 * attempt));
			}
		}
	}
	throw lastError;
}

// PuruBoy API for Audio
async function getPuruBoyAudioByUrl(youtubeUrl) {
    const apiUrl = 'https://puruboy-api.vercel.app/api/downloader/ytmp3';
    const res = await axios.post(apiUrl, {
        url: youtubeUrl
    }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000
    });
    
    if (res?.data?.success && res?.data?.result?.download_url) {
        return {
            download: res.data.result.download_url,
            title: res.data.result.title
        };
    }
    throw new Error('PuruBoy API returned no download');
}

// PuruBoy API for Video
async function getPuruBoyVideoByUrl(youtubeUrl) {
    const apiUrl = 'https://puruboy-api.vercel.app/api/downloader/youtube';
    const res = await axios.post(apiUrl, {
        url: youtubeUrl
    }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000
    });
    
    if (res?.data?.success && res?.data?.result?.downloadUrl) {
        return {
            download: res.data.result.downloadUrl,
            title: res.data.result.title,
            quality: res.data.result.quality,
            size: res.data.result.size,
            thumbnail: res.data.result.thumbnail
        };
    }
    throw new Error('PuruBoy API returned no download');
}

// Main fetchMp3 function (Audio)
async function fetchMp3(kelvin, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        if (!text) {
            await kelvin.sendMessage(chatId, { text: 'Usage: .song <song name or YouTube link>' }, { quoted: message });
            return;
        }

        let video;
        let searchQuery = text;

        // Check if it's a YouTube URL or search query
        if (text.includes('youtube.com') || text.includes('youtu.be')) {
            video = { url: text };
        } else {
            // Search using yts
            const search = await yts(searchQuery);
            if (!search || !search.videos.length) {
                await kelvin.sendMessage(chatId, { text: 'No results found.' }, { quoted: message });
                return;
            }
            video = search.videos[0];
        }

        // Send thumbnail preview
        await kelvin.sendMessage(chatId, {
            image: { url: video.thumbnail },
            caption: `🎵 *${video.title}*\n⏱ Duration: ${video.timestamp}\n\n📥 Downloading audio...`
        }, { quoted: message });

        // Get download URL from PuruBoy API
        const audioData = await getPuruBoyAudioByUrl(video.url);
        const audioUrl = audioData.download;
        
        // Download audio buffer
        const audioResponse = await axios.get(audioUrl, {
            responseType: 'arraybuffer',
            timeout: 90000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const audioBuffer = Buffer.from(audioResponse.data);
        
        if (!audioBuffer || audioBuffer.length === 0) {
            throw new Error('No audio data received');
        }

        // Send audio file
        await kelvin.sendMessage(chatId, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${(audioData.title || video.title || 'song').replace(/[^\w\s-]/g, '')}.mp3`,
            ptt: false
        }, { quoted: message });

    } catch (err) {
        console.error('fetchMp3 error:', err);
        await kelvin.sendMessage(chatId, { 
            text: '❌ Failed to download song. Please try again later.' 
        }, { quoted: message });
    }
}

// Main fetchVideo function
async function fetchVideo(kelvin, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        if (!text) {
            await kelvin.sendMessage(chatId, { text: 'Usage: .video <song name or YouTube link>' }, { quoted: message });
            return;
        }

        let video;
        let searchQuery = text;

        // Check if it's a YouTube URL or search query
        if (text.includes('youtube.com') || text.includes('youtu.be')) {
            video = { url: text };
        } else {
            // Search using yts
            const search = await yts(searchQuery);
            if (!search || !search.videos.length) {
                await kelvin.sendMessage(chatId, { text: 'No results found.' }, { quoted: message });
                return;
            }
            video = search.videos[0];
        }

        // Send thumbnail preview
        await kelvin.sendMessage(chatId, {
            image: { url: video.thumbnail },
            caption: `🎬 *${video.title}*\n⏱ Duration: ${video.timestamp}\n👁 Views: ${video.views?.toLocaleString() || 'N/A'}\n\n📥 Downloading video...`
        }, { quoted: message });

        // Get download URL from PuruBoy API
        const videoData = await getPuruBoyVideoByUrl(video.url);
        const videoUrl = videoData.download;
        
        // Download video buffer
        const videoResponse = await axios.get(videoUrl, {
            responseType: 'arraybuffer',
            timeout: 120000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const videoBuffer = Buffer.from(videoResponse.data);
        
        if (!videoBuffer || videoBuffer.length === 0) {
            throw new Error('No video data received');
        }

        // Send video file
        await kelvin.sendMessage(chatId, {
            video: videoBuffer,
            mimetype: 'video/mp4',
            fileName: `${(videoData.title || video.title || 'video').replace(/[^\w\s-]/g, '')}.mp4`,
            caption: `🎬 *${videoData.title || video.title}*\n📦 Size: ${videoData.size || 'N/A'}\n🎚 Quality: ${videoData.quality || 'HD'}`
        }, { quoted: message });

    } catch (err) {
        console.error('fetchVideo error:', err);
        await kelvin.sendMessage(chatId, { 
            text: '❌ Failed to download video. Please try again later.' 
        }, { quoted: message });
    }
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
    styletext 
}