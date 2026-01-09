const { fetchReactionImage } = require('../start/lib/reaction');

module.exports = [
    {
        command: ['kiss', 'cium', 'beso'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'kiss' });
        }
    },
    {
        command: ['cry'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'cry' });
        }
    },
    {
        command: ['blush'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'blush' });
        }
    },
    {
        command: ['dance'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'dance' });
        }
    },
    {
        command: ['kill'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'kill' });
        }
    },
    {
        command: ['hug'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'hug' });
        }
    },
    {
        command: ['kick', 'kick3'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'kick3' });
        }
    },
    {
        command: ['slap'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'slap' });
        }
    },
    {
        command: ['happy'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'happy' });
        }
    },
    {
        command: ['bully'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'bully' });
        }
    },
    // ADDITIONAL REACTION COMMANDS
    {
        command: ['pat', 'headpat'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'pat' });
        }
    },
    {
        command: ['wink'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'wink' });
        }
    },
    {
        command: ['poke'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'poke' });
        }
    },
    {
        command: ['cuddle'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'cuddle' });
        }
    },
    {
        command: ['highfive', 'hi5'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'highfive' });
        }
    },
    {
        command: ['smile'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'smile' });
        }
    },
    {
        command: ['wave'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'wave' });
        }
    },
    {
        command: ['bite'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'bite' });
        }
    },
    {
        command: ['lick'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'lick' });
        }
    },
    {
        command: ['bonk'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'bonk' });
        }
    },
    {
        command: ['yeet'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'yeet' });
        }
    },
    {
        command: ['glomp'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'glomp' });
        }
    },
    {
        command: ['stab'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'stab' });
        }
    },
    {
        command: ['nom'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'nom' });
        }
    },
    {
        command: ['tickle'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'tickle' });
        }
    },
    {
        command: ['throw'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'throw' });
        }
    },
    {
        command: ['facepalm'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'facepalm' });
        }
    },
    {
        command: ['feed'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'feed' });
        }
    },
    {
        command: ['spank'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'spank' });
        }
    },
    {
        command: ['handhold', 'holdhands'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'handhold' });
        }
    },
    {
        command: ['shoot'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'shoot' });
        }
    },
    {
        command: ['punch'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'punch' });
        }
    },
    {
        command: ['stare'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'stare' });
        }
    },
    {
        command: ['comfort'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'comfort' });
        }
    },
    {
        command: ['boop', 'boopnose'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'boop' });
        }
    },
    {
        command: ['sleep'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'sleep' });
        }
    },
    {
        command: ['shrug'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'shrug' });
        }
    },
    {
        command: ['sip'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'sip' });
        }
    },
    {
        command: ['clap'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'clap' });
        }
    },
    {
        command: ['nervous'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'nervous' });
        }
    },
    {
        command: ['scream'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'scream' });
        }
    },
    {
        command: ['pout'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'pout' });
        }
    },
    {
        command: ['bored'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'bored' });
        }
    },
    {
        command: ['laugh'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'laugh' });
        }
    },
    {
        command: ['shy'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'shy' });
        }
    },
    {
        command: ['confused'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'confused' });
        }
    },
    {
        command: ['angry'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'angry' });
        }
    },
    {
        command: ['excited'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'excited' });
        }
    },
    {
        command: ['fear'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'fear' });
        }
    },
    {
        command: ['surprised'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'surprised' });
        }
    },
    {
        command: ['thinking'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'thinking' });
        }
    },
    {
        command: ['embarrassed'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'embarrassed' });
        }
    },
    {
        command: ['tired'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'tired' });
        }
    },
    {
        command: ['sad'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'sad' });
        }
    },
    {
        command: ['love'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'love' });
        }
    },
    {
        command: ['peace'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'peace' });
        }
    },
    {
        command: ['victory', 'victorysign'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'victory' });
        }
    },
    {
        command: ['point'],
        operate: async ({ conn, m, reply }) => {
            await fetchReactionImage({ conn, m, reply, command: 'point' });
        }
    }
]