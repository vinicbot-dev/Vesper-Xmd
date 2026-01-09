const fs = require('fs');
const path = require('path');
const yts = require('yt-search');
const fetch = require("node-fetch");
const axios = require('axios');
const { playstoreSearch } = require('../start/kelvinCmds/playstore.js'); 
const { lyricsCommand } = require('../start/kelvinCmds/lyrics');

async function tiktokSearch(query) {
    try {
        const searchUrl = `https://api.jerexd666.wongireng.my.id/search/tiktok?q=${encodeURIComponent(query)}`;
        
        const response = await fetch(searchUrl);
        const data = await response.json();
        
        if (!data.status || !data.result || data.result.length === 0) {
            return "❌ No TikTok videos found for your search.";
        }
        
        const videos = data.result.slice(0, 5); // Limit to 5 results
        let result = `🎵 **TikTok Search Results for "${query}"**\n\n`;
        
        videos.forEach((video, index) => {
            result += `**${index + 1}. ${video.title}**\n`;
            result += `👤 Author: ${video.author.nickname}\n`;
            result += `❤️ Likes: ${video.digg_count.toLocaleString()}\n`;
            result += `▶️ Plays: ${video.play_count.toLocaleString()}\n`;
            result += `💬 Comments: ${video.comment_count}\n`;
            result += `🔗 Video URL: ${video.play}\n\n`;
        });
        
        return result;
        
    } catch (error) {
        console.error('TikTok search error:', error);
        return "❌ Error searching TikTok. Please try again later.";
    }
}

