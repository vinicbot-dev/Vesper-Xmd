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
const { toAudio } = require('../../start/lib/converter')

const AXIOS_DEFAULTS = {
	timeout: 60000,
	headers: {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
		'Accept': 'application/json, text/plain, */*'
	}
};

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

// EliteProTech API - Primary
async function getEliteProTechDownloadByUrl(youtubeUrl) {
	const apiUrl = `https://eliteprotech-apis.zone.id/ytdown?url=${encodeURIComponent(youtubeUrl)}&format=mp3`;
	const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
	if (res?.data?.success && res?.data?.downloadURL) {
		return {
			download: res.data.downloadURL,
			title: res.data.title
		};
	}
	throw new Error('EliteProTech ytdown returned no download');
}

async function getYupraDownloadByUrl(youtubeUrl) {
	const apiUrl = `https://api.yupra.my.id/api/downloader/ytmp3?url=${encodeURIComponent(youtubeUrl)}`;
	const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
	if (res?.data?.success && res?.data?.data?.download_url) {
		return {
			download: res.data.data.download_url,
			title: res.data.data.title,
			thumbnail: res.data.data.thumbnail
		};
	}
	throw new Error('Yupra returned no download');
}

async function getOkatsuDownloadByUrl(youtubeUrl) {
	const apiUrl = `https://okatsu-rolezapiiz.vercel.app/downloader/ytmp3?url=${encodeURIComponent(youtubeUrl)}`;
	const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
	if (res?.data?.dl) {
		return {
			download: res.data.dl,
			title: res.data.title,
			thumbnail: res.data.thumb
		};
	}
	throw new Error('Okatsu ytmp3 returned no download');
}

