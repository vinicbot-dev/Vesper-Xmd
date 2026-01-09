const { 
    getSetting,
    updateSetting,
    getAllSettings,
    getSudo,
    addSudo,
    removeSudo,
    settingsManager,
    hasSudo
} = require('../start/Core/settingManager');

module.exports = [
    {
        command: ['antidelete', 'antidel', 'deletealert'],
        operate: async ({ kelvin, m, reply, prefix, args, Access, mess, botNumber }) => {
            if (!Access) return reply(global.mess.owner);
            
            const subcommand = args[0]?.toLowerCase();
            const value = args[1]?.toLowerCase();
            
            // Get current setting from database
            const currentMode = getSetting(botNumber, 'antidelete', 'off');
            
            if (!subcommand) {
                return reply(`*Anti-Delete System*
                
Usage:
• ${prefix}antidelete on - Enable anti-delete (default: chat mode)
• ${prefix}antidelete off - Disable anti-delete
• ${prefix}antidelete chat - Send alerts to same chat
• ${prefix}antidelete private - Send alerts to bot owner's inbox
• ${prefix}antidelete status - Show current settings
• ${prefix}antidelete test - Test the anti-delete system

Current Mode: ${currentMode}
Enabled: ${currentMode !== 'off' ? '✅' : '❌'}

📌 *Modes:*
• chat - Alerts sent to same chat where deletion happened
• private - Alerts sent to bot owner's private inbox
• off - Anti-delete disabled`);
            }
            
            switch(subcommand) {
                case 'on': {
                    // Default to chat mode when turning on
                    await updateSetting(botNumber, 'antidelete', 'chat');
                    reply(`✅ *Successfully enabled antidelete chat mode*`);
                    break;
                }
                
                case 'off': {
                    await updateSetting(botNumber, 'antidelete', 'off');
                    reply(`✅ *Successfully disabled antidelete*`);
                    break;
                }
                
                case 'chat': {
                    // Enable with specified mode
                    await updateSetting(botNumber, 'antidelete', subcommand);
                    reply(`✅ *Successfully enabled antidelete chat mode*`);
                    break;
                }
                
                case 'private': {
                    // Enable with specified mode
                    await updateSetting(botNumber, 'antidelete', subcommand);
                    reply(`✅ *Successfully enabled antidelete private mode*`);
                    break;
                }
                
                case 'status': {
                    const mode = getSetting(botNumber, 'antidelete', 'off');
                    const isEnabled = mode !== 'off';
                    
                    reply(`*Anti-Delete Status*
                    
• Status: ${isEnabled ? '✅ Enabled' : '❌ Disabled'}
• Mode: ${mode}
• Alerts: ${mode === 'chat' ? 'Same chat where deletion happens' : 
                   mode === 'private' ? "Bot owner's private inbox" : 
                   'Not active'}

📌 Captures: Text messages, images, videos, documents
📌 Works in: Groups and private chats`);
                    break;
                }
                
                case 'test': {
                    // Test the anti-delete feature
                    const mode = getSetting(botNumber, 'antidelete', 'off');
                    if (mode === 'off') {
                        reply('❌ Anti-delete is disabled. Enable it first with .antidelete on');
                        break;
                    }
                    
                    reply(`*Anti-Delete Test*
                    
Anti-delete is working in *${mode}* mode
Status: ✅ Active

Send a message, delete it, and see the alert in:
${mode === 'chat' ? '• This chat' : '• Bot owner\'s inbox'}

Note: This only works for messages sent AFTER anti-delete was enabled.`);
                    break;
                }
                
                default: {
                    reply(`❌ Invalid subcommand. Use ${prefix}antidelete to see all options`);
                    break;
                }
            }
        }
    },
    {
        command: ['antiedit', 'editalert'],
        operate: async ({ kelvin, m, reply, prefix, args, Access, mess, botNumber }) => {
            if (!Access) return reply(global.mess.owner);
            
            
            const subcommand = args[0]?.toLowerCase();
            const value = args[1]?.toLowerCase();
            
            if (!subcommand) {
                return reply(`*Anti-Edit System*
                
Usage:
• ${prefix}antiedit on - Enable anti-edit (default: chat mode)
• ${prefix}antiedit off - Disable anti-edit
• ${prefix}antiedit chat - Send alerts to same chat
• ${prefix}antiedit private - Send alerts to bot owner's inbox
• ${prefix}antiedit status - Show current settings

Current Mode: ${getSetting(botNumber, 'antiedit', 'off')}
Enabled: ${getSetting(botNumber, 'antiedit', 'off') !== 'off' ? '✅' : '❌'}

📌 *Modes:*
• chat - Alerts sent to same chat where edit happened
• private - Alerts sent to bot owner's private inbox
• off - Anti-edit disabled`);
            }
            
            switch(subcommand) {
                case 'on': {
                    // Default to chat mode when turning on
                    await updateSetting(botNumber, 'antiedit', 'chat');
                    reply(`*Successfully enabled antiedit chat mode*`);
                    break;
                }
                
                case 'off': {
                    await updateSetting(botNumber, 'antiedit', 'off');
                    reply(`*Successfully disabled antiedit*`);
                    break;
                }
                
                case 'chat': {
                    // Enable with specified mode
                    await updateSetting(botNumber, 'antiedit', subcommand);
                    reply(`*Successfully enabled antiedit chat mode*`);
                    break;
                }
                
                case 'private': {
                    // Enable with specified mode
                    await updateSetting(botNumber, 'antiedit', subcommand);
                    reply(`*Successfully enabled antiedit private mode*`);
                    break;
                }
                
                case 'status': {
                    const mode = getSetting(botNumber, 'antiedit', 'off');
                    const isEnabled = mode !== 'off';
                    
                    reply(`*Anti-Edit Status*
                    
• Status: ${isEnabled ? '✅ Enabled' : '❌ Disabled'}
• Mode: ${mode}
• Alerts: ${mode === 'chat' ? 'Same chat where edit happens' : 
                     mode === 'private' ? 'Bot owner\'s private inbox' : 
                     'Not active'}

📌 Captures: Edited text messages
📌 Shows: Original text → Edited text`);
                    break;
                }
                
                default: {
                    reply(`❌ Invalid subcommand. Use ${prefix}antiedit to see all options`);
                    break;
                }
            }
        }
    },
    {
        command: ['autorecording'],
        operate: async ({ kelvin, m, reply, prefix, args, Access, mess, botNumber }) => {
            if (!Access) return reply(global.mess.owner);
            
            const mode = args[0]?.toLowerCase();
            if (!mode || !['on', 'off'].includes(mode)) {
                return reply(`❌ Usage: ${prefix}autorecording <on/off>\nExample: ${prefix}autorecording on`);
            }
            
            const boolValue = mode === 'on';
            await updateSetting(botNumber, 'autorecording', boolValue);
            reply(`✅ Auto-recording ${boolValue ? 'enabled' : 'disabled'}`);
        }
    },
    {
        command: ['autotyping', 'typing'],
        operate: async ({ kelvin, m, reply, prefix, args, Access, mess, botNumber }) => {
            if (!Access) return reply(global.mess.owner);
                
            
            const mode = args[0]?.toLowerCase();
            if (!mode || !['on', 'off'].includes(mode)) {
                return reply(`❌ Usage: ${prefix}autotyping <on/off>\nExample: ${prefix}autotyping on`);
            }
            
            const boolValue = mode === 'on';
            await updateSetting(botNumber, 'autoTyping', boolValue);
            reply(`✅ Auto-typing ${boolValue ? 'enabled' : 'disabled'}`);
        }
    },
    {
        command: ['autoread'],
        operate: async ({ kelvin, m, reply, prefix, args, Access, mess, botNumber }) => {
            if (!Access) return reply(global.mess.owner);
            
            
            const mode = args[0]?.toLowerCase();
            if (!mode || !['on', 'off'].includes(mode)) {
                return reply(`❌ Usage: ${prefix}autoread <on/off>\nExample: ${prefix}autoread on`);
            }
            
            const boolValue = mode === 'on';
            await updateSetting(botNumber, 'autoread', boolValue);
            reply(`✅ Auto-read ${boolValue ? 'enabled' : 'disabled'}`);
        }
    },
    {
        command: ['autoreact'],
        operate: async ({ kelvin, m, reply, prefix, args, Access, mess, botNumber }) => {
            if (!Access) return reply(mess.owner);
            
            const mode = args[0]?.toLowerCase();
            if (!mode || !['on', 'off'].includes(mode)) {
                return reply(`❌ Usage: ${prefix}autoreact <on/off>\nExample: ${prefix}autoreact on`);
            }
            
            const boolValue = mode === 'on';
            await updateSetting(botNumber, 'autoreact', boolValue);
            reply(`✅ Auto-react ${boolValue ? 'enabled' : 'disabled'}`);
        }
    },
    {
        command: ['chatbot'],
        operate: async ({ kelvin, m, reply, prefix, args, Access, mess, botNumber }) => {
            if (!Access) return reply(global.mess.owner);
            
            const mode = args[0]?.toLowerCase();
            if (!mode || !['on', 'off'].includes(mode)) {
                return reply(`❌ Usage: ${prefix}chatbot <on/off>\nExample: ${prefix}chatbot on`);
            }
            
            const boolValue = mode === 'on';
            await updateSetting(botNumber, 'AI_CHAT', boolValue);
            reply(`✅ AI Chatbot ${boolValue ? 'enabled' : 'disabled'}`);
        }
    },
    {
        command: ['anticall'],
        operate: async ({ kelvin, m, reply, prefix, args, Access, mess, botNumber }) => {
            if (!Access) return reply(mess.owner);
            
            const subcommand = args[0]?.toLowerCase();
            
            if (!subcommand) {
                return reply(`*Anti-Call System*
                
Usage:
• ${prefix}anticall off - Disable anti-call (allow all calls)
• ${prefix}anticall decline - Decline calls and send message
• ${prefix}anticall block - Block calls and block callers
• ${prefix}anticall status - Show current status
• ${prefix}anticall test - Test the anti-call system

Current Mode: ${getSetting(botNumber, 'anticall', 'off')}
Enabled: ${getSetting(botNumber, 'anticall', 'off') !== 'off' ? '✅' : '❌'}

📌 *Modes:*
• off - Allow all calls (disabled)
• decline - Decline calls + send warning message
• block - Block calls + block user + send message

📌 *Owner Exceptions:*
• Bot owner calls are always allowed`);
            }
            
            switch(subcommand) {
                case 'off': {
                    await updateSetting(botNumber, 'anticall', 'off');
                    reply(`✅ Anti-call disabled\nAll calls will be accepted`);
                    break;
                }
                
                case 'decline': {
                    await updateSetting(botNumber, 'anticall', 'decline');
                    reply(`✅ Anti-call set to *decline* mode\nCalls will be declined with warning message`);
                    break;
                }
                
                case 'block': {
                    await updateSetting(botNumber, 'anticall', 'block');
                    reply(`✅ Anti-call set to *block* mode\nCalls will be blocked + users blocked`);
                    break;
                }
                
                case 'status': {
                    const mode = getSetting(botNumber, 'anticall', 'off');
                    const isEnabled = mode !== 'off';
                    
                    reply(`*Anti-Call Status*
                    
• Status: ${isEnabled ? '✅ Enabled' : '❌ Disabled'}
• Mode: ${mode}
• Action: ${mode === 'decline' ? 'Decline call + send message' : 
                       mode === 'block' ? 'Block call + block user + send message' : 
                       'Allow all calls'}

📌 Owner calls: Always allowed
📌 Cooldown: 30 seconds between warnings`);
                    break;
                }
                
                case 'test': {
                    const mode = getSetting(botNumber, 'anticall', 'off');
                    if (mode === 'off') {
                        reply('❌ Anti-call is disabled. Enable it first with .anticall decline/block');
                        break;
                    }
                    
                    reply(`🔧 *Anti-Call Test*
                    
Anti-call is active in *${mode}* mode
Next incoming call will be:
${mode === 'decline' ? '• Declined with warning message' : '• Blocked + user blocked'}

Try calling the bot to test the feature.`);
                    break;
                }
                
                default: {
                    reply(`❌ Invalid mode. Use: off, decline, or block`);
                    break;
                }
            }
        }
    },
    {
    command: ['autoviewstatus'],
    operate: async ({ kelvin, m, reply, args, prefix, botNumber, getSetting, updateSetting, Access }) => {
        if (!Access) return reply(global.mess.owner);
        
        const subcommand = args[0]?.toLowerCase();
        
        if (!subcommand) {
            return reply(`👀 *Auto-View Status System*
        
Usage:
• ${prefix}autoviewstatus on - Enable auto-view status
• ${prefix}autoviewstatus off - Disable auto-view status
• ${prefix}autoviewstatus status - Show current settings

Current Status: ${getSetting(botNumber, 'autoviewstatus', false) ? '✅ Enabled' : '❌ Disabled'}

📌 Feature: Automatically marks status updates as viewed
📌 Works on: All status updates (stories)
📌 Note: Privacy-friendly - uses official WhatsApp API`);
        }
        
        switch(subcommand) {
            case 'on': {
                await updateSetting(botNumber, 'autoviewstatus', true);
                reply(`✅ Auto-view status enabled\nAll status updates will be automatically marked as viewed`);
                break;
            }
            
            case 'off': {
                await updateSetting(botNumber, 'autoviewstatus', false);
                reply(`✅ Auto-view status disabled`);
                break;
            }
            
            case 'status': {
                const isEnabled = getSetting(botNumber, 'autoviewstatus', false);
                reply(`👀 *Auto-View Status Status*
            
• Status: ${isEnabled ? '✅ Enabled' : '❌ Disabled'}
• Action: ${isEnabled ? 'Auto marks status as viewed' : 'Disabled'}

Status updates are automatically marked as read when enabled.`);
                break;
            }
            
            default: {
                reply(`❌ Invalid subcommand. Use ${prefix}autoviewstatus on/off/status`);
                break;
            }
        }
    }
},
{
    command: ['autoreactstatus'],
    operate: async ({ kelvin, m, reply, args, prefix, botNumber, getSetting, updateSetting, Access }) => {
        if (!Access) return reply(global.mess.owner);
        
        const subcommand = args[0]?.toLowerCase();
        
        if (!subcommand) {
            return reply(`*Auto-React Status System*
        
Usage:
• ${prefix}autoreactstatus on - Enable auto-react to status
• ${prefix}autoreactstatus off - Disable auto-react to status
• ${prefix}autoreactstatus status - Show current settings
• ${prefix}autoreactstatus emoji <emoji> - Set custom reaction emoji

Current Status: ${getSetting(botNumber, 'autoreactstatus', false) ? '✅ Enabled' : '❌ Disabled'}
Current Emoji: ${getSetting(botNumber, 'statusemoji', '💚') || '💚'}

📌 Feature: Automatically reacts to status updates
📌 Works on: All status updates
📌 Default emoji: 💚 (can be customized)`);
        }
        
        switch(subcommand) {
            case 'on': {
                await updateSetting(botNumber, 'autoreactstatus', true);
                reply(`✅ Auto-react to status enabled\nBot will automatically react to status updates`);
                break;
            }
            
            case 'off': {
                await updateSetting(botNumber, 'autoreactstatus', false);
                reply(`✅ Auto-react to status disabled`);
                break;
            }
            
            case 'emoji': {
                const emoji = args[1];
                if (!emoji) {
                    return reply(`❌ Please provide an emoji\nUsage: ${prefix}autoreactstatus emoji 😂\nExample: ${prefix}autoreactstatus emoji ❤️`);
                }
                
                await updateSetting(botNumber, 'statusemoji', emoji);
                reply(`✅ Status reaction emoji set to: ${emoji}\nBot will use this emoji when reacting to status updates`);
                break;
            }
            
            case 'status': {
                const isEnabled = getSetting(botNumber, 'autoreactstatus', false);
                const emoji = getSetting(botNumber, 'statusemoji', '💚');
                reply(`*Auto-React Status Status*
            
• Status: ${isEnabled ? '✅ Enabled' : '❌ Disabled'}
• Emoji: ${emoji}
• Action: ${isEnabled ? 'Auto reacts with ' + emoji : 'Disabled'}

Bot automatically reacts to status updates when enabled.`);
                break;
            }
            
            default: {
                reply(`❌ Invalid subcommand. Use ${prefix}autoreactstatus on/off/status/emoji`);
                break;
            }
        }
    }
},
{
        command: ['welcome'],
        operate: async ({ kelvin, m, reply, prefix, args, Access, isGroup, botNumber }) => {
            if (!isGroup) return reply('❌ This command only works in groups!');
            
            const subcommand = args[0]?.toLowerCase();
            const groupId = m.chat;
            
            if (!subcommand) {
                return reply(`👋 *Welcome System*
Usage:
• ${prefix}welcome on - Enable welcome messages
• ${prefix}welcome off - Disable welcome messages`);
            }
            
            if (subcommand === 'on' || subcommand === 'off') {
                       
                const enabled = subcommand === 'on';
                
                if (global.settingsManager?.setWelcomeEnabled(botNumber, groupId, enabled)) {
                    return reply(`✅ Welcome messages ${enabled ? 'enabled' : 'disabled'} for this group!`);
                } else {
                    return reply('❌ Failed to update welcome setting.');
                }
            } else {
                return reply(`❌ Invalid option. Use: ${prefix}welcome on/off`);
            }
        }
    },
    {
        command: ['adminevent'],
        operate: async ({ kelvin, m, reply, prefix, args, Access, updateSetting, mess, botNumber }) => {
            if (!Access) return reply(global.mess.owner);
            
            const subcommand = args[0]?.toLowerCase();
            
            if (!subcommand) {
                return reply(`👑 *Admin Event Notifications*
Usage:
• ${prefix}adminevent on - Enable admin notifications
• ${prefix}adminevent off - Disable admin notifications`);
            }
            
            if (subcommand === 'on' || subcommand === 'off') {
                const enabled = subcommand === 'on';
                
                
                if (await updateSetting(botNumber, 'adminevent', enabled)) {
                    return reply(`✅ Admin event notifications ${enabled ? 'enabled' : 'disabled'}!`);
                } else {
                    return reply('❌ Failed to update admin event setting.');
                }
            } else {
                return reply(`❌ Invalid option. Use: ${prefix}adminevent on/off`);
            }
        }
    }
    
];