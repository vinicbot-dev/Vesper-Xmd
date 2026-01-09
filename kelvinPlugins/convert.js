const { smsg, getBuffer } = require('../start/lib/myfunction');
const { toAudio } = require('../start/lib/converter');
const { handleMediaUpload } = require('../start/lib/catbox');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

function getRandom(ext) {
    return `${Math.floor(Math.random() * 10000)}${ext}`;
}


module.exports = [
    {
        command: ['tourl', 'upload', 'mediaurl'],
        operate: async ({ kelvin, m, reply, quoted, mime }) => {
            
            if (!quoted || !mime) {
                return reply('*Please reply to a media message!*');
            }

            try {
                const mediaUrl = await handleMediaUpload(quoted, kelvin, mime);
                reply(`*Uploaded successfully:*\n${mediaUrl}`);
            } catch (error) {
                console.error(error);
                reply('*An error occurred while uploading the media.*');
            }
        }
    },
    
    {
        command: ['toimage', 'stickerimage', 'stickertoimg'],
        operate: async ({ kelvin, m, reply, quoted, mime, prefix, command }) => {
            
            
            if (!quoted || !/webp/.test(mime)) {
                return reply(`*Send or reply to a sticker with the caption ${prefix + command}*`);
            }

            try {
                const media = await quoted.download();
                const inputPath = path.join(__dirname, getRandom('.webp'));
                fs.writeFileSync(inputPath, media);
                const outputPath = path.join(__dirname, getRandom('.png'));
                
                exec(`ffmpeg -i ${inputPath} ${outputPath}`, (err) => {
                    fs.unlinkSync(inputPath);

                    if (err) {
                        console.error('Error converting to image:', err);
                        return reply('An error occurred while converting the sticker to an image.');
                    }
                    
                    const buffer = fs.readFileSync(outputPath);
                    kelvin.sendMessage(m.chat, { image: buffer }, { quoted: m });
                    fs.unlinkSync(outputPath);
                });
                
            } catch (error) {
                console.error('Error converting to image:', error);
                reply('An error occurred while converting the sticker to an image.');
            }
        }
    },
        {
        command: ['tomp3', 'toaudio', 'extractaudio'],
        operate: async ({ kelvin, m, reply, quoted, mime }) => {          
            
            if (!quoted) return reply('*Reply to a video to convert it to audio!*');
            if (!/video/.test(mime)) return reply('*Only videos can be converted to audio!*');

            try {
                let buffer = await quoted.download();
                let converted = await toAudio(buffer, 'mp4');

                await kelvin.sendMessage(m.chat, { 
                    audio: converted.data, 
                    mimetype: 'audio/mpeg' 
                }, { quoted: m });
                
                // Optional: Delete temporary data
                if (converted.delete) {
                    await converted.delete();
                }
                
            } catch (e) {
                console.error(e);
                reply('*Failed to convert video to audio!*');
            }
        }
    },
    {
        command: ['tovideo', 'stickervideo', 'webptomp4'],
        operate: async ({ kelvin, mime, quoted, m, reply, prefix, command }) => {
            if (!m.quoted) return reply(`Reply to a sticker with caption *${prefix + command}*`);
            if (!m.quoted.mimetype.includes('webp')) return reply(`Please reply to a webp sticker`);
            
            try {
                const media = await m.quoted.download();
                const videoUrl = await webp2mp4(media);
                
                if (!videoUrl) throw new Error('Conversion failed');
                
                await kelvin.sendFile(m.chat, videoUrl, 'converted.mp4', '', m);
                
            } catch (error) {
                console.error(error);
                reply('❌ Failed to convert sticker to video. Please try again later.');
            }
        }
    },
    {
        command: ['sticker', 'stiker', 's'],
        operate: async ({ kelvin, m, reply, prefix, mime,  command, args, quoted }) => {
            
            if (!quoted) {
                return reply(`Send or reply to images, videos, or gifs with captions ${prefix + command}`);
            }

            if (!mime) {
                return reply(`The quoted message does not contain media. Please send or reply to an image, video, or gif.`);
            }

            const swns = args.join(" ");
            const pcknms = swns.split("|")[0];
            const atnms = swns.split("|")[1];

            try {
                if (/image/.test(mime)) {
                    const media = await quoted.download();
                    await kelvin.sendImageAsSticker(m.chat, media, m, {
                        packname: pcknms ? pcknms : global.packname,
                        author: atnms ? atnms : global.author,
                    });
                }
                else if (/video/.test(mime)) {
                    if ((quoted.msg || quoted).seconds > 10) {
                        return reply("The video length must be 10 seconds or less. Please try again.");
                    }
                    const media = await quoted.download();
                    await kelvin.sendVideoAsSticker(m.chat, media, m, {
                        packname: pcknms ? pcknms : global.packname,
                        author: atnms ? atnms : global.author,
                    });
                }
                else {
                    return reply(`Send or reply to images, videos, or gifs with captions ${prefix + command}`);
                }
            } catch (error) {
                console.error('Error processing sticker:', error);
                reply('An error occurred while processing the sticker.');
            }
        }
    }
];