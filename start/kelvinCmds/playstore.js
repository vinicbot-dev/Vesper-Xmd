// PlayStore Search Function
const fetch = require('node-fetch');
const yts = require('yt-search');
const axios = require("axios");

async function playstoreSearch(query) {
    try {
        const searchUrl = `https://api.jerexd666.wongireng.my.id/search/playstore?q=${encodeURIComponent(query)}`;
        
        const response = await fetch(searchUrl);
        const data = await response.json();
        
        if (!data.status || !data.result || data.result.length === 0) {
            return "❌ No apps found on PlayStore for your search.";
        }
        
        const apps = data.result.slice(0, 5); // Limit to 5 results
        let result = `*PlayStore Search Results for "${query}"*\n\n`;
        
        apps.forEach((app, index) => {
            result += `**${index + 1}. ${app.nama}**\n`;
            result += `Developer: ${app.developer}\n`;
            result += `⭐ Rating: ${app.rate2}/5 (${app.rate})\n`;
            result += `PlayStore: ${app.link}\n\n`;
        });
        
        return result;
        
    } catch (error) {
        console.error('PlayStore search error:', error);
        return "❌ Error searching PlayStore. Please try again later.";
    }
}

module.exports = { playstoreSearch }