module.exports = [

    {
        command: ['luxurygold', 'goldtext', 'goldfx'],
        operate: async ({ kelvin, m, reply, args, prefix, ephoto }) => {
            const q = args.join(" ");
            
            if (!q) {
                return reply(`*Example: ${prefix}luxurygold Kevin*`);
            }

            const link = "https://en.ephoto360.com/create-a-luxury-gold-text-effect-online-594.html";

            try {
                const result = await ephoto(link, q);
                await kelvin.sendMessage(
                    m.chat,
                    { 
                        image: { url: result }, 
                        caption: `> ${global.wm}` 
                    },
                    { quoted: m }
                );
            } catch (error) {
                console.error("Error in luxurygold command:", error);
                reply("*❌ An error occurred while generating the gold effect.*");
            }
        }
    },
    
    // Advanced Glow
    {
        command: ['advancedglow', 'aglow'],
        operate: async ({ kelvin, m, reply, args, prefix, ephoto }) => {
            const q = args.join(" ");
            if (!q) return reply(`*Example: ${prefix}advancedglow Kevin*`);
            
            const link = "https://en.ephoto360.com/advanced-glow-effects-74.html";
            
            try {
                const result = await ephoto(link, q);
                await kelvin.sendMessage(
                    m.chat,
                    { image: { url: result }, caption: `${global.wm}` },
                    { quoted: m }
                );
            } catch (error) {
                console.error("Error in advancedglow command:", error);
                reply("*❌ An error occurred while generating the effect.*");
            }
        }
    },
    
    // Blackpink Logo
    {
        command: ['blackpinklogo', 'bplogo'],
        operate: async ({ kelvin, m, reply, args, prefix, ephoto }) => {
            const q = args.join(" ");
            if (!q) return reply(`*Example: ${prefix}blackpinklogo Kevin*`);
            
            const link = "https://en.ephoto360.com/create-blackpink-logo-online-free-607.html";
            
            try {
                const result = await ephoto(link, q);
                await kelvin.sendMessage(
                    m.chat,
                    { image: { url: result }, caption: `${global.wm}` },
                    { quoted: m }
                );
            } catch (error) {
                console.error("Error in blackpinklogo command:", error);
                reply("*❌ An error occurred while generating the effect.*");
            }
        }
    },
    
    // Blackpink Style
    {
        command: ['blackpinkstyle', 'bpstyle'],
        operate: async ({ kelvin, m, reply, args, prefix, ephoto }) => {
            const q = args.join(" ");
            if (!q) return reply(`*Example: ${prefix}blackpinkstyle Kevin*`);
            
            const link = "https://en.ephoto360.com/online-blackpink-style-logo-maker-effect-711.html";
            
            try {
                const result = await ephoto(link, q);
                await kelvin.sendMessage(
                    m.chat,
                    { image: { url: result }, caption: `${global.wm}` },
                    { quoted: m }
                );
            } catch (error) {
                console.error("Error in blackpinkstyle command:", error);
                reply("*❌ An error occurred while generating the effect.*");
            }
        }
    },
    
    // Cartoon Style
    {
        command: ['cartoonstyle', 'cartoonfx'],
        operate: async ({ kelvin, m, reply, args, prefix, ephoto }) => {
            const q = args.join(" ");
            if (!q) return reply(`*Example: ${prefix}cartoonstyle Kevin*`);
            
            const link = "https://en.ephoto360.com/create-a-cartoon-style-graffiti-text-effect-online-668.html";
            
            try {
                const result = await ephoto(link, q);
                await kelvin.sendMessage(
                    m.chat,
                    { image: { url: result }, caption: `> ${global.wm}` },
                    { quoted: m }
                );
            } catch (error) {
                console.error("Error in cartoonstyle command:", error);
                reply("*❌ An error occurred while generating the effect.*");
            }
        }
    },
  
    {
        command: ['deadpool', 'deadpoolfx'],
        operate: async ({ kelvin, m, reply, args, prefix, ephoto }) => {
            const q = args.join(" ");
            if (!q) return reply(`*Example: ${prefix}deadpool Kevin*`);
            
            const link = "https://en.ephoto360.com/create-light-effects-green-neon-online-429.html";
            
            try {
                const result = await ephoto(link, q);
                await kelvin.sendMessage(
                    m.chat,
                    { image: { url: result }, caption: `> ${global.wm}` },
                    { quoted: m }
                );
            } catch (error) {
                console.error("Error in deadpool command:", error);
                reply("*❌ An error occurred while generating the effect.*");
            }
        }
    },
    
    // Effect Clouds
    {
        command: ['effectclouds', 'cloudsfx'],
        operate: async ({ kelvin, m, reply, args, prefix, ephoto }) => {
            const q = args.join(" ");
            if (!q) return reply(`*Example: ${prefix}effectclouds Kevin*`);
            
            const link = "https://en.ephoto360.com/write-text-effect-clouds-in-the-sky-online-619.html";
            
            try {
                const result = await ephoto(link, q);
                await kelvin.sendMessage(
                    m.chat,
                    { image: { url: result }, caption: `> ${global.wm}` },
                    { quoted: m }
                );
            } catch (error) {
                console.error("Error in effectclouds command:", error);
                reply("*❌ An error occurred while generating the effect.*");
            }
        }
    },
    
    // Flag Text
    {
        command: ['flagtext', 'flagfx'],
        operate: async ({ kelvin, m, reply, args, prefix, ephoto }) => {
            const q = args.join(" ");
            if (!q) return reply(`*Example: ${prefix}flagtext Kevin*`);
            
            const link = "https://en.ephoto360.com/nigeria-3d-flag-text-effect-online-free-753.html";
            
            try {
                const result = await ephoto(link, q);
                await kelvin.sendMessage(
                    m.chat,
                    { image: { url: result }, caption: `${global.wm}` },
                    { quoted: m }
                );
            } catch (error) {
                console.error("Error in flagtext command:", error);
                reply("*❌ An error occurred while generating the effect.*");
            }
        }
    },
    
    // Free Create
    {
        command: ['freecreate', 'freefx'],
        operate: async ({ kelvin, m, reply, args, prefix, ephoto }) => {
            const q = args.join(" ");
            if (!q) return reply(`*Example: ${prefix}freecreate Kevin*`);
            
            const link = "https://en.ephoto360.com/free-create-a-3d-hologram-text-effect-441.html";
            
            try {
                const result = await ephoto(link, q);
                await kelvin.sendMessage(
                    m.chat,
                    { image: { url: result }, caption: `${global.wm}` },
                    { quoted: m }
                );
            } catch (error) {
                console.error("Error in freecreate command:", error);
                reply("*❌ An error occurred while generating the effect.*");
            }
        }
    },
    
    // Galaxy Style
    {
        command: ['galaxystyle', 'galaxyfx'],
        operate: async ({ kelvin, m, reply, args, prefix, ephoto }) => {
            const q = args.join(" ");
            if (!q) return reply(`*Example: ${prefix}galaxystyle Kevin*`);
            
            const link = "https://en.ephoto360.com/create-galaxy-style-free-name-logo-438.html";
            
            try {
                const result = await ephoto(link, q);
                await kelvin.sendMessage(
                    m.chat,
                    { image: { url: result }, caption: `${global.wm}` },
                    { quoted: m }
                );
            } catch (error) {
                console.error("Error in galaxystyle command:", error);
                reply("*❌ An error occurred while generating the effect.*");
            }
        }
    },
    
    // Galaxy Wallpaper
    {
        command: ['galaxywallpaper', 'galaxywp'],
        operate: async ({ kelvin, m, reply, args, prefix, ephoto }) => {
            const q = args.join(" ");
            if (!q) return reply(`*Example: ${prefix}galaxywallpaper Kevin*`);
            
            const link = "https://en.ephoto360.com/create-galaxy-wallpaper-mobile-online-528.html";
            
            try {
                const result = await ephoto(link, q);
                await kelvin.sendMessage(
                    m.chat,
                    { image: { url: result }, caption: `${global.wm}` },
                    { quoted: m }
                );
            } catch (error) {
                console.error("Error in galaxywallpaper command:", error);
                reply("*❌ An error occurred while generating the effect.*");
            }
        }
    },
    
    // Making Neon
    {
        command: ['makingneon', 'makeneon'],
        operate: async ({ kelvin, m, reply, args, prefix, ephoto }) => {
            const q = args.join(" ");
            if (!q) return reply(`*Example: ${prefix}makingneon Kevin*`);
            
            const link = "https://en.ephoto360.com/making-neon-light-text-effect-with-galaxy-style-521.html";
            
            try {
                const result = await ephoto(link, q);
                await kelvin.sendMessage(
                    m.chat,
                    { image: { url: result }, caption: `${global.wm}` },
                    { quoted: m }
                );
            } catch (error) {
                console.error("Error in makingneon command:", error);
                reply("*❌ An error occurred while generating the effect.*");
            }
        }
    },
    
    // Matrix
    {
        command: ['matrix', 'matrixfx'],
        operate: async ({ kelvin, m, reply, args, prefix, ephoto }) => {
            const q = args.join(" ");
            if (!q) return reply(`*Example: ${prefix}matrix Kevin*`);
            
            const link = "https://en.ephoto360.com/matrix-text-effect-154.html";
            
            try {
                const result = await ephoto(link, q);
                await kelvin.sendMessage(
                    m.chat,
                    { image: { url: result }, caption: `${global.wm}` },
                    { quoted: m }
                );
            } catch (error) {
                console.error("Error in matrix command:", error);
                reply("*❌ An error occurred while generating the effect.*");
            }
        }
    },
    
    // Royal Text
    {
        command: ['royaltext', 'royalfx'],
        operate: async ({ kelvin, m, reply, args, prefix, ephoto }) => {
            const q = args.join(" ");
            if (!q) return reply(`*Example: ${prefix}royaltext Kevin*`);
            
            const link = "https://en.ephoto360.com/royal-text-effect-online-free-471.html";
            
            try {
                const result = await ephoto(link, q);
                await kelvin.sendMessage(
                    m.chat,
                    { image: { url: result }, caption: `${global.wm}` },
                    { quoted: m }
                );
            } catch (error) {
                console.error("Error in royaltext command:", error);
                reply("*❌ An error occurred while generating the effect.*");
            }
        }
    },
    
    // Sand
    {
        command: ['sand', 'sandfx'],
        operate: async ({ kelvin, m, reply, args, prefix, ephoto }) => {
            const q = args.join(" ");
            if (!q) return reply(`*Example: ${prefix}sand Kevin*`);
            
            const link = "https://en.ephoto360.com/write-in-sand-summer-beach-online-576.html";
            
            try {
                const result = await ephoto(link, q);
                await kelvin.sendMessage(
                    m.chat,
                    { image: { url: result }, caption: `${global.wm}` },
                    { quoted: m }
                );
            } catch (error) {
                console.error("Error in sand command:", error);
                reply("*❌ An error occurred while generating the effect.*");
            }
        }
    },
    
    // Summer Beach
    {
        command: ['summerbeach', 'beachfx'],
        operate: async ({ kelvin, m, reply, args, prefix, ephoto }) => {
            const q = args.join(" ");
            if (!q) return reply(`*Example: ${prefix}summerbeach Kevin*`);
            
            const link = "https://en.ephoto360.com/write-in-sand-summer-beach-online-free-595.html";
            
            try {
                const result = await ephoto(link, q);
                await kelvin.sendMessage(
                    m.chat,
                    { image: { url: result }, caption: `${global.wm}` },
                    { quoted: m }
                );
            } catch (error) {
                console.error("Error in summerbeach command:", error);
                reply("*❌ An error occurred while generating the effect.*");
            }
        }
    },
    
    // Topography
    {
        command: ['topography', 'topofx'],
        operate: async ({ kelvin, m, reply, args, prefix, ephoto }) => {
            const q = args.join(" ");
            if (!q) return reply(`*Example: ${prefix}topography Kevin*`);
            
            const link = "https://en.ephoto360.com/create-typography-text-effect-on-pavement-online-774.html";
            
            try {
                const result = await ephoto(link, q);
                await kelvin.sendMessage(
                    m.chat,
                    { image: { url: result }, caption: `${global.wm}` },
                    { quoted: m }
                );
            } catch (error) {
                console.error("Error in topography command:", error);
                reply("*❌ An error occurred while generating the effect.*");
            }
        }
    },
    
    // Typography
    {
        command: ['typography', 'typefx'],
        operate: async ({ kelvin, m, reply, args, prefix, ephoto }) => {
            const q = args.join(" ");
            if (!q) return reply(`*Example: ${prefix}typography Kevin*`);
            
            const link = "https://en.ephoto360.com/create-typography-text-effect-on-pavement-online-774.html";
            
            try {
                const result = await ephoto(link, q);
                await kelvin.sendMessage(
                    m.chat,
                    { image: { url: result }, caption: `${global.wm}` },
                    { quoted: m }
                );
            } catch (error) {
                console.error("Error in typography command:", error);
                reply("*❌ An error occurred while generating the effect.*");
            }
        }
    },
    
    // Royal (using external API)
    {
        command: ['royal', 'royal2'],
        operate: async ({ kelvin, m, reply, text, prefix }) => {
            if (!text) return reply(`*Example: ${prefix}royal Kelvin*`);
            
            try {
                await reply('👑 Creating royal logo... Please wait ⏳');
                
                const apiUrl = `https://api.nekolabs.my.id/ephoto/royal-text?text=${encodeURIComponent(text)}`;
                
                await kelvin.sendMessage(m.chat, {
                    image: { url: apiUrl },
                    caption: `${global.wm}`
                }, { quoted: m });
                
            } catch (error) {
                console.error('Royal command error:', error);
                reply('❌ Error generating logo. Please try again later.');
            }
        }
    },
    
    // Text on Wet Glass
    {
        command: ['textonwetglass', 'wetglass', 'wetfx'],
        operate: async ({ kelvin, m, reply, text, prefix }) => {
            if (!text) return reply(`*Example: ${prefix}textonwetglass Kelvin*`);
            
            try {
                await reply('💧 Creating text on wet glass effect... Please wait ⏳');
                
                const apiUrl = `https://api.nekolabs.web.id/ephoto/text-on-wet-glass?text=${encodeURIComponent(text)}`;
                
                await kelvin.sendMessage(m.chat, {
                    image: { url: apiUrl },
                    caption: `> ${global.wm}`
                }, { quoted: m });
                
            } catch (error) {
                console.error('TextOnWetGlass command error:', error);
                reply('❌ Error generating wet glass effect. Please try again later.');
            }
        }
    },
    
    // Bear
    {
        command: ['bear', 'bearlogo'],
        operate: async ({ kelvin, m, reply, text, prefix }) => {
            if (!text) return reply(`*Example: ${prefix}bear Kelvin*`);
            
            try {
                await reply('🐻 Creating bear logo... Please wait ⏳');
                
                const apiUrl = `https://api.nekolabs.my.id/ephoto/bear-logo?text=${encodeURIComponent(text)}`;
                
                await kelvin.sendMessage(m.chat, {
                    image: { url: apiUrl },
                    caption: `${global.wm}`
                }, { quoted: m });
                
            } catch (error) {
                console.error('Bear command error:', error);
                reply('❌ Error generating logo. Please try again later.');
            }
        }
    },
    
    // Papercut / 3D Paper
    {
        command: ['papercut', '3dpaper', 'paper3d'],
        operate: async ({ kelvin, m, reply, text, prefix }) => {
            if (!text) return reply(`*Example: ${prefix}papercut Kelvin*`);
            
            try {
                await reply('✂️ Creating 3D paper cut style... Please wait ⏳');
                
                const apiUrl = `https://api.nekolabs.my.id/ephoto/3d-paper-cut-style?text=${encodeURIComponent(text)}`;
                
                await kelvin.sendMessage(m.chat, {
                    image: { url: apiUrl },
                    caption: `${global.wm}`
                }, { quoted: m });
                
            } catch (error) {
                console.error('Papercut command error:', error);
                reply('❌ Error generating logo. Please try again later.');
            }
        }
    },
    
    // Hologram / 3D Hologram
    {
        command: ['hologram', '3dhologram', 'hologram3d'],
        operate: async ({ kelvin, m, reply, text, prefix }) => {
            if (!text) return reply(`*Example: ${prefix}hologram Kelvin*`);
            
            try {
                await reply('✨ Creating 3D hologram text... Please wait ⏳');
                
                const apiUrl = `https://api.nekolabs.my.id/ephoto/3d-hologram-text?text=${encodeURIComponent(text)}`;
                
                await kelvin.sendMessage(m.chat, {
                    image: { url: apiUrl },
                    caption: `${global.wm}`
                }, { quoted: m });
                
            } catch (error) {
                console.error('Hologram command error:', error);
                reply('❌ Error generating hologram. Please try again later.');
            }
        }
    },
    {
  command: ["flag3dtext"],
  operate: async ({ m, args, reply, kelvin, prefix, mess, ephoto }) => {
    let q = args.join(" ");
    if (!q) {
      return reply(`*Example: ${prefix}flag3dtext Kelvin*`);
    }

    const link = "https://en.ephoto360.com/free-online-american-flag-3d-text-effect-generator-725.html";

    try {
      let result = await ephoto(link, q);
      await kelvin.sendMessage(
        m.chat,
        { image: { url: result }, caption: `> ${global.wm}` },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in flag3dtext command:", error);
      reply("*An error occurred while generating the effect.*");
    }
  },
},
{
  command: ["glitchtext"],
  operate: async ({ m, args, reply, kelvin, prefix, mess, ephoto }) => {
    let q = args.join(" ");
    if (!q) {
      return reply(`*Example: ${prefix}glitchtext Kelvin*`);
    }

    const link = "https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html";

    try {
      let result = await ephoto(link, q);
      await kelvin.sendMessage(
        m.chat,
        { image: { url: result }, caption: `> ${global.wm}` },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in glitchtext command:", error);
      reply("*An error occurred while generating the effect.*");
    }
  },
}, 
{
  command: ["dragonball"],
  operate: async ({ m, args, reply, kelvin, prefix, mess, ephoto }) => {
    let q = args.join(" ");
    if (!q) {
      return reply(`*Example: ${prefix}dragonball Kelvin*`);
    }

    const link = "https://en.ephoto360.com/create-dragon-ball-style-text-effects-online-809.html";

    try {
      let result = await ephoto(link, q);
      await kelvin.sendMessage(
        m.chat,
        { image: { url: result }, caption: `> ${global.wm}` },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in dragonball command:", error);
      reply("*An error occurred while generating the effect.*");
    }
  },
},
{
  command: ["multicoloredneon"],
  operate: async ({ m, args, reply, kelvin, prefix, mess, ephoto }) => {
    let q = args.join(" ");
    if (!q) {
      return reply(`*Example: ${prefix}multicoloredneon Kevin*`);
    }

    const link = "https://en.ephoto360.com/create-multicolored-neon-light-signatures-591.html";

    try {
      let result = await ephoto(link, q);
      await kelvin.sendMessage(
        m.chat,
        { image: { url: result }, caption: `> ${global.wm}` },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in multicoloredneon command:", error);
      reply("*An error occurred while generating the effect.*");
    }
  },
},
{
  command: ["neonglitch"],
  operate: async ({ m, args, reply, kelvin, prefix, mess, ephoto }) => {
    let q = args.join(" ");
    if (!q) {
      return reply(`*Example: ${prefix}neonglitch Kelvin*`);
    }

    const link = "https://en.ephoto360.com/create-impressive-neon-glitch-text-effects-online-768.html";

    try {
      let result = await ephoto(link, q);
      await kelvin.sendMessage(
        m.chat,
        { image: { url: result }, caption: `> ${global.wm}` },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in neonglitch command:", error);
      reply("*An error occurred while generating the effect.*");
    }
  },
},
{
  command: ["papercutstyle"],
  operate: async ({ m, args, reply, kelvin, prefix, mess, ephoto }) => {
    let q = args.join(" ");
    if (!q) {
      return reply(`*Example: ${prefix}papercutstyle Kevin*`);
    }

    const link = "https://en.ephoto360.com/multicolor-3d-paper-cut-style-text-effect-658.html";

    try {
      let result = await ephoto(link, q);
      await kelvin.sendMessage(
        m.chat,
        { image: { url: result }, caption: `> ${global.wm}` },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in papercutstyle command:", error);
      reply("*An error occurred while generating the effect.*");
    }
  },
},
{
  command: ["pixelglitch"],
  operate: async ({ m, args, reply, kelvin, prefix, mess, ephoto }) => {
    let q = args.join(" ");
    if (!q) {
      return reply(`*Example: ${prefix}pixelglitch Kelvin*`);
    }

    const link = "https://en.ephoto360.com/create-pixel-glitch-text-effect-online-769.html";

    try {
      let result = await ephoto(link, q);
      await kelvin.sendMessage(
        m.chat,
        { image: { url: result }, caption: `> ${global.wm}` },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in pixelglitch command:", error);
      reply("*An error occurred while generating the effect.*");
    }
  },
},
{
  command: ["glowingtext"],
  operate: async ({ m, args, reply, kelvin, prefix, mess, ephoto }) => {
    let q = args.join(" ");
    if (!q) {
      return reply(`*Example: ${prefix}glowingtext Kevin*`);
    }

    const link = "https://en.ephoto360.com/create-glowing-text-effects-online-706.html";

    try {
      let result = await ephoto(link, q);
      await kelvin.sendMessage(
        m.chat,
        { image: { url: result }, caption: `> ${global.wm}` },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in glowingtext command:", error);
      reply("*An error occurred while generating the effect.*");
    }
  },
},
{
  command: ["gradienttext"],
  operate: async ({ m, args, reply, kelvin, prefix, mess, ephoto }) => {
    let q = args.join(" ");
    if (!q) {
      return reply(`*Example: ${prefix}gradienttext Kelvin*`);
    }

    const link = "https://en.ephoto360.com/create-3d-gradient-text-effect-online-600.html";

    try {
      let result = await ephoto(link, q);
      await kelvin.sendMessage(
        m.chat,
        { image: { url: result }, caption: `> ${global.wm}` },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in gradienttext command:", error);
      reply("*An error occurred while generating the effect.*");
    }
  },
},
{
  command: ["graffiti"],
  operate: async ({ m, args, reply, kelvin, prefix, mess, ephoto }) => {
    let q = args.join(" ");
    if (!q) {
      return reply(`*Example: ${prefix}graffiti Kevin*`);
    }

    const link = "https://en.ephoto360.com/cute-girl-painting-graffiti-text-effect-667.html";

    try {
      let result = await ephoto(link, q);
      await kelvin.sendMessage(
        m.chat,
        { image: { url: result }, caption: `> ${global.wm}` },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in graffiti command:", error);
      reply("*An error occurred while generating the effect.*");
    }
  },
},
{
  command: ["incandescent"],
  operate: async ({ m, args, reply, kelvin, prefix, mess, ephoto }) => {
    let q = args.join(" ");
    if (!q) {
      return reply(`*Example: ${prefix}incandescent Kelvin*`);
    }

    const link = "https://en.ephoto360.com/text-effects-incandescent-bulbs-219.html";

    try {
      let result = await ephoto(link, q);
      await kelvin.sendMessage(
        m.chat,
        { image: { url: result }, caption: `> ${global.wm}` },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in incandescent command:", error);
      reply("*An error occurred while generating the effect.*");
    }
  },
},
{
  command: ["lighteffects"],
  operate: async ({ m, args, reply, kelvin, prefix, mess, ephoto }) => {
    let q = args.join(" ");
    if (!q) {
      return reply(`*Example: ${prefix}lighteffects Kevin*`);
    }

    const link = "https://en.ephoto360.com/create-light-effects-green-neon-online-429.html";

    try {
      let result = await ephoto(link, q);
      await kelvin.sendMessage(
        m.chat,
        { image: { url: result }, caption: `${global.wm}` },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in lighteffects command:", error);
      reply("*An error occurred while generating the effect.*");
    }
  },
},
{
  command: ["logomaker"],
  operate: async ({ m, args, reply, kelvin, prefix, mess, ephoto }) => {
    let q = args.join(" ");
    if (!q) {
      return reply(`*Example: ${prefix}logomaker Kelvin*`);
    }

    const link = "https://en.ephoto360.com/free-bear-logo-maker-online-673.html";

    try {
      let result = await ephoto(link, q);
      await kelvin.sendMessage(
        m.chat,
        { image: { url: result }, caption: `> ${globalwm}` },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in logomaker command:", error);
      reply("*An error occurred while generating the effect.*");
    }
  },
},
{
    command: ["shadowtext", "shadowsky"],
    operate: async ({ kelvin, m, reply, args, prefix }) => {
        const text = args.join(" ");
        if (!text) return reply(`*Example: ${prefix}shadowtext Kelvin*`);
        
        try {
            await reply("✨ Creating shadow text effect... Please wait ⏳");
            
            const apiUrl = `https://api.siputzx.my.id/api/m/photooxy?url=https://photooxy.com/logo-and-text-effects/shadow-text-effect-in-the-sky-394.html&text1=${encodeURIComponent(text)}&text2=`;
            
            await kelvin.sendMessage(m.chat, {
                image: { url: apiUrl },
                caption: `> ${global.wm}`
            }, { quoted: m });
        } catch (error) {
            console.error("Error in shadowtext command:", error);
            reply("Error generating effect. Please try again.");
        }
    }
}
];