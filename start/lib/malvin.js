// start/lib/malvin.js — Malvin API helpers (same API Jexploit uses).
// Base URL = global.wow, key = global.KevinApi (both set in start/Core/developer.js).
const axios = require('axios');

function apiBase() {
  const b = String(global.wow || 'https://api.malvintech.co.zw/api/');
  return b.endsWith('/') ? b : b + '/';
}

async function savetube(url, type, quality) {
  const res = await axios.get(`${apiBase()}download/savetube`, {
    params: { url, type, quality, apikey: global.KevinApi },
    timeout: 45000
  });
  const d = res.data;
  if (d?.status && d?.data?.download_url) {
    return { url: d.data.download_url, title: d.data.title, quality: String(quality) };
  }
  throw new Error(d?.message || d?.error || `Malvin savetube (${type}) returned no download`);
}

const getMalvinVideo = (youtubeUrl, quality = '360') => savetube(youtubeUrl, 'video', quality);
const getMalvinAudio = (youtubeUrl, quality = '128') => savetube(youtubeUrl, 'audio', quality);

module.exports = { apiBase, getMalvinVideo, getMalvinAudio };