module.exports = [
    {
        command: ['shazam', 'identifymusic', 'musicid'],
        operate: async ({ kelvin, m, reply, quoted, acr, mime }) => {
            
            if (!quoted || !/audio|video/.test(mime)) {
                return reply("Reply to an audio or video to identify music.");
            }
            
            try {
                const media = await m.quoted.download();
                const filePath = `./tmp/${m.sender}.${mime.split('/')[1]}`;
                fs.writeFileSync(filePath, media);
                
                const res = await acr.identify(fs.readFileSync(filePath));
                
                if (res.status.code != 0) {
                    throw new Error(res.status.msg);
                }

                // Check before accessing music[0]
                if (!res.metadata?.music || res.metadata.music.length === 0) {
                    return reply("No music identified in this audio/video.");
                }

                const { title, artists, album, release_date } = res.metadata.music[0];
                const resultText = `🎵 *Music Identified!*\n\n*Title:* ${title}\n*Artist(s):* ${artists.map(v => v.name).join(', ')}\n*Album:* ${album?.name || 'Unknown'}\n*Release Date:* ${release_date || 'Unknown'}`;
                
                reply(resultText);
                
            } catch (error) {
                console.error(error);
                reply("Error identifying music: " + error.message);
            }
        }
    },
        {
        command: ['ytsearch', 'youtubesearch', 'yts'],
        operate: async ({ kelvin, m, reply, text, prefix, command }) => {
            if (!text) return reply(`📌 *Example: ${prefix + command} Eminem Godzilla*`);

            try {
                const searchResults = await yts(text);
                if (!searchResults.all.length) return reply("❌ *No YouTube results found.*");

                let responseText = `🎥 *YouTube Search Results for:* ${text}\n\n`;
                searchResults.all.slice(0, 10).forEach((video, index) => {
                    responseText += `□ *${index + 1}.* ${video.title}\n□ *Uploaded:* ${video.ago}\n□ *Views:* ${video.views}\n□ *Duration:* ${video.timestamp}\n□ *URL:* ${video.url}\n\n─────────────────\n\n`;
                });

                await kelvin.sendMessage(
                    m.chat,
                    { image: { url: searchResults.all[0].thumbnail }, caption: responseText },
                    { quoted: m }
                );
            } catch (error) {
                console.error("YT Search command failed:", error);
                reply("❌ *An error occurred while fetching YouTube search results.*");
            }
        }
    },
        {
        command: ['imdb', 'movie'],
        operate: async ({ kelvin, m, reply, text }) => {
            if (!text) return reply("Provide a movie or series name.");
            
            try {
                const { data } = await axios.get(`http://www.omdbapi.com/?apikey=742b2d09&t=${text}&plot=full`);
                if (data.Response === "False") throw new Error();

                const imdbText = `🎬 *IMDB SEARCH*\n\n`
                    + `*Title:* ${data.Title}\n*Year:* ${data.Year}\n*Rated:* ${data.Rated}\n`
                    + `*Released:* ${data.Released}\n*Runtime:* ${data.Runtime}\n*Genre:* ${data.Genre}\n`
                    + `*Director:* ${data.Director}\n*Actors:* ${data.Actors}\n*Plot:* ${data.Plot}\n`
                    + `*IMDB Rating:* ${data.imdbRating} ⭐\n*Votes:* ${data.imdbVotes}`;

                kelvin.sendMessage(m.chat, { image: { url: data.Poster }, caption: imdbText }, { quoted: m });
            } catch (error) {
                reply("❌ Unable to fetch IMDb data.");
            }
        }
    },
    {
        command: ['playstore', 'appstore', 'apps'],
        operate: async ({ kelvin, m, reply, text }) => {
            if (!text) return reply('*Please provide an app name to search!*\nExample: .playstore WhatsApp');

            try {
              
                // Get search results
                const result = await playstoreSearch(text);
                
                // Send the results
                reply(result);
                
            } catch (error) {
                console.error('PlayStore plugin error:', error);
                reply('❌ An error occurred while searching PlayStore.');
            }
        }
    },
    {
        command: ['lyrics', 'lyric'],
        operate: async ({ reply, m, kelvin, text }) => {
            try {
                if (!text) {
                    return reply('🎵 *Lyrics Command*\n\nUsage: `.lyrics <song name>`\nExample: `.lyrics shape of you`');
                }
                
                await lyricsCommand(kelvin, m.chat, text, m);
            } catch (error) {
                console.error('Error in lyrics command:', error);
                reply('❌ Error fetching lyrics. Please try again.');
            }
        }
    },
    {
        command: ['chord', 'cr'],
        operate: async ({ reply, m, text }) => {
            if (!text) return reply(`*Query input needed*\n\nExample: .chord shape of you`);
            
            try {
                const apiUrl = `https://api.diioffc.web.id/api/search/chord?query=${encodeURIComponent(text)}`;
                const res = await fetch(apiUrl);
                const response = await res.json();
                
                if (!response.result) {
                    return reply(`❌ No chord found for "${text}"\nPlease try a different song.`);
                }
                
                const { url, artist, artistUrl, title, chord } = response.result;
                
                // Format chord output with better readability
                const chordMessage = `🎵 *Chord Finder*\n\n` +
                    `🎤 *Title:* ${title}\n` +
                    `👤 *Artist:* ${artist}\n` +
                    `🔗 *Artist URL:* ${artistUrl}\n` +
                    `🌐 *Chord URL:* ${url}\n\n` +
                    `🎼 *Chord:*\n\`\`\`\n${chord}\n\`\`\``;
                
                reply(chordMessage);
                
            } catch (error) {
                console.error('Error in chord command:', error);
                reply('❌ Error fetching chord. Please try again later.');
            }
        }
    },
        {
        command: ['weather'],
        operate: async ({ reply, m, kelvin, text }) => {
            if (!text) return reply("Provide a location.");
            
            try {
                const { data } = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${text}&units=metric&appid=060a6bcfa19809c2cd4d97a212b19273`);
                
                const weatherInfo = `🌤️ *Weather for ${text}*\n\n`
                    + `🌡️ *Temperature:* ${data.main.temp}°C (Feels like ${data.main.feels_like}°C)\n`
                    + `🌪️ *Weather:* ${data.weather[0].main} - ${data.weather[0].description}\n`
                    + `💨 *Wind Speed:* ${data.wind.speed} m/s\n`
                    + `📍 *Coordinates:* ${data.coord.lat}, ${data.coord.lon}\n`
                    + `🌍 *Country:* ${data.sys.country}`;

                kelvin.sendMessage(m.chat, { text: weatherInfo }, { quoted: m });
            } catch (error) {
                reply("❌ Unable to fetch weather data.");
            }
        }
    },
    {
        command: ['tiktoksearch', 'tts'],
        operate: async ({ reply, m, kelvin, text }) => {
            const query = text.trim();
            if (!query) return reply("*Provide TikTok username or search query*.");
            
            await kelvin.sendMessage(m.chat, { 
                text: `🔍 Searching TikTok for "${query}"...` 
            }, { quoted: m });
            
            const result = await tiktokSearch(query);
            await kelvin.sendMessage(m.chat, { text: result }, { quoted: m });
        }
    }
];