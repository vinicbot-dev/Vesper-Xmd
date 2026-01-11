const { remini } = require('../start/lib/remini');
const { wallpaper, wikimedia } = require('../start/lib/scraper');

module.exports = [
  {
    command: ['wallpaper', 'wp', 'wall'],
    operate: async ({ kelvin, m, reply, text }) => {
        if (!text) return reply("📌 *Enter a search query.*");
        
        try {
            const results = await wallpaper(text);
            if (!results || !results.length) return reply("❌ *No wallpapers found.*");
            
            const randomWallpaper = results[Math.floor(Math.random() * results.length)];
            await kelvin.sendMessage(
                m.chat,
                {
                    caption: `📌 *Title:* ${randomWallpaper.title}\n📁 *Category:* ${randomWallpaper.type}\n🔗 *Source:* ${randomWallpaper.source}\n🖼️ *Media URL:* ${randomWallpaper.image[2] || randomWallpaper.image[1] || randomWallpaper.image[0]}`,
                    image: { url: randomWallpaper.image[0] }
                },
                { quoted: m }
            );
        } catch (error) {
            console.error(error);
            reply("❌ *An error occurred while fetching the wallpaper.*");
        }
    }
},
{
    command: ['wikipedia', 'wiki', 'media'],
    operate: async ({ kelvin, m, reply, text }) => {
        if (!text) return reply("📌 *Enter a search query.*");
        
        try {
            const results = await Wikimedia(text);
            if (!results || !results.length) return reply("❌ *No Wikimedia results found.*");
            
            const randomWiki = results[Math.floor(Math.random() * results.length)];
            await kelvin.sendMessage(
                m.chat,
                {
                    caption: `📌 *Title:* ${randomWiki.title}\n🔗 *Source:* ${randomWiki.source}\n🖼️ *Media URL:* ${randomWiki.image}`,
                    image: { url: randomWiki.image }
                },
                { quoted: m }
            );
        } catch (error) {
            console.error(error);
            reply("❌ *An error occurred while fetching Wikimedia results.*");
        }
    }
},
{
    command: ['remini', 'enhance', 'upscale'],
    operate: async ({ kelvin, m, reply, prefix, command }) => {
        const quoted = m.quoted ? m.quoted : m.msg;
        const mime = quoted?.mimetype || "";
        
        if (!quoted) return reply("📌 *Send or reply to an image.*");
        if (!/image/.test(mime)) return reply(`📌 *Send or reply to an image with caption:* ${prefix + command}`);
        
        try {
            const media = await m.quoted.download();
            if (!media) return reply("❌ *Failed to download media. Try again.*");
            
            const enhancedImage = await remini(media, 'enhance');
            await kelvin.sendMessage(
                m.chat, 
                { 
                    image: enhancedImage, 
                    caption: "*Image enhanced successfully*" 
                }, 
                { quoted: m }
            );
        } catch (error) {
            console.error(error);
            reply("❌ *An error occurred while enhancing the image.*");
        }
    }
}
];