async function fetchMp3(kelvin, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        if (!text) {
            await kelvin.sendMessage(chatId, { text: 'Usage: .song <song name or YouTube link>' }, { quoted: message });
            return;
        }

        let video;
        if (text.includes('youtube.com') || text.includes('youtu.be')) {
			video = { url: text };
        } else {
			const search = await yts(text);
			if (!search || !search.videos.length) {
                await kelvin.sendMessage(chatId, { text: 'No results found.' }, { quoted: message });
                return;
            }
			video = search.videos[0];
        }

        // Inform user
        await kelvin.sendMessage(chatId, {
            image: { url: video.thumbnail },
            caption: `🎵 Downloading: *${video.title}*\n⏱ Duration: ${video.timestamp}`
        }, { quoted: message });

		let audioData;
		let audioBuffer;
		let downloadSuccess = false;
		
		const apiMethods = [
			{ name: 'EliteProTech', method: () => getEliteProTechDownloadByUrl(video.url) },
			{ name: 'Yupra', method: () => getYupraDownloadByUrl(video.url) },
			{ name: 'Okatsu', method: () => getOkatsuDownloadByUrl(video.url) }
		];
		
		for (const apiMethod of apiMethods) {
			try {
				audioData = await apiMethod.method();
				const audioUrl = audioData.download || audioData.dl || audioData.url;
				
				if (!audioUrl) {
					console.log(`${apiMethod.name} returned no download URL, trying next API...`);
					continue;
				}
				
				try {
					const audioResponse = await axios.get(audioUrl, {
						responseType: 'arraybuffer',
						timeout: 90000,
						maxContentLength: Infinity,
						maxBodyLength: Infinity,
						decompress: true,
						validateStatus: s => s >= 200 && s < 400,
						headers: {
							'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
							'Accept': '*/*',
							'Accept-Encoding': 'identity'
						}
					});
					
					if (!audioResponse || !audioResponse.data) {
						throw new Error('No data received');
					}
					
					audioBuffer = Buffer.from(audioResponse.data);
					
					if (audioBuffer && audioBuffer.length > 0 && audioBuffer.length > 1000) {
						downloadSuccess = true;
						break;
					} else {
						throw new Error('Buffer too small or empty');
					}
				} catch (downloadErr) {
					const statusCode = downloadErr.response?.status || downloadErr.status;
					if (statusCode === 451) {
						console.log(`Download blocked (451) from ${apiMethod.name}, trying next API...`);
						continue;
					}
					
					try {
						const audioResponse = await axios.get(audioUrl, {
							responseType: 'stream',
							timeout: 90000,
							maxContentLength: Infinity,
							maxBodyLength: Infinity,
							validateStatus: s => s >= 200 && s < 400,
							headers: {
								'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
								'Accept': '*/*',
								'Accept-Encoding': 'identity'
							}
						});
						const chunks = [];
						await new Promise((resolve, reject) => {
							audioResponse.data.on('data', c => chunks.push(c));
							audioResponse.data.on('end', resolve);
							audioResponse.data.on('error', reject);
						});
						audioBuffer = Buffer.concat(chunks);
						
						if (audioBuffer && audioBuffer.length > 0 && audioBuffer.length > 1000) {
							downloadSuccess = true;
							break;
						}
					} catch (streamErr) {
						console.log(`Stream download failed from ${apiMethod.name}:`, streamErr.message);
						continue;
					}
				}
			} catch (apiErr) {
				console.log(`${apiMethod.name} API failed:`, apiErr.message);
				continue;
			}
		}
		
		if (!downloadSuccess || !audioBuffer || audioBuffer.length === 0) {
			throw new Error('All download sources failed. The content may be unavailable or blocked.');
		}

		// Validate buffer size (should be at least 10KB for a valid audio file)
		if (audioBuffer.length < 10240) {
			console.log(`Buffer too small: ${audioBuffer.length} bytes, might be invalid`);
			// Still try to send but log warning
		}

		// Detect actual file format from signature
		const firstBytes = audioBuffer.slice(0, 12);
		const hexSignature = firstBytes.toString('hex');
		const asciiSignature = firstBytes.toString('ascii', 4, 8);

		let fileExtension = 'mp3';
		let detectedFormat = 'unknown';

		// Check for MP4/M4A (ftyp box)
		if (asciiSignature === 'ftyp' || hexSignature.startsWith('000000')) {
			const ftypBox = audioBuffer.slice(4, 8).toString('ascii');
			if (ftypBox === 'ftyp') {
				detectedFormat = 'M4A/MP4';
				fileExtension = 'm4a';
			}
		}
		// Check for MP3 (ID3 tag or MPEG frame sync)
		else if (audioBuffer.toString('ascii', 0, 3) === 'ID3' || 
		         (audioBuffer[0] === 0xFF && (audioBuffer[1] & 0xE0) === 0xE0)) {
			detectedFormat = 'MP3';
			fileExtension = 'mp3';
		}
		// Check for OGG/Opus
		else if (audioBuffer.toString('ascii', 0, 4) === 'OggS') {
			detectedFormat = 'OGG/Opus';
			fileExtension = 'ogg';
		}
		// Check for WAV
		else if (audioBuffer.toString('ascii', 0, 4) === 'RIFF') {
			detectedFormat = 'WAV';
			fileExtension = 'wav';
		}
		else {
			detectedFormat = 'Unknown';
			fileExtension = 'mp3';
		}

	    // Convert to MP3 if not already MP3
let finalBuffer = audioBuffer;
let finalExtension = 'mp3';

if (fileExtension !== 'mp3') {
	try {
		console.log(`Converting ${detectedFormat} to MP3...`);
		const conversionResult = await toAudio(audioBuffer, fileExtension);
		
		// The toAudio function returns an object with { data, filename, delete }
		if (conversionResult && conversionResult.data && conversionResult.data.length > 0) {
			finalBuffer = conversionResult.data;
			console.log(`Conversion successful: ${finalBuffer.length} bytes`);
			finalExtension = 'mp3';
			
			// Clean up temp file if it exists
			if (conversionResult.delete && typeof conversionResult.delete === 'function') {
				try {
					await conversionResult.delete();
				} catch (e) {
					// Ignore cleanup errors
				}
			}
		} else {
			console.log('Conversion failed, using original buffer');
			finalBuffer = audioBuffer;
			finalExtension = fileExtension;
		}
	} catch (convErr) {
		console.log(`Conversion error: ${convErr.message}, using original format`);
		finalBuffer = audioBuffer;
		finalExtension = fileExtension;
	}
}

		// Send buffer as audio
		await kelvin.sendMessage(chatId, {
			audio: finalBuffer,
			mimetype: 'audio/mpeg',
			fileName: `${(audioData.title || video.title || 'song').replace(/[^\w\s-]/g, '')}.${finalExtension}`,
			ptt: false
		}, { quoted: message });

		// Cleanup temp files
		try {
			const tempDir = path.join(__dirname, '../temp');
			if (fs.existsSync(tempDir)) {
				const files = fs.readdirSync(tempDir);
				const now = Date.now();
				files.forEach(file => {
					const filePath = path.join(tempDir, file);
					try {
						const stats = fs.statSync(filePath);
						if (now - stats.mtimeMs > 10000) {
							if (file.endsWith('.mp3') || file.endsWith('.m4a') || /^\d+\.(mp3|m4a)$/.test(file)) {
								fs.unlinkSync(filePath);
							}
						}
					} catch (e) {}
				});
			}
		} catch (cleanupErr) {}

    } catch (err) {
        console.error('Song command error:', err);
        
        let errorMessage = '❌ Failed to download song.';
        if (err.message && err.message.includes('blocked')) {
            errorMessage = '❌ Download blocked. The content may be unavailable in your region.';
        } else if (err.response?.status === 451 || err.status === 451) {
            errorMessage = '❌ Content unavailable (451). This may be due to legal restrictions.';
        } else if (err.message && err.message.includes('All download sources failed')) {
            errorMessage = '❌ All download sources failed. The content may be unavailable or blocked.';
        } else if (err.message && err.message.includes('buffer')) {
            errorMessage = '❌ Failed to process audio. Please try a different song.';
        }
        
        await kelvin.sendMessage(chatId, { 
            text: errorMessage 
        }, { quoted: message });
    }
}

