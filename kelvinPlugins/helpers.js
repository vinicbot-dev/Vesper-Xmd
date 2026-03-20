module.exports = [

{
    command: ['helpers'],
    operate: async ({ kelvin, m, reply, args }) => {
        const search = (args && args.length) ? args.join(" ").toLowerCase() : "";

        // Check if global.helpersList exists and is an array
        const helpersList = Array.isArray(global.mess.helpersList) ? global.mess.helpersList : [];

        const filtered = helpersList.filter(helper =>
            helper && helper.country && (helper.country.toLowerCase().includes(search))
        );

        if (!filtered.length) {
            return reply(`x No helper found for "${search}".\nTry using: *.helpers* to see all.`);
        }
        
        filtered.sort((a, b) => (a.country || "").localeCompare(b.country || ""));

        let text = `*🌍 Vesper-Xmd Verified Helpers*\n\n`;
        filtered.forEach((helper, index) => {
            text += `${index + 1}. ${helper.flag || ""} *${helper.country || "N/A"}*\n   • ${helper.name || "N/A"}: ${helper.number || "N/A"}\n\n`;
        });

        text += `✅ Jexploit Team\n`;
        text += `📢 For more information and updates? Join our support group:\n👉 https://chat.whatsapp.com/JozJ699akqWClXSRab93OW\n`;
        text += `⚠️ Charges may apply depending on the service provided.`;

        reply(text);
    }
},
{
        command: ['dev', 'developer'],
        operate: async ({ kelvin, mentionedJid, quoted, m, reply }) => {
          try {
    const devInfo = {
      name: "Kevin Tech",      
      number: "256742932677",  
      organization: "JEXPLOIT And Vesper-Xmd Development Team",
      note: "Bot Developer"
    };

    // Create vCard
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${devInfo.name}
ORG:${devInfo.organization};
TEL;type=CELL;type=VOICE;waid=${devInfo.number}:${devInfo.number}
NOTE:${devInfo.note}
END:VCARD`;

    // Send as contact card
    await kelvin.sendMessage(
      m.chat, 
      {
        contacts: {
          displayName: devInfo.name,
          contacts: [{
            displayName: devInfo.name,
            vcard: vcard
          }]
        },
        contextInfo: {
          mentionedJid: [m.sender],
          externalAdReply: {
            title: `Developer Contact`,
            body: `Contact ${devInfo.name} for support`,
            thumbnail: fs.readFileSync('./start/lib/Media/Images/dev.jpg'), 
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      },
      { quoted: m }
    );

    await kelvin.sendMessage(
      m.chat,
      { 
        text: `👨‍💻 *Developer Information*\n\n` +
              `• *Name:* ${devInfo.name}\n` +
              `• *Contact:* wa.me/${devInfo.number}\n` +
              `• *Role:* ${devInfo.note}\n` +
              `• *Team:* ${devInfo.organization}`,
              
        mentions: [m.sender]
      },
      { quoted: m }
    );

  } catch (error) {
    console.error('Error in dev command:', error);
    reply(mess.error);
  }
 }
}

]