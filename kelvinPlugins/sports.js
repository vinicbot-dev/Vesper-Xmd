const axios = require("axios");
module.exports = [
{
        command: ['eplstandings'],
        operate: async ({ kelvin, mek, m, reply, from, text, q }) => {
        try {
    await kelvin.sendMessage(from, { react: { text: '⏳', key: m.key } });

    // Prepare the API URL
    const apiUrl = "https://apis-keith.vercel.app/epl/standings";

    // Call the API using GET
    const response = await axios.get(apiUrl);

    // Check if the API response is valid
    if (!response.data || !response.data.status || !response.data.result || !response.data.result.standings) {
      return reply('❌ Unable to fetch EPL standings. Please try again later.');
    }

    // Extract standings data
    const { competition, standings } = response.data.result;

    // Format the standings into a readable message
    let standingsList = `🏆 *${competition} - Standings* 🏆\n\n`;
    standings.forEach(team => {
      standingsList += `*${team.position}.* ${team.team}\n`;
      standingsList += `📊 *Played:* ${team.played} | *Won:* ${team.won} | *Draw:* ${team.draw} | *Lost:* ${team.lost}\n`;
      standingsList += `⚽ *Goals For:* ${team.goalsFor} | *Goals Against:* ${team.goalsAgainst} | *Goal Difference:* ${team.goalDifference}\n`;
      standingsList += `📈 *Points:* ${team.points}\n\n`;
    });

    // Send the standings list to the user
    await reply(standingsList);

    await kelvin.sendMessage(from, { react: { text: '✅', key: m.key } });
  } catch (error) {
    console.error('Error fetching EPL standings:', error);
    reply('❌ Unable to fetch EPL standings. Please try again later.');

    // Add a reaction to indicate failure
    await kelvin.sendMessage(from, { react: { text: '❌', key: m.key } });
  }
 }
}
]