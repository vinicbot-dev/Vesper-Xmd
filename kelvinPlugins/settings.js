/*Kelvin Tech*/


// MENU STYLES CONSTANT
const MENU_STYLES = {
    '1': 'Document with thumbnail',
    '2': 'Simple text reply',
    '3': 'Text with external ad reply',
    '4': 'Image with caption',
    '5': 'Interactive message',
    '6': 'Payment request format'
};

const AVAILABLE_FONTS = {
    '1': { name: 'Normal', style: 'normal' },
    '2': { name: 'Bold', style: 'bold' },
    '3': { name: 'Italic', style: 'italic' },
    '4': { name: 'Monospace', style: 'monospace' },
    '5': { name: 'Sans Serif', style: 'sans' },
    '6': { name: 'Serif', style: 'serif' },
    '7': { name: 'Cursive', style: 'cursive' },
    '8': { name: 'Fancy', style: 'fancy' },
    '9': { name: 'Small Caps', style: 'smallcaps' }
};

module.exports = [
    {
        command: ['antidelete', 'antidel', 'deletealert'],
        operate: async ({ kelvin, m, reply, prefix, args, Access, db, mess, botNumber }) => {
            if (!Access) return reply(global.mess.owner);
    
    const subcommand = args[0]?.toLowerCase();
    const value = args[1]?.toLowerCase();
    
    if (!subcommand) {
        const currentMode = await db.get(botNumber, 'antidelete', 'off');
        
        return reply(`*Anti-Delete System*
        
Usage:
• ${prefix}antidelete on - Enable anti-delete (default: chat mode)
• ${prefix}antidelete off - Disable anti-delete
• ${prefix}antidelete chat - Send alerts to same chat
• ${prefix}antidelete private - Send alerts to bot owner's inbox
• ${prefix}antidelete status - Show current settings

Current Mode: ${currentMode}
Enabled: ${currentMode !== 'off' ? '✅' : '❌'}

📌 *Modes:*
• chat - Alerts sent to same chat where deletion happened
• private - Alerts sent to bot owner's private inbox
• off - Anti-delete disabled`);
    }
    
    switch(subcommand) {
        case 'on': {
            // ✅ Default to chat mode when turning on
            await db.set(botNumber, 'antidelete', 'chat');
            reply(`*Successfully enabled antidelete chat mode*`);
            break;
        }
        
        case 'off': {
            // ✅ Save to SQLite
            await db.set(botNumber, 'antidelete', 'off');
            reply(`*Successfully disabled antidelete*`);
            break;
        }
        
        case 'chat': {
            // ✅ Save to SQLite
            await db.set(botNumber, 'antidelete', 'chat');
            reply(`*Successfully enabled antidelete chat mode*`);
            break;
        }
        
        case 'private': {
            // ✅ Save to SQLite
            await db.set(botNumber, 'antidelete', 'private');
            reply(`*Successfully enabled antidelete private mode*`);
            break;
        }
        
        case 'status': {
            // ✅ Get current status from SQLite
            const currentMode = await db.get(botNumber, 'antidelete', 'off');
            reply(`*Anti-Delete Status*
            
Mode: ${currentMode}
Enabled: ${currentMode !== 'off' ? '✅' : '❌'}

Chat Mode: Sends alerts to the same chat
Private Mode: Sends alerts to bot owner's inbox`);
            break;
        }
        
        default: {
            reply(`Invalid subcommand. Use: on, off, chat, private, status`);
        }
    }
  }
},
    {
        command: ['antiedit', 'editalert'],
        operate: async ({ kelvin, m, reply, prefix, args, db, Access, mess, botNumber }) => {
             if (!Access) return reply(mess.owner);
    
    const subcommand = args[0]?.toLowerCase();
    
    if (!subcommand) {
        const currentMode = await db.get(botNumber, 'antiedit', 'off');
        return reply(`*ANTI-EDIT SETTINGS*

Current Mode: ${currentMode}

📌 *Commands:*
• ${prefix}antiedit on - Enable anti-edit (default: chat mode)
• ${prefix}antiedit off - Disable anti-edit
• ${prefix}antiedit chat - Send alerts to same chat
• ${prefix}antiedit private - Send alerts to bot owner's inbox
• ${prefix}antiedit status - Show current settings

*Modes:*
• chat - Alerts sent to same chat where editing happened
• private - Alerts sent to bot owner's private inbox
• off - Anti-edit disabled`);
    }
    
    switch(subcommand) {
        case 'on': {
            // Default to chat mode when turning on
            await db.set(botNumber, 'antiedit', 'chat');
            reply(`✅ Anti-edit enabled (chat mode)`);
            break;
        }
        
        case 'off': {
            await db.set(botNumber, 'antiedit', 'off');
            reply(`✅ Anti-edit disabled`);
            break;
        }
        
        case 'chat': {
            await db.set(botNumber, 'antiedit', 'chat');
            reply(`✅ Anti-edit set to chat mode (alerts sent to same chat)`);
            break;
        }
        
        case 'private': {
            await db.set(botNumber, 'antiedit', 'private');
            reply(`✅ Anti-edit set to private mode (alerts sent to bot owner)`);
            break;
        }
        
        case 'status': {
            const currentMode = await db.get(botNumber, 'antiedit', 'off');
            let statusMsg = `*📊 ANTI-EDIT STATUS*\n\n`;
            statusMsg += `Mode: *${currentMode}*\n`;
            statusMsg += `Status: ${currentMode !== 'off' ? '✅ ENABLED' : '❌ DISABLED'}\n\n`;
            
            if (currentMode === 'chat') {
                statusMsg += `📍 Alerts will be sent to the same chat where editing occurred.`;
            } else if (currentMode === 'private') {
                statusMsg += `📍 Alerts will be sent to bot owner's private inbox.`;
            } else {
                statusMsg += `📍 Anti-edit is currently disabled.`;
            }
            
            reply(statusMsg);
            break;
        }
        
        default: {
            reply(`Invalid option! Use: on, off, chat, private, status`);
        }
    }
  }
},
    {
        command: ['autorecording'],
        operate: async ({ kelvin, m, reply, prefix, args, db, Access, mess, botNumber }) => {
            if (!Access) return reply(global.mess.owner);
    
    const mode = args[0]?.toLowerCase();
    if (!mode || !['on', 'off'].includes(mode)) {
        const current = await db.get(botNumber, 'autorecording', false);
        return reply(`Usage: ${prefix}autorecord <on/off>\n\nCurrent: ${current ? 'ON ✅' : 'OFF '}`);
    }
    
    const boolValue = mode === 'on';
    await db.set(botNumber, 'autorecording', boolValue);
    reply(`✅ Auto-recording ${boolValue ? 'enabled' : 'disabled'}`);
   
     }
},
    {
        command: ['autotyping', 'typing'],
        operate: async ({ kelvin, m, reply, prefix, args, db, Access, mess, botNumber }) => {
    if (!Access) return reply(global.mess.owner);
    
    const autoTyping = await db.get(botNumber, 'autoTyping', false);
    
    if (!Access) return reply(mess.owner);
    
    const mode = args[0]?.toLowerCase();
    if (!mode || !['on', 'off'].includes(mode)) {
        return reply(`Usage: ${prefix}autotyping <on/off>`);
    }
    
    const boolValue = mode === 'on';
    
    // Save to database (batched, efficient!)
    await db.set(botNumber, 'autoTyping', boolValue);
    
    reply(`✅ Auto-typing ${boolValue ? 'enabled' : 'disabled'}`);
    
  }
},
    {
        command: ['autoread'],
        operate: async ({ kelvin, m, reply, prefix, args, db, Access, mess, botNumber }) => {
            if (!Access) return reply(global.mess.owner);
    
    const mode = args[0]?.toLowerCase();
    if (!mode || !['on', 'off'].includes(mode)) {
        const current = await db.get(botNumber, 'autoread', false);
        return reply(`Usage: ${prefix}autoread <on/off>\n\nCurrent: ${current ? 'ON ✅' : 'OFF '}`);
    }
    
    const boolValue = mode === 'on';
    await db.set(botNumber, 'autoread', boolValue);
    reply(`✅ Auto-read ${boolValue ? 'enabled' : 'disabled'}`);
    
  }
},
    {
        command: ['autoreact'],
        operate: async ({ kelvin, m, reply, prefix, args, Access, db, mess, botNumber }) => {
            if (!Access) return reply(global.mess.owner);
    
    const mode = args[0]?.toLowerCase();
    if (!mode || !['on', 'off'].includes(mode)) {
        const current = await db.get(botNumber, 'autoreact', false);
        return reply(`❌ Usage: ${prefix}autoreact <on/off>\n\nCurrent: ${current ? 'ON ✅' : 'OFF ❌'}`);
    }
    
    const boolValue = mode === 'on';
    await db.set(botNumber, 'autoreact', boolValue);
    reply(`✅ Auto-react ${boolValue ? 'enabled' : 'disabled'}`);
    }
},
    {
        command: ['chatbot'],
        operate: async ({ kelvin, m, reply, prefix, args, db, Access, mess, botNumber }) => {
             if (!Access) return reply(global.mess.owner);
    
    const mode = args[0]?.toLowerCase();
    if (!mode || !['on', 'off'].includes(mode)) {
        const current = await db.get(botNumber, 'AI_CHAT', false);
        return reply(`❌ Usage: ${prefix}aichat <on/off>\n\nCurrent: ${current ? 'ON ✅' : 'OFF ❌'}`);
    }
    // Message memory for conversation context
   let messageMemory = new Map();
   const MAX_MEMORY = 150; // Maximum messages to remember per chat
   
    const boolValue = mode === 'on';
    await db.set(botNumber, 'AI_CHAT', boolValue);
    
    // Clear memory when turning off/on
    if (boolValue) {
        // Clear old memory when turning on
        messageMemory.clear();
    }
    
    reply(`✅ AI Chatbot ${boolValue ? 'enabled' : 'disabled'}`);
    
   }
},
    {
        command: ['anticall'],
        operate: async ({ kelvin, m, reply, prefix, args, db, Access, mess, botNumber }) => {
            if (!Access) return reply(global.mess.owner);
    
    const mode = args[0]?.toLowerCase();
    const action = args[1]?.toLowerCase();
    
    // Show help if no arguments
    if (!mode) {
        const current = await db.get(botNumber, 'anticall', 'off');
        return reply(`*ANTICALL*\n\n` +
            `• ${prefix}anticall decline on\n` +
            `• ${prefix}anticall decline off\n` +
            `• ${prefix}anticall block on\n` +
            `• ${prefix}anticall block off\n\n` +
            `Current: ${current}`);
    }
    
    // Handle decline mode
    if (mode === 'decline') {
        if (action === 'on') {
            await db.set(botNumber, 'anticall', 'decline');
            return reply('✅ Anticall ON (calls will be declined)');
        }
        if (action === 'off') {
            await db.set(botNumber, 'anticall', 'off');
            return reply('Anticall OFF');
        }
    }
    
    // Handle block mode
    if (mode === 'block') {
        if (action === 'on') {
            await db.set(botNumber, 'anticall', 'block');
            return reply('✅ Anticall BLOCK ON (callers will be blocked)');
        }
        if (action === 'off') {
            await db.set(botNumber, 'anticall', 'off');
            return reply('Anticall OFF');
        }
    }
    
    // Invalid command
    reply('Use: .anticall decline on/off or .anticall block on/off');
  }
},
    {
    command: ['autoviewstatus'],
    operate: async ({ kelvin, m, reply, args, prefix, botNumber, db,  Access }) => {
if (!Access) return reply(global.mess.owner);
    
    const mode = args[0]?.toLowerCase();
    if (!mode || !['on', 'off'].includes(mode)) {
        const current = await db.get(botNumber, 'autoviewstatus', false);
        return reply(`Usage: ${prefix}autoviewstatus <on/off>\n\nCurrent: ${current ? 'ON ✅' : 'OFF '}`);
    }
    
    const boolValue = mode === 'on';
    await db.set(botNumber, 'autoviewstatus', boolValue);
    reply(`✅ Auto-view status ${boolValue ? 'enabled' : 'disabled'}`);
    }
},
{
    command: ['autoreactstatus'],
    operate: async ({ kelvin, m, reply, args, prefix, botNumber, db, Access }) => {
        if (!Access) return reply(global.mess.owner);
    
    const mode = args[0]?.toLowerCase();
    if (!mode || !['on', 'off'].includes(mode)) {
        const current = await db.get(botNumber, 'autoreactstatus', false);
        return reply(`Usage: ${prefix}autoreactstatus <on/off>\n\nCurrent: ${current ? 'ON ✅' : 'OFF '}`);
    }
    
    const boolValue = mode === 'on';
    await db.set(botNumber, 'autoreactstatus', boolValue);
    reply(`✅ Auto-react status ${boolValue ? 'enabled' : 'disabled'}`);
    }
},
{
    command: ['statusemoji'],
    operate: async ({ kelvin, m, reply, args, prefix, botNumber, db, Access }) => {
    if (!Access) return reply(mess.owner);
    
    const emoji = args[0];
    if (!emoji) {
        const current = await db.get(botNumber, 'statusemoji', '💚');
        return reply(`Usage: ${prefix}statusemoji <emoji>\n\nCurrent: ${current}\nExample: ${prefix}statusemoji ❤️`);
    }
    
    await db.set(botNumber, 'statusemoji', emoji);
    reply(`✅ Status reaction emoji set to: ${emoji}`);
    }
},
{
    command: ['welcome', 'wel'],
    operate: async ({ m, reply, prefix, args, Access, botNumber, db, kelvin, mess }) => {
        if (!m.isGroup) return reply(global.mess.group);
    if (!m.isAdmin && !Access) return reply(global.mess.notadmin);
    
    const mode = args[0]?.toLowerCase();
    if (!mode || !['on', 'off'].includes(mode)) {
        const current = await db.getGroupSetting(botNumber, m.chat, 'welcome', false);
        return reply(`Usage: ${prefix}welcome <on/off>\n\nCurrent: ${current ? 'ON ✅' : 'OFF '}`);
    }
    
    const boolValue = mode === 'on';
    await db.setGroupSetting(botNumber, m.chat, 'welcome', boolValue);
    reply(`✅ Welcome messages ${boolValue ? 'enabled' : 'disabled'} for this group`);
    }
},
{
    command: ['adminevent'],
    operate: async ({ kelvin, m, reply, prefix, args, Access, db, mess, botNumber }) => {
        if (!Access) return reply(global.mess.owner);
    
    const mode = args[0]?.toLowerCase();
    if (!mode || !['on', 'off'].includes(mode)) {
        const current = await db.get(botNumber, 'adminevent', false);
        return reply(`Usage: ${prefix}adminevent <on/off>\n\nCurrent: ${current ? 'ON ✅' : 'OFF '}`);
    }
    
    const boolValue = mode === 'on';
    await db.set(botNumber, 'adminevent', boolValue);
    reply(`✅ Admin event notifications ${boolValue ? 'enabled' : 'disabled'}`);
    }
},
{
    command: ['alwaysonline'],
    operate: async ({ kelvin, m, reply, prefix, args, Access, from, db, mess, botNumber }) => {
    if (!Access) return reply(global.mess.owner);
    
    const mode = args[0]?.toLowerCase();
    if (!mode || !['on', 'off'].includes(mode)) {
        const current = await db.get(botNumber, 'alwaysonline', false);
        return reply(`Usage: ${prefix}alwaysonline <on/off>\n\nCurrent: ${current ? 'ON ✅' : 'OFF '}`);
    }
    
    const boolValue = mode === 'on';
    await db.set(botNumber, 'alwaysonline', boolValue);
    global.alwaysonline = boolValue; // Update global variable
    
    reply(`✅ Always online mode ${boolValue ? 'enabled' : 'disabled'}`);
   }
},
{
    command: ['setmenu'],
    operate: async ({ kelvin, m, reply, args, prefix, db, botNumber, Access, mess }) => {
        if (!Access) return reply(global.mess.owner);
        
        if (!args[0]) {
            let styleList = '*╔══❖ MENU STYLES ❖══╗*\n\n';
            const currentStyle = await db.getMenuStyle(botNumber, '2');
            
            for (let i = 1; i <= 6; i++) {
                const isCurrent = currentStyle === i.toString() ? '✅ ' : '   ';
                styleList += `${isCurrent}*${i}.* ${MENU_STYLES[i]}\n`;
            }
            styleList += `\n*╚══❖ Usage: ${prefix}setmenu 1-6 ❖══╝*`;
            return reply(styleList);
        }

        const style = args[0];
        if (!MENU_STYLES[style]) {
            return reply('*Invalid style! Please choose 1-6*');
        }
        await db.setMenuStyle(botNumber, style);
        
        // Verify it was saved
        const verify = await db.getMenuStyle(botNumber, '2');
        console.log(`✅ Menu style set to ${style}, verified: ${verify}`);
        
        reply(`*✅ Menu style set to:*\n*${MENU_STYLES[style]}*\n\n`);
    }
},
{
    command: ['checkmenu'],
    operate: async ({ kelvin, m, reply, args, prefix, db, botNumber, Access, mess }) => {
    if (!Access) return;
    const saved = await db.getMenuStyle(botNumber, '2');
    const raw = await db.get(botNumber, 'menu_style', '2'); // Direct DB check
    reply(`*📊 Menu style in database:* ${saved}\n*Raw value:* ${raw}\n*Style name:* ${MENU_STYLES[saved] || 'Unknown'}`);
    }
},
{
    command: ['setfont', 'font'],
    operate: async ({ kelvin, m, reply, args, prefix, db, botNumber, Access, mess }) => {
        if (!Access) return reply(mess.owner);

        if (!args[0]) {
            let fontList = '*╔══❖ AVAILABLE FONTS ❖══╗*\n\n';
            const currentFont = await db.get(botNumber, 'bot_font', 'normal');
            
            for (let i = 1; i <= 9; i++) {
                const font = AVAILABLE_FONTS[i];
                const isCurrent = currentFont === font.style ? '✅ ' : '   ';
                fontList += `${isCurrent}*${i}.* ${font.name}\n`;
            }
            fontList += `\n*╚══❖ Usage: ${prefix}setfont 1-9 ❖══╝*`;
            return reply(fontList);
        }

        const fontNumber = args[0];
        if (!AVAILABLE_FONTS[fontNumber]) {
            return reply('*Invalid font! Please choose 1-9*');
        }

        const selectedFont = AVAILABLE_FONTS[fontNumber];
        
        // Save to database
        await db.set(botNumber, 'bot_font', selectedFont.style);
        
        reply(`*✅ Font set to:* *${selectedFont.name}*\n\n*All bot responses will now use this font!*`);
    }
}
];