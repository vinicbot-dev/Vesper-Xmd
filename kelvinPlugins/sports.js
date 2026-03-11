/* Kelvin Tech  */

const axios = require("axios");
const fetch = require('node-fetch');

const BASE_API = "https://apiskeith.top";

function getLeaguePath(leagueCode) {
  const leagueMap = {
    'PL': 'epl',
    'CL': 'ucl',
    'PD': 'laliga',
    'BL1': 'bundesliga',
    'SA': 'seriea',
    'FL1': 'ligue1',
    'EL': 'el',
    'ELC': 'efl',
    'WC': 'wc',
    'EUROS': 'euros',
    'FIFA': 'fifa'
  };
  return leagueMap[leagueCode] || leagueCode.toLowerCase();
}

async function formatStandings(leagueCode, leagueName, { m, reply }) {
  try {
    const leaguePath = getLeaguePath(leagueCode);
    const apiUrl = `${BASE_API}/${leaguePath}/standings`;
    
    console.log(`Fetching: ${apiUrl}`);
    
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.status || !data.result) {
      return reply(`❌ Failed to fetch ${leagueName} standings.`);
    }

    const standings = data.result.standings || data.result;
    
    if (!standings || standings.length === 0) {
      return reply(`❌ No standings data found for ${leagueName}.`);
    }

    let message = `*⚽ ${leagueName} Standings ⚽*\n\n`;
    
    standings.forEach((team) => {
      let positionIndicator = '';
      if (leagueCode === 'CL' || leagueCode === 'EL') {
        if (team.position <= (leagueCode === 'CL' ? 4 : 3)) positionIndicator = '🌟 ';
      } else {
        if (team.position <= 4) positionIndicator = '🌟 '; 
        else if (team.position === 5 || team.position === 6) positionIndicator = '⭐ ';
        else if (team.position >= standings.length - 2) positionIndicator = '⚠️ '; 
      }

      message += `*${positionIndicator}${team.position}.* ${team.team}\n`;
      message += `   📊 Played: ${team.played} | W: ${team.won} | D: ${team.draw} | L: ${team.lost}\n`;
      message += `   ⚽ Goals: ${team.goalsFor}-${team.goalsAgainst} (GD: ${team.goalDifference > 0 ? '+' : ''}${team.goalDifference})\n`;
      message += `   🏆 Points: *${team.points}*\n\n`;
    });

    if (leagueCode === 'CL' || leagueCode === 'EL') {
      message += '\n*🌟 = Qualification for next stage*';
    } else {
      message += '\n*🌟 = UCL | ⭐ = Europa | ⚠️ = Relegation*';
    }
    
    reply(message);
  } catch (error) {
    console.error(`Error fetching ${leagueName} standings:`, error);
    reply(`❌ Error fetching ${leagueName} standings. Please try again later.`);
  }
}

async function formatMatches(leagueCode, leagueName, { m, reply }) {
  try {
    const leaguePath = getLeaguePath(leagueCode);
    const apiUrl = `${BASE_API}/${leaguePath}/matches`;
    
    console.log(`Fetching: ${apiUrl}`);
    
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.status || !data.result) {
      return reply(`❌ Failed to fetch ${leagueName} matches.`);
    }

    const matches = data.result.matches || data.result;
    
    if (!matches || matches.length === 0) {
      return reply(`❌ No ${leagueName} matches found.`);
    }

    const { liveMatches, finishedMatches, otherMatches } = categorizeMatches(matches);

    const messageSections = [
      buildLiveMatchesSection(liveMatches),
      buildFinishedMatchesSection(finishedMatches),
      buildOtherMatchesSection(otherMatches, liveMatches, finishedMatches)
    ].filter(Boolean);

    const header = `*⚽ ${leagueName} Match Results & Live Games ⚽*\n\n`;
    const finalMessage = messageSections.length 
      ? header + messageSections.join('\n')
      : header + `No current or recent matches found. Check upcoming matches using .${leagueCode.toLowerCase()}upcoming`;

    reply(finalMessage);
  } catch (error) {
    console.error(`Error fetching ${leagueName} matches:`, error);
    reply(`❌ Error fetching ${leagueName} matches. Please try again later.`);
  }
}

