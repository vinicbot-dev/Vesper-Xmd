const axios = require('axios');

const fetchReactionImage = async ({ kelvin, m, reply, command }) => {
  try {
    const { data } = await axios.get(`https://api.waifu.pics/sfw/${command}`);
    await kelvin.sendImageAsSticker(m.chat, data.url, m, {
      packname: global.packname,
      author: global.author,
    });
  } catch (error) {
      reply(global.mess.error);
  }
};

module.exports = {fetchReactionImage}