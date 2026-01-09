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

        let text = `*🌍 Jexploit Verified Helpers*\n\n`;
        filtered.forEach((helper, index) => {
            text += `${index + 1}. ${helper.flag || ""} *${helper.country || "N/A"}*\n   • ${helper.name || "N/A"}: ${helper.number || "N/A"}\n\n`;
        });

        text += `✅ Jexploit Team\n`;
        text += `📢 For more information and updates? Join our support group:\n👉 https://chat.whatsapp.com/JozJ699akqWClXSRab93OW\n`;
        text += `⚠️ Charges may apply depending on the service provided.`;

        reply(text);
    }
}

]