async function formatTopScorers(leagueCode, leagueName, { m, reply }) {
  try {
    const leaguePath = getLeaguePath(leagueCode);
    const apiUrl = `${BASE_API}/${leaguePath}/scorers`;
    
    console.log(`Fetching: ${apiUrl}`);
    
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.status || !data.result) {
      return reply(`❌ Failed to fetch ${leagueName} top scorers.`);
    }

    const scorers = data.result.topScorers || data.result;
    
    if (!scorers || scorers.length === 0) {
      return reply(`❌ No top scorers data found for ${leagueName}.`);
    }

    let message = `*⚽ ${leagueName} Top Scorers ⚽*\n\n`;
    message += '🏆 *Golden Boot Race*\n\n';

    scorers.forEach(player => {
      message += `*${player.rank}.* ${player.player} (${player.team})\n`;
      message += `   ⚽ Goals: *${player.goals}*`;
      message += ` | 🎯 Assists: ${player.assists || 0}`;
      message += ` | ⏏️ Penalties: ${player.penalties || 0}\n\n`;
    });

    reply(message);
  } catch (error) {
    console.error(`Error fetching ${leagueName} top scorers:`, error);
    reply(`❌ Error fetching ${leagueName} top scorers. Please try again later.`);
  }
}

async function formatUpcomingMatches(leagueCode, leagueName, { m, reply }) {
  try {
    const leaguePath = getLeaguePath(leagueCode);
    const apiUrl = `${BASE_API}/${leaguePath}/upcomingmatches`;
    
    console.log(`Fetching: ${apiUrl}`);
    
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.status || !data.result) {
      return reply(`❌ Failed to fetch upcoming ${leagueName} matches.`);
    }

    const matches = data.result.upcomingMatches || data.result;
    
    if (!matches || matches.length === 0) {
      return reply(`❌ No upcoming ${leagueName} matches found.`);
    }

    let message = `*📅 Upcoming ${leagueName} Matches ⚽*\n\n`;

    // Group by matchday
    const matchesByMatchday = {};
    matches.forEach(match => {
      const matchday = match.matchday || 1;
      if (!matchesByMatchday[matchday]) {
        matchesByMatchday[matchday] = [];
      }
      matchesByMatchday[matchday].push(match);
    });

    const sortedMatchdays = Object.keys(matchesByMatchday).sort((a, b) => a - b);

    sortedMatchdays.forEach(matchday => {
      message += `*🗓️ Matchday ${matchday}:*\n`;
      
      matchesByMatchday[matchday].forEach(match => {
        // Parse date from format like "3/14/2026, 3:00:00 PM"
        const dateStr = match.date;
        const matchDate = new Date(dateStr);
        
        const formattedDate = matchDate.toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        message += `\n⏰ ${formattedDate}\n`;
        message += `   🏠 ${match.homeTeam} vs ${match.awayTeam} 🚌\n\n`;
      });
      
      message += '\n';
    });

    reply(message);
  } catch (error) {
    console.error(`Error fetching upcoming ${leagueName} matches:`, error);
    reply(`❌ Error fetching upcoming ${leagueName} matches. Please try again later.`);
  }
}

function categorizeMatches(matches) {
  const categories = {
    liveMatches: [],
    finishedMatches: [],
    otherMatches: []
  };

  matches.forEach(match => {
    if (match.status === 'FINISHED') {
      categories.finishedMatches.push(match);
    } 
    else if (isLiveMatch(match)) {
      categories.liveMatches.push(match);
    } 
    else {
      categories.otherMatches.push(match);
    }
  });

  return categories;
}

function isLiveMatch(match) {
  const liveStatusIndicators = ['LIVE', 'ONGOING', 'IN_PROGRESS', 'PLAYING'];
  return (
    (match.status && liveStatusIndicators.some(indicator => 
      match.status.toUpperCase().includes(indicator))) ||
    (match.score && match.status !== 'FINISHED')
  );
}

function buildLiveMatchesSection(liveMatches) {
  if (!liveMatches.length) return null;
  
  let section = `🔥 *Live Matches (${liveMatches.length})*\n\n`;
  liveMatches.forEach((match, index) => {
    section += `${index + 1}. 🟢 ${match.status || 'LIVE'}\n`;
    section += `   ${match.homeTeam} vs ${match.awayTeam}\n`;
    if (match.score) section += `   📊 Score: ${match.score}\n`;
    if (match.time) section += `   ⏱️ Minute: ${match.time || 'Unknown'}\n`;
    section += '\n';
  });
  
  return section;
}

