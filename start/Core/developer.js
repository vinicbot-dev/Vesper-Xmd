/* m
  -! Credits By Kevintech 
  Thanks to great lonelysaam 
  Thanks to Malvin King 
  https://wa.me/256742932677
*/

// setting/config.js
const fs = require('fs');

global.owner = ["256742932677"];  
global.status = true; // true = public, false = private
global.versions = "1.4.0";

// ========= Setting WM ========= //
global.packname = 'Vesper';
global.author = 'Bot';
global.wm = '© Vesper-Xmd is awesome 🔥';

// === For only developer ============
global.api = "https://xploaderapi-f5e63b.platform.cypherx.space";
global.wwe = "https://www.wwe.com/api/news";
global.wwe1 = "https://www.thesportsdb.com/api/v1/json/3/searchfilename.php?e=wwe";
global.wwe2 = "https://www.thesportsdb.com/api/v1/json/3/searchevents.php?e=wrestling";
global.falcon = "https://flowfalcon.dpdns.org";

global.gcount = {
  prem: 500,
  user: 15
};

global.limitCount = 10;

global.mess = {
  group: "This not group!*",
  notadmin: "This command is only preserved for group admins!",
  owner: "This command is only preserved for bot owner and sudo!",
  done: "Mission complete ✅",
  notext: "Please provide the necessary text",
  premium: "*First become a premium user*",
  botadmin: "Please bot needs admin privileges to use this command!",
  limited: "*Limit reached*",
  helpersList: [
    { name: "Malvin king", number: "+263776388689", country: "Zimbabwe", flag: "🇿🇼" },
    { name: "lonlysaam", number: "+254762586673", country: "Kenya", flag: "🇹🇿" },
    { name: "Terri", number: "+256752792178", country: "Uganda", flag: "🇺🇬" },
    { name: "Dev sung", number: "+27649342626", country: "South Africa", flag: "🇿🇦" }
  ],
  siputzx: "https://api.siputzx.my.id" 
};


let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  delete require.cache[file];
  require(file);
});
