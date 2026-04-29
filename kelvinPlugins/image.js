const cheerio = require('cheerio')
const axios = require('axios');
const { wallpaper, wikimedia } = require('../start/lib/scraper');
const { handleMediaUpload } = require('../start/lib/catbox');

class Wallpaper {
    constructor() {
        this.base = 'https://4kwallpapers.com';
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
        };
    }

    async search(q) {
        if (!q) return 'Missing query.';
        try {
            const { data } = await axios.get(`${this.base}/search/?text=${q}`, {
                headers: this.headers
            });
            const $ = cheerio.load(data);
            let res = [];
            $('div#pics-list .wallpapers__item').each((i, e) => {
                res.push({
                    thumbnail: $(e).find('img').attr('src'),
                    title: $(e).find('.title2').text().trim(),
                    url: $(e).find('a').attr('href')
                });
            });
            return res;
        } catch (e) {
            return e.message;
        }
    }

    async download(url) {
        if (!url) return 'Missing wallpaper URL.';
        try {
            const { data } = await axios.get(url, { headers: this.headers });
            const $ = cheerio.load(data);
            const main = $('#main-pic');
            const list = $('#res-list');
            let res = {
                title: $('.main-id .selected').text().trim(),
                thumbnail: $(main).find('img').attr('src'),
                image: {
                    desktop: [],
                    mobile: [],
                    tablet: []
                }
            };
            $(list).find('span').eq(0).find('a').each((i, e) => {
                res.image.desktop.push({
                    res: $(e).text().trim(),
                    url: this.base + $(e).attr('href')
                });
            });
            $(list).find('span').eq(1).find('a').each((i, e) => {
                res.image.mobile.push({
                    res: $(e).text().trim(),
                    url: this.base + $(e).attr('href')
                });
            });
            $(list).find('span').eq(2).find('a').each((i, e) => {
                res.image.tablet.push({
                    res: $(e).text().trim(),
                    url: this.base + $(e).attr('href')
                });
            });
            return res;
        } catch (e) {
            return e.message;
        }
    }
}