function buildFinishedMatchesSection(finishedMatches) {
  if (!finishedMatches.length) return null;

  let section = `✅ *Recent Results (${finishedMatches.length})*\n\n`;
  const byMatchday = finishedMatches.reduce((acc, match) => {
    (acc[match.matchday] = acc[match.matchday] || []).push(match);
    return acc;
  }, {});

  Object.keys(byMatchday)
    .sort((a, b) => b - a)
    .forEach(matchday => {
      section += `📅 *Matchday ${matchday} (${byMatchday[matchday].length} matches)*:\n`;
      byMatchday[matchday].forEach((match, index) => {
        const winnerEmoji = match.winner === 'Draw' ? '⚖️' : '🏆';
        section += `${index + 1}. ${match.homeTeam} ${match.score} ${match.awayTeam}\n`;
        section += `   ${winnerEmoji} ${match.winner}\n\n`;
      });
    });

  return section;
}

function buildOtherMatchesSection(otherMatches, liveMatches, finishedMatches) {
  if (!otherMatches.length || liveMatches.length || finishedMatches.length) return null;
  
  let section = `📌 *Other Matches (${otherMatches.length})*\n\n`;
  otherMatches.forEach((match, index) => {
    section += `${index + 1}. ${match.homeTeam} vs ${match.awayTeam}\n`;
    section += `   Status: ${match.status || 'Unknown'}\n\n`;
  });
  
  return section;
}

async function getWrestlingEvents({ reply }) {
  try {
    const { data } = await axios.get(`${global.wwe2}`);
    
    if (!data.event || data.event.length === 0) {
      return reply("❌ No upcoming wrestling events found.");
    }

    const eventsList = data.event.map(event => {
      return (
        `*🏟️ ${event.strEvent}*\n` +
        `📅 *Date:* ${event.dateEvent || 'N/A'}\n` +
        `🏆 *League:* ${event.strLeague}\n` +
        `📍 *Venue:* ${event.strVenue || event.strCity || 'N/A'}\n` +
        (event.strDescriptionEN ? `📝 *Match:* ${event.strDescriptionEN.replace(/\r\n/g, ' | ')}\n` : '') +
        `────────────────────`
      );
    }).join('\n\n');

    reply(
      `*🗓️ Upcoming Wrestling Events*\n\n` +
      `${eventsList}\n\n` +
      `_Data provided by TheSportsDB_`
    );

  } catch (error) {
    console.error(error);
    reply("❌ Failed to fetch wrestling events. Please try again later.");
  }
}

async function getWWENews({ reply }) {
  try {
    const { data } = await axios.get(`${global.wwe}`);
    
    if (!data.data || data.data.length === 0) {
      return reply("❌ No WWE news found at this time.");
    }

    const newsList = data.data.map(item => {
      return (
        `*${item.title}*\n` +
        `📅 ${item.created} (${item.time_ago})\n` +
        `📺 ${item.parent_title}\n` +
        (item.image?.src ? `🌆 View Image (https://www.wwe.com${item.image.src})\n` : '') +
        `🔗 [Read More](https://www.wwe.com${item.url})\n` +
        `────────────────────`
      );
    }).join('\n\n');

    reply(
      `*📰 Latest WWE News*\n\n` +
      `${newsList}\n\n` +
      `_Powered by WWE Official API_`
    );

  } catch (error) {
    console.error(error);
    reply("❌ Failed to fetch WWE news. Please try again later.");
  }
}

async function getWWESchedule({ reply }) {
  try {
    const { data } = await axios.get(`${global.wwe1}`);
    
    if (!data.event || data.event.length === 0) {
      return reply("❌ No upcoming WWE events found.");
    }

    const eventsList = data.event.map(event => {
      const eventType = event.strEvent.includes('RAW') ? '🎤 RAW' : 
                       event.strEvent.includes('NXT') ? '🌟 NXT' :
                       event.strEvent.includes('SmackDown') ? '🔵 SmackDown' :
                       '🏆 PPV';
      
      return (
        `${eventType} *${event.strEvent}*\n` +
        `📅 ${event.dateEvent || 'Date not specified'}\n` +
        `📍 ${event.strVenue || event.strCity || 'Location not specified'}\n` +
        (event.strDescriptionEN ? `📝 ${event.strDescriptionEN}\n` : '') +
        `────────────────────`
      );
    }).join('\n\n');

    reply(
      `*📅 Upcoming WWE Events*\n\n` +
      `${eventsList}\n\n` +
      `_Data provided by TheSportsDB_`
    );

  } catch (error) {
    console.error(error);
    reply("❌ Failed to fetch WWE events. Please try again later.");
  }
}

