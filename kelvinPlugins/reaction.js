const axios = require('axios');
const sharp = require('sharp');

const ANIMU_BASE = 'https://api.some-random-api.com/animu';
const WAIFU_BASE = 'https://api.waifu.pics/sfw';

async function convertToSticker(mediaBuffer) {
    try {
        const sticker = await sharp(mediaBuffer)
            .resize(512, 512, { fit: 'cover' })
            .webp()
            .toBuffer();
        return sticker;
    } catch (error) {
        console.error('Error converting to sticker:', error);
        return null;
    }
}

async function fetchAndSendSticker(kelvin, from, endpoint, m) {
    try {
        const { data } = await axios.get(endpoint);
        
        if (data.link || data.url) {
            const imageUrl = data.link || data.url;
            const resp = await axios.get(imageUrl, {
                responseType: 'arraybuffer',
                timeout: 15000
            });
            const mediaBuf = Buffer.from(resp.data);
            const stickerBuf = await convertToSticker(mediaBuf);
            
            if (stickerBuf) {
                await kelvin.sendMessage(from, { sticker: stickerBuf }, { quoted: m });
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error('Error fetching sticker:', error);
        return false;
    }
}

async function sendAnimu(kelvin, from, type, m) {
    await fetchAndSendSticker(kelvin, from, `${ANIMU_BASE}/${type}`, m);
}

async function sendWaifu(kelvin, from, type, m) {
    await fetchAndSendSticker(kelvin, from, `${WAIFU_BASE}/${type}`, m);
}

module.exports = [
    // Animu commands
    {
        command: ['animu', 'animequote'],
        operate: async ({ kelvin, m, args }) => {
            const type = args[0]?.toLowerCase() || 'quote';
            let normalized = type;
            if (type === 'facepalm' || type === 'face_palm') normalized = 'face-palm';
            if (type === 'quote') normalized = 'quote';
            await sendAnimu(kelvin, m.chat, normalized, m);
        }
    },
    {
        command: ['animuwink'],
        operate: async ({ kelvin, m }) => {
            await sendAnimu(kelvin, m.chat, 'wink', m);
        }
    },
    {
        command: ['animupat'],
        operate: async ({ kelvin, m }) => {
            await sendAnimu(kelvin, m.chat, 'pat', m);
        }
    },
    {
        command: ['animuhug'],
        operate: async ({ kelvin, m }) => {
            await sendAnimu(kelvin, m.chat, 'hug', m);
        }
    },
    // Waifu.pics commands (all send as stickers)
    {
        command: ['kiss', 'cium', 'beso'],
        operate: async ({ kelvin, m }) => {
            await sendWaifu(kelvin, m.chat, 'kiss', m);
        }
    },
    {
        command: ['cry'],
        operate: async ({ kelvin, m }) => {
            await sendWaifu(kelvin, m.chat, 'cry', m);
        }
    },
    {
        command: ['blush'],
        operate: async ({ kelvin, m }) => {
            await sendWaifu(kelvin, m.chat, 'blush', m);
        }
    },
    {
        command: ['dance'],
        operate: async ({ kelvin, m }) => {
            await sendWaifu(kelvin, m.chat, 'dance', m);
        }
    },
    {
        command: ['kill'],
        operate: async ({ kelvin, m }) => {
            await sendWaifu(kelvin, m.chat, 'kill', m);
        }
    },
    {
        command: ['hug'],
        operate: async ({ kelvin, m }) => {
            await sendWaifu(kelvin, m.chat, 'hug', m);
        }
    },
    {
        command: ['kick'],
        operate: async ({ kelvin, m }) => {
            await sendWaifu(kelvin, m.chat, 'kick', m);
        }
    },
    {
        command: ['slap'],
        operate: async ({ kelvin, m }) => {
            await sendWaifu(kelvin, m.chat, 'slap', m);
        }
    },
    {
        command: ['happy'],
        operate: async ({ kelvin, m }) => {
            await sendWaifu(kelvin, m.chat, 'happy', m);
        }
    },
    {
        command: ['bully'],
        operate: async ({ kelvin, m }) => {
            await sendWaifu(kelvin, m.chat, 'bully', m);
        }
    },
    {
        command: ['pat', 'headpat'],
        operate: async ({ kelvin, m }) => {
            await sendWaifu(kelvin, m.chat, 'pat', m);
        }
    },
    {
        command: ['poke'],
        operate: async ({ kelvin, m }) => {
            await sendWaifu(kelvin, m.chat, 'poke', m);
        }
    },
    {
        command: ['cuddle'],
        operate: async ({ kelvin, m }) => {
            await sendWaifu(kelvin, m.chat, 'cuddle', m);
        }
    },
    {
        command: ['smile'],
        operate: async ({ kelvin, m }) => {
            await sendWaifu(kelvin, m.chat, 'smile', m);
        }
    },
    {
        command: ['wave'],
        operate: async ({ kelvin, m }) => {
            await sendWaifu(kelvin, m.chat, 'wave', m);
        }
    },
    {
        command: ['bite'],
        operate: async ({ kelvin, m }) => {
            await sendWaifu(kelvin, m.chat, 'bite', m);
        }
    },
    {
        command: ['lick'],
        operate: async ({ kelvin, m }) => {
            await sendWaifu(kelvin, m.chat, 'lick', m);
        }
    },
    {
        command: ['bonk'],
        operate: async ({ kelvin, m }) => {
            await sendWaifu(kelvin, m.chat, 'bonk', m);
        }
    },
    {
        command: ['yeet'],
        operate: async ({ kelvin, m }) => {
            await sendWaifu(kelvin, m.chat, 'yeet', m);
        }
    },
    {
        command: ['nom'],
        operate: async ({ kelvin, m }) => {
            await sendWaifu(kelvin, m.chat, 'nom', m);
        }
    },
    {
        command: ['tickle'],
        operate: async ({ kelvin, m }) => {
            await sendWaifu(kelvin, m.chat, 'tickle', m);
        }
    },
    {
        command: ['facepalm'],
        operate: async ({ kelvin, m }) => {
            await sendWaifu(kelvin, m.chat, 'facepalm', m);
        }
    },
    {
        command: ['handhold', 'holdhands'],
        operate: async ({ kelvin, m }) => {
            await sendWaifu(kelvin, m.chat, 'handhold', m);
        }
    },
    {
        command: ['stare'],
        operate: async ({ kelvin, m }) => {
            await sendWaifu(kelvin, m.chat, 'stare', m);
        }
    },
    {
        command: ['shrug'],
        operate: async ({ kelvin, m }) => {
            await sendWaifu(kelvin, m.chat, 'shrug', m);
        }
    },
    {
        command: ['scream'],
        operate: async ({ kelvin, m }) => {
            await sendWaifu(kelvin, m.chat, 'scream', m);
        }
    },
    {
        command: ['pout'],
        operate: async ({ kelvin, m }) => {
            await sendWaifu(kelvin, m.chat, 'pout', m);
        }
    },
    {
        command: ['shy'],
        operate: async ({ kelvin, m }) => {
            await sendWaifu(kelvin, m.chat, 'shy', m);
        }
    },
    {
        command: ['thinking'],
        operate: async ({ kelvin, m }) => {
            await sendWaifu(kelvin, m.chat, 'thinking', m);
        }
    },
    {
        command: ['love'],
        operate: async ({ kelvin, m }) => {
            await sendWaifu(kelvin, m.chat, 'love', m);
        }
    }
];