// EliteProTech API for Video
async function getEliteProTechVideo(youtubeUrl) {
    const apiUrl = `https://eliteprotech-apis.zone.id/ytdown?url=${encodeURIComponent(youtubeUrl)}&format=mp4`;
    const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
    if (res?.data?.success && res?.data?.downloadURL) {
        return {
            download: res.data.downloadURL,
            title: res.data.title
        };
    }
    throw new Error('EliteProTech returned no download');
}

// Yupra API for Video
async function getYupraVideo(youtubeUrl) {
    const apiUrl = `https://api.yupra.my.id/api/downloader/ytmp4?url=${encodeURIComponent(youtubeUrl)}`;
    const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
    if (res?.data?.success && res?.data?.data?.download_url) {
        return {
            download: res.data.data.download_url,
            title: res.data.data.title,
            thumbnail: res.data.data.thumbnail
        };
    }
    throw new Error('Yupra returned no download');
}

// Okatsu API for Video
async function getOkatsuVideo(youtubeUrl) {
    const apiUrl = `https://okatsu-rolezapiiz.vercel.app/downloader/ytmp4?url=${encodeURIComponent(youtubeUrl)}`;
    const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
    if (res?.data?.result?.mp4) {
        return {
            download: res.data.result.mp4,
            title: res.data.result.title
        };
    }
    throw new Error('Okatsu returned no download');
}

// Main fetchVideo function
async function fetchVideo(youtubeUrl) {
    const apiMethods = [
        { name: 'EliteProTech', method: () => getEliteProTechVideo(youtubeUrl) },
        { name: 'Yupra', method: () => getYupraVideo(youtubeUrl) },
        { name: 'Okatsu', method: () => getOkatsuVideo(youtubeUrl) }
    ];

    for (const apiMethod of apiMethods) {
        try {
            console.log(`🔄 Trying ${apiMethod.name} for Video...`);
            const result = await apiMethod.method();
            if (result && result.download) {
                console.log(`✅ ${apiMethod.name} successful!`);
                return result;
            }
        } catch (err) {
            console.warn(`❌ ${apiMethod.name} failed: ${err.message}`);
            continue;
        }
    }
    throw new Error("All Video download APIs failed.");
}

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

module.exports = { wallpaper, fetchMp3, fetchVideo, wikimedia, ringtone, styletext }