// Team Search
async function searchTeam(query, { reply }) {
  try {
    if (!query) return reply("❌ Please provide a team name. Example: `.teamsearch arsenal`");
    
    const response = await fetch(`${BASE_API}/sport/teamsearch?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    if (!data.status || !data.result || data.result.length === 0) {
      return reply(`❌ No team found for "${query}"`);
    }
    
    const team = data.result[0];
    let message = `*⚽ Team Information: ${team.name} ⚽*\n\n`;
    message += `*🏷️ Full Name:* ${team.alternateName || team.name}\n`;
    message += `*📅 Formed:* ${team.formedYear || 'N/A'}\n`;
    message += `*🏟️ Stadium:* ${team.stadium || 'N/A'} (Capacity: ${team.stadiumCapacity?.toLocaleString() || 'N/A'})\n`;
    message += `*📍 Location:* ${team.location || team.country || 'N/A'}\n`;
    message += `*🏆 League:* ${team.league || 'N/A'}\n\n`;
    
    if (team.description) {
      const shortDesc = team.description.substring(0, 300) + '...';
      message += `*📝 Description:*\n${shortDesc}\n\n`;
    }
    
    if (team.badges?.large) {
      message += `*🖼️ Logo:* ${team.badges.large}\n`;
    }
    
    reply(message);
  } catch (error) {
    console.error('Error searching team:', error);
    reply("❌ Error searching for team.");
  }
}

// Player Search
async function searchPlayer(query, { reply, kelvin, m }) {
  try {
    if (!query) return reply("❌ Please provide a player name. Example: `.playersearch Bukayo Saka`");
    
    const response = await fetch(`${BASE_API}/sport/playersearch?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    if (!data.status || !data.result || data.result.length === 0) {
      return reply(`❌ No player found for "${query}"`);
    }
    
    const player = data.result[0];
    let message = `*⚽ Player Information ⚽*\n\n`;
    message += `*👤 Name:* ${player.name}\n`;
    message += `*🏠 Team:* ${player.team || 'N/A'}\n`;
    message += `*🌍 Nationality:* ${player.nationality || 'N/A'}\n`;
    message += `*🎂 Born:* ${player.birthDate || 'N/A'}\n`;
    message += `*⚽ Position:* ${player.position || 'N/A'}\n`;
    message += `*📊 Status:* ${player.status || 'N/A'}\n\n`;
    
    // Send message first
    await reply(message);
    
    // Send photo if available
    if (player.thumbnail) {
      await kelvin.sendMessage(m.chat, {
        image: { url: player.thumbnail },
        caption: `🖼️ ${player.name}`
      }, { quoted: m });
    }
    
  } catch (error) {
    console.error('Error searching player:', error);
    reply("❌ Error searching for player.");
  }
}

async function searchVenue(query, { reply, kelvin, m }) {
  try {
    if (!query) return reply("*Please provide a venue name. Example: `.venuesearch Emirates*`");
    
    const response = await fetch(`${BASE_API}/sport/venuesearch?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    if (!data.status || !data.result || data.result.length === 0) {
      return reply(`❌ No venue found for "${query}"`);
    }
    
    const venue = data.result[0];
    let message = `*🏟️ Venue Information: ${venue.name} 🏟️*\n\n`;
    message += `*📍 Location:* ${venue.location || venue.country || 'N/A'}\n`;
    message += `*👥 Capacity:* ${venue.capacity?.toLocaleString() || 'N/A'}\n`;
    message += `*🏅 Sport:* ${venue.sport || 'N/A'}\n`;
    message += `*📅 Built:* ${venue.yearBuilt || 'N/A'}\n\n`;
    
    if (venue.description) {
      const shortDesc = venue.description.substring(0, 300) + '...';
      message += `*📝 Description:*\n${shortDesc}\n\n`;
    }
    
    // Send message first
    await reply(message);
    
    // Send image if available
    if (venue.media?.thumb) {
      await kelvin.sendMessage(m.chat, {
        image: { url: venue.media.thumb },
        caption: `🏟️ ${venue.name}`
      }, { quoted: m });
    }
    
  } catch (error) {
    console.error('Error searching venue:', error);
    reply("❌ Error searching for venue.");
  }
}

// Live Scores
async function getLiveScores({ reply }) {
  try {
    const response = await fetch(`${BASE_API}/livescore2`);
    const data = await response.json();
    
    if (!data.status || !data.result?.data?.list) {
      return reply("❌ No live scores available.");
    }
    
    const matches = data.result.data.list;
    if (matches.length === 0) {
      return reply("📊 No live matches at the moment.");
    }
    
    let message = `*🔴 LIVE SCORES ⚽*\n\n`;
    message += `*📊 Currently Live: ${matches.length} matches*\n\n`;
    
    matches.forEach((match, index) => {
      const statusEmoji = match.statusLive === 3 ? '✅' : '🔴';
      message += `*${index + 1}. ${match.team1?.name} vs ${match.team2?.name}*\n`;
      message += `   📊 Score: ${match.team1?.score || 0} - ${match.team2?.score || 0}\n`;
      message += `   🏆 League: ${match.league || 'N/A'}\n`;
      message += `   ${statusEmoji} Status: ${match.timeDesc || match.status || 'Live'}\n\n`;
    });
    
    reply(message);
  } catch (error) {
    console.error('Error fetching live scores:', error);
    reply("❌ Error fetching live scores.");
  }
}

// Football News
async function getFootballNews({ reply }) {
  try {
    const response = await fetch(`${BASE_API}/football/news`);
    const data = await response.json();
    
    if (!data.status || !data.result) {
      return reply("❌ No football news available.");
    }
    
    const news = data.result.news || data.result;
    if (!news || news.length === 0) {
      return reply("📰 No news articles found.");
    }
    
    let message = `*📰 Latest Football News ⚽*\n\n`;
    
    news.slice(0, 5).forEach((item, index) => {
      message += `*${index + 1}. ${item.title}*\n`;
      if (item.description) message += `📝 ${item.description.substring(0, 100)}...\n`;
      if (item.source) message += `📰 Source: ${item.source}\n`;
      if (item.url) message += `🔗 [Read More](${item.url})\n`;
      message += `\n`;
    });
    
    reply(message);
  } catch (error) {
    console.error('Error fetching football news:', error);
    reply("❌ Error fetching football news.");
  }
}

module.exports = [
  {
    command: ['eplstandings', 'plstandings', 'premierleaguestandings'],
    operate: async ({ m, reply }) => {
      await formatStandings('PL', 'Premier League', { m, reply });
    }
  },
  {
    command: ['clstandings', 'championsleague'],
    operate: async ({ m, reply }) => {
      await formatStandings('CL', 'UEFA Champions League', { m, reply });
    }
  },
  {
    command: ['laligastandings', 'laliga'],
    operate: async ({ m, reply }) => {
      await formatStandings('PD', 'La Liga', { m, reply });
    }
  },
  {
    command: ['bundesligastandings', 'bundesliga'],
    operate: async ({ m, reply }) => {
      await formatStandings('BL1', 'Bundesliga', { m, reply });
    }
  },
  {
    command: ['serieastandings', 'seriea'],
    operate: async ({ m, reply }) => {
      await formatStandings('SA', 'Serie A', { m, reply });
    }
  },
  {
    command: ['ligue1standings', 'ligue1'],
    operate: async ({ m, reply }) => {
      await formatStandings('FL1', 'Ligue 1', { m, reply });
    }
  },
  {
    command: ['elstandings', 'europaleague'],
    operate: async ({ m, reply }) => {
      await formatStandings('EL', 'Europa League', { m, reply });
    }
  },
  {
    command: ['eflstandings', 'championship'],
    operate: async ({ m, reply }) => {
      await formatStandings('ELC', 'EFL Championship', { m, reply });
    }
  },
  {
    command: ['wcstandings', 'worldcup'],
    operate: async ({ m, reply }) => {
      await formatStandings('WC', 'World Cup', { m, reply });
    }
  },
  {
    command: ['eurosstandings', 'eurostandings'],
    operate: async ({ m, reply }) => {
      await formatStandings('EUROS', 'Euros', { m, reply });
    }
  },
  {
    command: ['fifastandings', 'worldcupstandings'],
    operate: async ({ m, reply }) => {
      await formatStandings('FIFA', 'FIFA World Cup', { m, reply });
    }
  },
  {
    command: ['eplmatches', 'plmatches'],
    operate: async ({ m, reply }) => {
      await formatMatches('PL', 'Premier League', { m, reply });
    }
  },
  {
    command: ['clmatches', 'championsleaguematches'],
    operate: async ({ m, reply }) => {
      await formatMatches('CL', 'UEFA Champions League', { m, reply });
    }
  },
  {
    command: ['laligamatches', 'pdmatches'],
    operate: async ({ m, reply }) => {
      await formatMatches('PD', 'La Liga', { m, reply });
    }
  },
  {
    command: ['bundesligamatches', 'bl1matches'],
    operate: async ({ m, reply }) => {
      await formatMatches('BL1', 'Bundesliga', { m, reply });
    }
  },
  {
    command: ['serieamatches', 'samatches'],
    operate: async ({ m, reply }) => {
      await formatMatches('SA', 'Serie A', { m, reply });
    }
  },
  {
    command: ['ligue1matches', 'fl1matches'],
    operate: async ({ m, reply }) => {
      await formatMatches('FL1', 'Ligue 1', { m, reply });
    }
  },
  {
    command: ['elmatches', 'europaleaguematches'],
    operate: async ({ m, reply }) => {
      await formatMatches('EL', 'Europa League', { m, reply });
    }
  },
  {
    command: ['eflmatches', 'elcmatches'],
    operate: async ({ m, reply }) => {
      await formatMatches('ELC', 'EFL Championship', { m, reply });
    }
  },
  {
    command: ['wcmatches', 'worldcupmatches'],
    operate: async ({ m, reply }) => {
      await formatMatches('WC', 'World Cup', { m, reply });
    }
  },
  {
    command: ['euromatches', 'eurosmatches'],
    operate: async ({ m, reply }) => {
      await formatMatches('EUROS', 'Euros', { m, reply });
    }
  },
  {
    command: ['fifamatches', 'worldcupmatches'],
    operate: async ({ m, reply }) => {
      await formatMatches('FIFA', 'FIFA World Cup', { m, reply });
    }
  },
  {
    command: ['eplscorers', 'plscorers'],
    operate: async ({ m, reply }) => {
      await formatTopScorers('PL', 'Premier League', { m, reply });
    }
  },
  {
    command: ['clscorers', 'championsleaguescorers'],
    operate: async ({ m, reply }) => {
      await formatTopScorers('CL', 'UEFA Champions League', { m, reply });
    }
  },
  {
    command: ['laligascorers', 'pdscorers'],
    operate: async ({ m, reply }) => {
      await formatTopScorers('PD', 'La Liga', { m, reply });
    }
  },
  {
    command: ['bundesligascorers', 'bl1scorers'],
    operate: async ({ m, reply }) => {
      await formatTopScorers('BL1', 'Bundesliga', { m, reply });
    }
  },
  {
    command: ['serieascorers', 'sascorers'],
    operate: async ({ m, reply }) => {
      await formatTopScorers('SA', 'Serie A', { m, reply });
    }
  },
  {
    command: ['ligue1scorers', 'fl1scorers'],
    operate: async ({ m, reply }) => {
      await formatTopScorers('FL1', 'Ligue 1', { m, reply });
    }
  },
  {
    command: ['elscorers', 'europaleaguescorers'],
    operate: async ({ m, reply }) => {
      await formatTopScorers('EL', 'Europa League', { m, reply });
    }
  },
  {
    command: ['eflscorers', 'elcscorers'],
    operate: async ({ m, reply }) => {
      await formatTopScorers('ELC', 'EFL Championship', { m, reply });
    }
  },
  {
    command: ['wcscorers', 'worldcupscorers'],
    operate: async ({ m, reply }) => {
      await formatTopScorers('WC', 'World Cup', { m, reply });
    }
  },
  {
    command: ['euros scorers', 'euroscorers'],
    operate: async ({ m, reply }) => {
      await formatTopScorers('EUROS', 'Euros', { m, reply });
    }
  },
  {
    command: ['fifascorers', 'worldcupscorers'],
    operate: async ({ m, reply }) => {
      await formatTopScorers('FIFA', 'FIFA World Cup', { m, reply });
    }
  },
  {
    command: ['eplupcoming', 'plupcoming'],
    operate: async ({ m, reply }) => {
      await formatUpcomingMatches('PL', 'Premier League', { m, reply });
    }
  },
  {
    command: ['clupcoming', 'championsleagueupcoming'],
    operate: async ({ m, reply }) => {
      await formatUpcomingMatches('CL', 'UEFA Champions League', { m, reply });
    }
  },
  {
    command: ['laligaupcoming', 'pdupcoming'],
    operate: async ({ m, reply }) => {
      await formatUpcomingMatches('PD', 'La Liga', { m, reply });
    }
  },
  {
    command: ['bundesligaupcoming', 'bl1upcoming'],
    operate: async ({ m, reply }) => {
      await formatUpcomingMatches('BL1', 'Bundesliga', { m, reply });
    }
  },
  {
    command: ['serieaupcoming', 'saupcoming'],
    operate: async ({ m, reply }) => {
      await formatUpcomingMatches('SA', 'Serie A', { m, reply });
    }
  },
  {
    command: ['ligue1upcoming', 'fl1upcoming'],
    operate: async ({ m, reply }) => {
      await formatUpcomingMatches('FL1', 'Ligue 1', { m, reply });
    }
  },
  {
    command: ['elupcoming', 'europaleagueupcoming'],
    operate: async ({ m, reply }) => {
      await formatUpcomingMatches('EL', 'Europa League', { m, reply });
    }
  },
  {
    command: ['eflupcoming', 'elcupcoming'],
    operate: async ({ m, reply }) => {
      await formatUpcomingMatches('ELC', 'EFL Championship', { m, reply });
    }
  },
  {
    command: ['wcupcoming', 'worldcupupcoming'],
    operate: async ({ m, reply }) => {
      await formatUpcomingMatches('WC', 'World Cup', { m, reply });
    }
  },
  {
    command: ['eurosupcoming', 'euro upcoming'],
    operate: async ({ m, reply }) => {
      await formatUpcomingMatches('EUROS', 'Euros', { m, reply });
    }
  },
  {
    command: ['fifaupcoming', 'worldcupupcoming'],
    operate: async ({ m, reply }) => {
      await formatUpcomingMatches('FIFA', 'FIFA World Cup', { m, reply });
    }
  },
  {
    command: ['wweevents', 'wrestlingevents'],
    operate: async ({ m, reply }) => {
      await getWrestlingEvents({ reply });
    }
  },
  {
    command: ['wwenews', 'wrestlingnews'],
    operate: async ({ m, reply }) => {
      await getWWENews({ reply });
    }
  },
  {
    command: ['wweschedule', 'wrestlingschedule'],
    operate: async ({ m, reply }) => {
      await getWWESchedule({ reply });
    }
  },
  {
    command: ['teamsearch', 'teaminfo', 'clubinfo'],
    operate: async ({ m, reply, args }) => {
      const query = args.join(' ');
      await searchTeam(query, { reply });
    }
  },
  {
  command: ['playersearch', 'playerinfo', 'player'],
  operate: async ({ m, reply, kelvin, args }) => {  
    const query = args.join(' ');
    await searchPlayer(query, { reply, kelvin, m });
  }
},
  {
  command: ['venuesearch', 'stadium', 'venue'],
  operate: async ({ m, reply, kelvin, args }) => {
    const query = args.join(' ');
    await searchVenue(query, { reply, kelvin, m }); 
  }
},
  {
    command: ['livescores', 'livescore', 'lives'],
    operate: async ({ m, reply }) => {
      await getLiveScores({ reply });
    }
  },
  {
    command: ['footballnews', 'soccernews', 'fnews'],
    operate: async ({ m, reply }) => {
      await getFootballNews({ reply });
    }
  },
  {
    command: ['gameevents', 'ge', 'searchmatch', 'findmatch'],
    operate: async ({ m, reply, args }) => {
      const query = args.join(' ');
      await searchGameEvents(query, { reply });
    }
  },
  {
    command: ['matchdetails', 'md', 'matchinfo'],
    operate: async ({ m, reply, args }) => {
      const matchId = args[0];
      await getMatchDetails(matchId, { reply });
    }
  },
  {
    command: ['h2h', 'head2head', 'headtohead', 'vs'],
    operate: async ({ m, reply, args }) => {
      if (args.length < 2) {
        return reply("*Please provide both team names. Example: `.h2h Arsenal Chelsea*`");
      }
      const team1 = args[0];
      const team2 = args.slice(1).join(' ');
      await getHeadToHead(team1, team2, { reply });
    }
  },
  {
    command: ['todaysmatches', 'today', 'matches today'],
    operate: async ({ m, reply }) => {
      await getTodaysMatches({ reply });
    }
  }
];
