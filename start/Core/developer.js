/* m
  -! Credits By Kevintech 
  https://wa.me/256742932677
*/

// setting/config.js
const fs = require('fs');

global.owner = ["Kelvin Tech"];  
global.status = false; // true = public, false = private
global.versions = "v1.2.6";
global.botname = "Vesper-Xmd"; 
global.prefixz = "."; 
global.timezones = "Africa/Kampala"; 

// ========= Other Global Settings ========= //
global.SESSION_ID = process.env.SESSION_ID || '';
global.postgresqls = process.env.DATABASE_URL || "";

// ========= Setting WM ========= //
global.packname = 'Vesper';
global.author = 'Bot';
global.wm = '©Vesper-Xmd is awesome 🔥';

// === For only developer ============
global.api = "https://ravenn.site";
global.KevinApi = "mvn_988e8fc44c89ad6e537bb683e681afe6";
global.wwe = "https://www.wwe.com/api/news";
global.wwe1 = "https://www.thesportsdb.com/api/v1/json/3/searchfilename.php?e=wwe";
global.wwe2 = "https://www.thesportsdb.com/api/v1/json/3/searchevents.php?e=wrestling";
global.falcon = "https://flowfalcon.dpdns.org";
global.siputzx = "https://api.siputzx.my.id"; 
global.updateZipUrl = "https://github.com/vinicbot-dev/Vesper-Xmd/archive/refs/heads/main.zip";

global.gcount = {
  prem: 500,
  user: 15
};

global.limitCount = 10;

global.mess = {
  group: "This is not group!",
  notadmin: "This command is only preserved for group admins!",
  notgroup: "This command can only be used in groups!",
  owner: "This command is only preserved for bot owner and sudo!",
  error: "An error occurred while processing the command!",
  done: "Mission complete ✅",
  notext: "Please provide the necessary text",
  premium: "*First become a premium user*",
  botadmin: "The bot needs admin permission to perform this command!",
  botnotadmin: "Please first make bot admin to use this command!",
  limited: "*Limit reached*",
  helpersList: [
    { name: "Roberto", number: "+256 784 391777", country: "Uganda", flag: "🇺🇬" },
    { name: "𝐊𝐚𝐚𝐗𝐇𝐮𝐧𝐭𝐞𝐫𝐳", number: "+91 80751 69545", country: "India", flag: "🇮🇳" },
    { name: "Terri", number: "+256752792178", country: "Uganda", flag: "🇺🇬" },
    { name: "༅᭄𖣐∭•𝐑𝐎𝐌𝐀-𝐓𝐄𝐂𝐇•∭𖣐᭄༅", number: ",256791480644", country: "Uganda", flag: "🇺🇬" },
    { name: "JHAI DAVE", number: "+256 774 782648", country: "Uganda", flag: "🇺🇬" }
  ],
  siputzx: "https://api.siputzx.my.id" 
};


let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  delete require.cache[file];
  require(file);
});