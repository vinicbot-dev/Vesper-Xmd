/* Kelvin Tech - Multi-User Pairing Plugin */

const path = require('path');
const fs = require('fs');

const userSessionsDir = path.join(__dirname, '../user_sessions');

module.exports = [
    {
        command: ['pair', 'connect', 'useonmywa'],
        operate: async ({ kelvin, m, reply, text, prefix, command }) => {
            
            const userId = m.sender;
            const userNumber = userId.split('@')[0];
            const userDir = path.join(userSessionsDir, userNumber);

            if (!text) {
                return reply(
                    `╭──❖ 「 PAIR THIS BOT 」 ❖──\n` +
                    `│\n` +
                    `│  👋 *Hello @${userNumber}*\n` +
                    `│\n` +
                    `│  *Want to use THIS bot on YOUR WhatsApp?*\n` +
                    `│  Just send your session ID!\n` +
                    `│\n` +
                    `│  *Supported formats:*\n` +
                    `│  • JEXPLOIT-BOT~xxxxx\n` +
                    `│  • VESPER-BOT~xxxxx\n` │
                    `│\n` +
                    `│  *Example:*\n` +
                    `│  ${prefix + command} JEXPLOIT-BOT~xxxxx\n` +
                    `│\n` +
                    `│  *What happens:*\n` +
                    `│  ✅ Bot saves YOUR session\n` +
                    `│  ✅ Bot restarts\n` +
                    `│  ✅ You now control THIS bot!\n` +
                    `│  ✅ All features work for YOU\n` +
                    `│\n` +
                    `╰─────────❖`,
                    { mentions: [userId] }
                );
            }

            // Check if user already has a session
            if (fs.existsSync(userDir)) {
                return reply(
                    `⚠️ *You already have this bot paired!*\n\n` +
                    `The bot is already running on your WhatsApp.\n` +
                    `Just use commands normally in our chat.`
                );
            }

            // Send processing message
            const sentMsg = await kelvin.sendMessage(m.chat, {
                text: `🔄 *Setting up THIS bot on your WhatsApp...*\n⏱️ Please wait...`
            }, { quoted: m });

            try {
                // Create user's session folder
                fs.mkdirSync(userDir, { recursive: true });
                const credsPath = path.join(userDir, 'creds.json');

                // Handle JEXPLOIT-BOT format
                if (text.startsWith("JEXPLOIT-BOT~")) {
                    const base64Data = text.replace("JEXPLOIT-BOT~", "");
                    
                    if (!/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
                        throw new Error("Invalid base64 format");
                    }
                    
                    const decodedData = Buffer.from(base64Data, "base64");
                    await fs.promises.writeFile(credsPath, decodedData);

                // Handle VESPER-BOT format
                } else if (text.startsWith("VESPER-BOT~")) {
                    const base64Data = text.replace("VESPER-BOT~", "");
                    
                    if (!/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
                        throw new Error("Invalid base64 format");
                    }
                    
                    const decodedData = Buffer.from(base64Data, "base64");
                    await fs.promises.writeFile(credsPath, decodedData);

                } else {
                    // Clean up if invalid format
                    fs.rmSync(userDir, { recursive: true, force: true });
                    throw new Error("Use JEXPLOIT-BOT~ or VESPER-BOT~");
                }

                // Success message
                await kelvin.sendMessage(m.chat, {
                    text: `✅ *SUCCESS!*\n\n` +
                          `✨ *THIS bot will now run on YOUR WhatsApp!*\n\n` +
                          `━━━━━━━━━━━━━━━━━━━\n` +
                          `📱 *Your WhatsApp:* ${userNumber}\n` +
                          `🤖 *Bot:* ${global.botname || 'Vesper-Xmd'}\n` +
                          `━━━━━━━━━━━━━━━━━━━\n\n` +
                          `♻️ *Restarting to activate...*\n\n` +
                          `_You'll receive a welcome message from the bot on your WhatsApp in a few seconds._`,
                    edit: sentMsg.key
                });

                await kelvin.sendMessage(m.chat, {
                    react: { text: "✅", key: m.key }
                });

                // Restart to apply new session
                setTimeout(() => {
                    process.exit();
                }, 4000);

            } catch (error) {
                console.error('Pair error:', error);
                
                // Clean up if error occurred
                if (fs.existsSync(userDir)) {
                    fs.rmSync(userDir, { recursive: true, force: true });
                }

                await kelvin.sendMessage(m.chat, {
                    text: `❌ *Error:* ${error.message}`,
                    edit: sentMsg.key
                });
                await kelvin.sendMessage(m.chat, {
                    react: { text: "❌", key: m.key }
                });
            }
        }
    },
    {
        command: ['mybot', 'mysession'],
        operate: async ({ kelvin, m, reply }) => {
            const userId = m.sender;
            const userNumber = userId.split('@')[0];
            const userDir = path.join(userSessionsDir, userNumber);

            if (!fs.existsSync(userDir)) {
                return reply(
                    `📱 *This bot is NOT on your WhatsApp yet*\n\n` +
                    `Use .pair to get this bot on YOUR WhatsApp!`
                );
            }

            await reply(
                `✅ *This bot IS running on your WhatsApp!*\n\n` +
                `👤 *Your number:* ${userNumber}\n` +
                `🤖 *Bot:* ${global.botname || 'Vesper-Xmd'}\n\n` +
                `Just send commands normally in our chat!\n\n` +
                `_Note: Your settings are separate from other users._`
            );
        }
    },
    {
        command: ['unpair', 'remove'],
        operate: async ({ kelvin, m, reply }) => {
            const userId = m.sender;
            const userNumber = userId.split('@')[0];
            const userDir = path.join(userSessionsDir, userNumber);

            if (!fs.existsSync(userDir)) {
                return reply(`❌ No session found for your number.`);
            }

            await reply(`🗑️ *Removing your session...*`);

            // Delete user's session folder
            fs.rmSync(userDir, { recursive: true, force: true });

            await reply(
                `✅ *Your session has been removed*\n\n` +
                `The bot will now use the default session.\n` +
                `Restarting...`
            );

            setTimeout(() => {
                process.exit();
            }, 3000);
        }
    }
];