// settings.js
// credit by Kevin tech 

const settings = {
  SESSION_ID: "", // enter here your session id
  ownername: "ᴋᴇʟᴠɪɴ ᴛᴇᴄʜ",
  botname: "VESPE-XMD",
  prefa: ['.', '!'],
  owner: ["256754550399"]
};

// Export settings for use in other modules
module.exports = { settings };

// Watch for changes to this file and reload if updated
const fs = require('fs');
let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log('\x1b[0;32m' + __filename + ' \x1b[1;32mupdated!\x1b[0m');
  delete require.cache[file];
  require(file);
});