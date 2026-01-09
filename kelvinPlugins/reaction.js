const { fetchReactionImage } = require('../start/lib/reaction');

module.exports = [
    {
        command: ['kiss', 'cium', 'beso'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'kiss' });
        }
    },
    {
        command: ['cry'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'cry' });
        }
    },
    {
        command: ['blush'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'blush' });
        }
    },
    {
        command: ['dance'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'dance' });
        }
    },
    {
        command: ['kill'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'kill' });
        }
    },
    {
        command: ['hug'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'hug' });
        }
    },
    {
        command: ['kick', 'kick3'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'kick3' });
        }
    },
    {
        command: ['slap'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'slap' });
        }
    },
    {
        command: ['happy'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'happy' });
        }
    },
    {
        command: ['bully'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'bully' });
        }
    },
    // ADDITIONAL REACTION COMMANDS
    {
        command: ['pat', 'headpat'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'pat' });
        }
    },
    {
        command: ['wink'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'wink' });
        }
    },
    {
        command: ['poke'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'poke' });
        }
    },
    {
        command: ['cuddle'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'cuddle' });
        }
    },
    {
        command: ['highfive', 'hi5'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'highfive' });
        }
    },
    {
        command: ['smile'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'smile' });
        }
    },
    {
        command: ['wave'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'wave' });
        }
    },
    {
        command: ['bite'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'bite' });
        }
    },
    {
        command: ['lick'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'lick' });
        }
    },
    {
        command: ['bonk'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'bonk' });
        }
    },
    {
        command: ['yeet'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'yeet' });
        }
    },
    {
        command: ['glomp'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'glomp' });
        }
    },
    {
        command: ['stab'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'stab' });
        }
    },
    {
        command: ['nom'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'nom' });
        }
    },
    {
        command: ['tickle'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'tickle' });
        }
    },
    {
        command: ['throw'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'throw' });
        }
    },
    {
        command: ['facepalm'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'facepalm' });
        }
    },
    {
        command: ['feed'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'feed' });
        }
    },
    {
        command: ['spank'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'spank' });
        }
    },
    {
        command: ['handhold', 'holdhands'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'handhold' });
        }
    },
    {
        command: ['shoot'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'shoot' });
        }
    },
    {
        command: ['punch'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'punch' });
        }
    },
    {
        command: ['stare'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'stare' });
        }
    },
    {
        command: ['comfort'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'comfort' });
        }
    },
    {
        command: ['boop', 'boopnose'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'boop' });
        }
    },
    {
        command: ['sleep'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'sleep' });
        }
    },
    {
        command: ['shrug'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'shrug' });
        }
    },
    {
        command: ['sip'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'sip' });
        }
    },
    {
        command: ['clap'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'clap' });
        }
    },
    {
        command: ['nervous'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'nervous' });
        }
    },
    {
        command: ['scream'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'scream' });
        }
    },
    {
        command: ['pout'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'pout' });
        }
    },
    {
        command: ['bored'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'bored' });
        }
    },
    {
        command: ['laugh'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'laugh' });
        }
    },
    {
        command: ['shy'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'shy' });
        }
    },
    {
        command: ['confused'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'confused' });
        }
    },
    {
        command: ['angry'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'angry' });
        }
    },
    {
        command: ['excited'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'excited' });
        }
    },
    {
        command: ['fear'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'fear' });
        }
    },
    {
        command: ['surprised'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'surprised' });
        }
    },
    {
        command: ['thinking'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'thinking' });
        }
    },
    {
        command: ['embarrassed'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'embarrassed' });
        }
    },
    {
        command: ['tired'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'tired' });
        }
    },
    {
        command: ['sad'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'sad' });
        }
    },
    {
        command: ['love'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'love' });
        }
    },
    {
        command: ['peace'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'peace' });
        }
    },
    {
        command: ['victory', 'victorysign'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'victory' });
        }
    },
    {
        command: ['point'],
        operate: async ({ kelvin, m, reply }) => {
            await fetchReactionImage({ kelvin, m, reply, command: 'point' });
        }
    }
]