module.exports = [
  {
    command: ['wallpaper', 'wp', 'wall'],
    operate: async ({ kelvin, m, reply, text, from }) => {
        if (!text) {
        return reply("Please provide a search query.\n\nExample: .wallpaper Sunset Scenes");
    }
    
    try {
        await kelvin.sendPresenceUpdate('composing', from);
        
        const apiUrl = `https://api.princetechn.com/api/search/wallpaper?apikey=prince&query=${encodeURIComponent(text)}`;
        const { data } = await axios.get(apiUrl, { timeout: 15000 });
        
        if (data && data.success && data.results && data.results.length > 0) {
            const randomIndex = Math.floor(Math.random() * data.results.length);
            const wallpaper = data.results[randomIndex];
            const imageUrl = wallpaper.image[0];
            
            const caption = `🖼️ *Wallpaper*\n\n📌 *Type:* ${wallpaper.type}\n🔍 *Search:* ${query}`;
            
            await kelvin.sendMessage(from, {
                image: { url: imageUrl },
                caption: caption
            }, { quoted: m });
        } else {
            reply(`❌ No wallpapers found for "${query}".`);
        }
    } catch (error) {
        console.error('Wallpaper error:', error.message);
        reply("❌ Error fetching wallpaper. Please try again later!");
      }
    
   }
},
{
    command: ['wikipedia', 'wiki', 'media'],
    operate: async ({ kelvin, m, reply, text }) => {
        if (!text) return reply("📌 *Enter a search query.*\n\nExample: .wikipedia Elon Musk");

    try {
        const apiUrl = `https://api.princetechn.com/api/search/wikimedia?apikey=prince&title=${encodeURIComponent(text)}`;
        const { data } = await axios.get(apiUrl, { timeout: 15000 });
        
        if (data && data.success && data.results) {
            const result = data.results;
            const imageUrl = result.originalImage?.source || result.thumbnail?.source;
            
            const caption = `📌 *Title:* ${result.title}\n\n📝 *Description:* ${result.description || 'No description available'}\n\n📖 *Extract:* ${result.extract || 'No extract available'}\n\n🔗 *Source:* ${result.pageUrl}\n📅 *Last Modified:* ${result.lastModified || 'Unknown'}`;
            
            if (imageUrl) {
                await kelvin.sendMessage(m.chat, {
                    image: { url: imageUrl },
                    caption: caption
                }, { quoted: m });
            } else {
                reply(caption);
            }
        } else {
            reply(`❌ *No Wikipedia results found for "${text}".*`);
        }
    } catch (error) {
        console.error('Wikipedia error:', error.message);
        reply("❌ *An error occurred while fetching Wikipedia results.*");
    }
    
  }
},
{
    command: ['remini', 'enhance', 'hdimage'],
    operate: async ({ kelvin, m, reply, prefix, command, quoted, mime }) => {
        const quotedMsg = m.quoted ? m.quoted : null;
        const mimeType = quotedMsg?.mimetype || "";

        if (!quotedMsg) return reply(`Send or reply to an image.\nExample: ${prefix}remini`);
        if (!/image/.test(mimeType)) return reply(`Please reply to an image with: ${prefix}${command}`);

        try {
            const imageUrl = await handleMediaUpload(quotedMsg, kelvin, mimeType);
            
            if (!imageUrl || imageUrl.includes('exceeds the limit')) {
                return reply(`Failed to upload image. Try again.`);
            }
            
            const reminiUrl = `https://apis.davidcyril.name.ng/remini?url=${encodeURIComponent(imageUrl)}`;
            const response = await axios.get(reminiUrl, {
                responseType: 'arraybuffer'
            });
            
            await kelvin.sendMessage(m.chat, { 
                image: Buffer.from(response.data), 
                caption: `Image enhanced successfully!\n> ${global.wm || 'Vesper-Xmd'}`
            }, { quoted: m });
            
        } catch (error) {
            console.error('Remini error:', error);
            reply(`An error occurred while enhancing the image.`);
        }
    }
},
  {
    command: ['4kwallpaper'],
    operate: async ({ kelvin, mek, args, from, sender, key, q, m, reply, text }) => {
    try {
        const wallpaper = new Wallpaper();
        const type = args[0];

        if (!type) {
            return reply(
                `🌆 *4K Wallpaper Commands*\n\n` +
                `📂 *Browse Categories:*\n` +
                `• .4kwallpaper popular - Most popular wallpapers\n` +
                `• .4kwallpaper featured - Featured wallpapers\n` +
                `• .4kwallpaper random - Random wallpapers\n` +
                `• .4kwallpaper collection - Wallpaper collections\n\n` +
                `🔍 *Search Wallpapers:*\n` +
                `• .4kwallpaper search nature\n` +
                `• .4kwallpaper search car\n` +
                `• .4kwallpaper search anime\n\n` +
                `📥 *Download Wallpaper:*\n` +
                `• .4kwallpaper dl https://4kwallpapers.com/...\n\n` +
                `💡 *Tip:* First browse or search, then use the download link provided!\n\n` +
                `👤 *Requested by:* @${sender.split('@')[0]}`,
                { mentions: [sender] }
            );
        }

        await kelvin.sendMessage(from, { react: { text: '⏳', key: m.key } });

        if (['popular', 'featured', 'random', 'collection'].includes(type)) {
            let endpoint;
            switch(type) {
                case 'popular': endpoint = 'most-popular-4k-wallpapers/'; break;
                case 'featured': endpoint = 'best-4k-wallpapers/'; break;
                case 'random': endpoint = 'random-wallpapers/'; break;
                case 'collection': endpoint = 'collections-packs/'; break;
            }

            const { data } = await axios.get(`${wallpaper.base}/${endpoint}`, {
                headers: wallpaper.headers
            });
            const $ = cheerio.load(data);
            let result = [];
            
            $('div#pics-list .wallpapers__item').each((i, e) => {
                if (i < 10) {
                    result.push(`${i + 1}. ${$(e).find('.title2').text().trim()}\n🔗 ${$(e).find('a').attr('href')}`);
                }
            });

            await kelvin.sendMessage(from, {
                text: `🌆 *${type.toUpperCase()} Wallpapers*\n\n${result.join('\n\n')}\n\n📥 *Download any wallpaper:*\n.4kwallpaper dl [URL]\n\n👤 *Requested by:* @${sender.split('@')[0]}\n\n> ${global.wm}`,
                mentions: [sender]
            }, { quoted: m });

        } else if (type === 'search') {
            if (!args[1]) {
                return reply(
                    `❌ *Search Query Required*\n\n` +
                    `*Usage:* .4kwallpaper search <keyword>\n\n` +
                    `*Examples:*\n` +
                    `• .4kwallpaper search ocean\n` +
                    `• .4kwallpaper search mountains\n` +
                    `• .4kwallpaper search cars\n\n` +
                    `👤 *Requested by:* @${sender.split('@')[0]}`,
                    { mentions: [sender] }
                );
            }
            
            const query = args.slice(1).join(' ');
            const searchData = await wallpaper.search(query);
            
            if (typeof searchData === 'string') {
                return reply(`❌ Search failed: ${searchData}`);
            }
            
            if (searchData.length === 0) {
                return reply(`🔍 No wallpapers found for: *${query}*\n\nTry different keywords!\n\n👤 *Requested by:* @${sender.split('@')[0]}`, { mentions: [sender] });
            }
            
            const result = searchData.slice(0, 8).map((item, i) => 
                `${i + 1}. ${item.title}\n🔗 ${item.url}`
            ).join('\n\n');

            await kelvin.sendMessage(from, {
                text: `🔍 *Search Results for:* ${query}\n\n${result}\n\n📥 *Download wallpaper:*\n.4kwallpaper dl [URL]\n\n👤 *Requested by:* @${sender.split('@')[0]}\n\n> ${global.wm}`,
                mentions: [sender]
            }, { quoted: m });

        } else if (type === 'dl') {
            if (!args[1]) {
                return reply(
                    `❌ *Download URL Required*\n\n` +
                    `*Usage:* .4kwallpaper dl <URL>\n\n` +
                    `*Example:*\n` +
                    `.4kwallpaper dl https://4kwallpapers.com/nature/...\n\n` +
                    `👤 *Requested by:* @${sender.split('@')[0]}`,
                    { mentions: [sender] }
                );
            }
            
            await reply('📥 Fetching wallpaper download links...');
            
            const downloadData = await wallpaper.download(args[1]);
            
            if (typeof downloadData === 'string') {
                return reply(`❌ Download failed: ${downloadData}`);
            }
            
            let msg = `✅ *${downloadData.title}*\n\n`;
            msg += `*Preview:* ${downloadData.thumbnail}\n\n`;
            
            if (downloadData.image.desktop.length > 0) {
                msg += `*Desktop Resolutions:*\n`;
                downloadData.image.desktop.forEach(x => {
                    msg += `• ${x.res}: ${x.url}\n`;
                });
                msg += '\n';
            }
            
            if (downloadData.image.mobile.length > 0) {
                msg += `*Mobile Resolutions:*\n`;
                downloadData.image.mobile.forEach(x => {
                    msg += `• ${x.res}: ${x.url}\n`;
                });
                msg += '\n';
            }
            
            if (downloadData.image.tablet.length > 0) {
                msg += `*Tablet Resolutions:*\n`;
                downloadData.image.tablet.forEach(x => {
                    msg += `• ${x.res}: ${x.url}\n`;
                });
            }

            msg += `\n👤 *Requested by:* @${sender.split('@')[0]}\n\n> ${global.wm}`;

            await kelvin.sendMessage(from, {
                text: msg,
                mentions: [sender]
            }, { quoted: m });

        } else {
            return reply(
                `*Invalid Command*\n\n` +
                `Use .4kwallpaper without parameters to see all available options.\n\n` +
                `👤 *Requested by:* @${sender.split('@')[0]}`,
                { mentions: [sender] }
            );
        }

        await kelvin.sendMessage(from, { react: { text: '✅', key: m.key } });
        

    } catch (error) {
        console.error('4kwallpaper error:', error);
        await kelvin.sendMessage(from, { react: { text: '❌', key: m.key } });
        return reply(`❌ Failed to process wallpaper request: ${error.message}\n\n👤 *Requested by:* @${sender.split('@')[0]}`, { mentions: [sender] });
    }
  }
},
{
        command: ['flux'],
        operate: async ({ kelvin, mek, m, reply, text, q }) => {
        try {
    if (!q) return reply("Please provide a prompt for the image.");

    await reply("> *CREATING IMAGINE ...🔥*");

    const apiUrl = `https://api.siputzx.my.id/api/ai/flux?prompt=${encodeURIComponent(q)}`;

    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

    if (!response || !response.data) {
      return reply("Error: The API did not return a valid image. Try again later.");
    }

    const imageBuffer = Buffer.from(response.data, "binary");

    await kelvin.sendMessage(m.chat, {
      image: imageBuffer,
      caption: `💸 *Imagine Generated By Vesper-Xmd* 🚀\n✨ Prompt: *${q}*`
    });

  } catch (error) {
    console.error("FluxAI Error:", error);
    reply(`An error occurred: ${error.response?.data?.message || error.message || "Unknown error"}`);
  }
 }
}
];