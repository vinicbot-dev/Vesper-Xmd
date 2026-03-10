/* Kelvin Tech - Complete Sports Plugin with Game Events API */
/* UPDATED: All API endpoints now use https://apiskeith.top */

const axios = require("axios");
const fetch = require('node-fetch');

// Base API URL - Using the WORKING domain
const BASE_API = "https://apiskeith.top";
const GAME_EVENTS_API = "https://apiskeith.top/sport/gameevents?q=";

// ==================== EXISTING FUNCTIONS - UPDATED WITH NEW DOMAIN ====================

// Standings function - UPDATED URL
async function formatStandings(leagueCode, leagueName, { m, reply }) {
  try {
    const apiUrl = `${BASE_API}/football?code=${leagueCode}&query=standings`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.result || !data.result.standings) {
      return reply(`❌ Failed to fetch ${leagueName} standings. Please try again later.`);
    }

    const standings = data.result.standings;
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

// Matches function - UPDATED URL
async function formatMatches(leagueCode, leagueName, { m, reply }) {
  try {
    const apiUrl = `${BASE_API}/football?code=${leagueCode}&query=matches`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.result?.matches?.length) {
      return reply(`❌ No ${leagueName} matches found or failed to fetch data.`);
    }

    const { liveMatches, finishedMatches, otherMatches } = categorizeMatches(data.result.matches);

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

// [The categorizeMatches, isLiveMatch, buildLiveMatchesSection, 
//  buildFinishedMatchesSection, and buildOtherMatchesSection functions
//  remain exactly the same as in your original file - no changes needed]

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

// Top Scorers function - UPDATED URL
async function formatTopScorers(leagueCode, leagueName, { m, reply }) {
  try {
    const apiUrl = `${BASE_API}/football?code=${leagueCode}&query=scorers`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.result || !data.result.topScorers) {
      return reply(`❌ No ${leagueName} top scorers data found.`);
    }

    const scorers = data.result.topScorers;
    let message = `*⚽ ${leagueName} Top Scorers ⚽*\n\n`;
    message += '🏆 *Golden Boot Race*\n\n';

    scorers.forEach(player => {
      message += `*${player.rank}.* ${player.player} (${player.team})\n`;
      message += `   ⚽ Goals: *${player.goals}*`;
      message += ` | 🎯 Assists: ${player.assists}`;
      message += ` | ⏏️ Penalties: ${player.penalties}\n\n`;
    });

    reply(message);
  } catch (error) {
    console.error(`Error fetching ${leagueName} top scorers:`, error);
    reply(`❌ Error fetching ${leagueName} top scorers. Please try again later.`);
  }
}

// Upcoming Matches function - UPDATED URL
async function formatUpcomingMatches(leagueCode, leagueName, { m, reply }) {
  try {
    const apiUrl = `${BASE_API}/football?code=${leagueCode}&query=upcoming`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.result || !data.result.upcomingMatches || data.result.upcomingMatches.length === 0) {
      return reply(`❌ No upcoming ${leagueName} matches found.`);
    }

    const matches = data.result.upcomingMatches;
    let message = `*📅 Upcoming ${leagueName} Matches ⚽*\n\n`;

    const matchesByMatchday = {};
    matches.forEach(match => {
      if (!matchesByMatchday[match.matchday]) {
        matchesByMatchday[match.matchday] = [];
      }
      matchesByMatchday[match.matchday].push(match);
    });

    const sortedMatchdays = Object.keys(matchesByMatchday).sort((a, b) => a - b);

    sortedMatchdays.forEach(matchday => {
      message += `*🗓️ Matchday ${matchday}:*\n`;
      
      matchesByMatchday[matchday].forEach(match => {
        const matchDate = new Date(match.date);
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

// Wrestling functions (these use global variables, so they remain unchanged)
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

// ==================== NEW GAME EVENTS FUNCTIONS ====================
// [All game events functions (formatMatchDetails, searchGameEvents, getMatchDetails,
//  getLiveMatches, getMatchesByLeague, getHeadToHead, getTodaysMatches) 
//  remain exactly the same as in your original file - no changes needed]

// Helper function to format match data
function formatMatchDetails(match) {
  const homeScore = match.teams?.home?.score ?? 0;
  const awayScore = match.teams?.away?.score ?? 0;
  
  let matchDisplay = '';
  
  // Match header with emoji based on status
  if (match.status === 'Match Finished') {
    matchDisplay += `✅ *${match.match}*\n`;
  } else if (match.status?.toLowerCase().includes('live')) {
    matchDisplay += `🔴 *LIVE: ${match.match}*\n`;
  } else {
    matchDisplay += `⏳ *${match.match}*\n`;
  }
  
  // Teams and score
  matchDisplay += `┌────────────────\n`;
  matchDisplay += `│ 🏠 *Home:* ${match.teams?.home?.name || 'Unknown'}\n`;
  matchDisplay += `│ 🚌 *Away:* ${match.teams?.away?.name || 'Unknown'}\n`;
  matchDisplay += `│ 📊 *Score:* ${homeScore} - ${awayScore}\n`;
  matchDisplay += `└────────────────\n`;
  
  // Competition details
  matchDisplay += `│ 🏆 *Competition:* ${match.league?.name || 'Unknown'}\n`;
  matchDisplay += `│ 📅 *Season:* ${match.season || 'N/A'}\n`;
  matchDisplay += `│ 🔄 *Round:* ${match.round || 'N/A'}\n`;
  
  // Date and time
  if (match.dateTime) {
    const matchDate = new Date(match.dateTime.timestamp || match.dateTime.date);
    const formattedDate = matchDate.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    matchDisplay += `│ ⏰ *Date:* ${formattedDate}\n`;
  }
  
  // Venue
  if (match.venue?.name) {
    matchDisplay += `│ 🏟️ *Venue:* ${match.venue.name}`;
    if (match.venue.city) matchDisplay += `, ${match.venue.city}`;
    if (match.venue.country) matchDisplay += `, ${match.venue.country}`;
    matchDisplay += `\n`;
  }
  
  // Status
  matchDisplay += `│ ℹ️ *Status:* ${match.status || 'Scheduled'}\n`;
  
  // Media links if available
  if (match.media?.video) {
    matchDisplay += `│ 📺 *Highlights:* ${match.media.video}\n`;
  }
  
  matchDisplay += `─────────────────\n\n`;
  
  return matchDisplay;
}

// Search game events
async function searchGameEvents(query, { reply }) {
  try {
    if (!query || query.trim() === '') {
      return reply("❌ Please provide a search query. Example: `.gameevents Arsenal vs Chelsea`");
    }

    const encodedQuery = encodeURIComponent(query.trim());
    const apiUrl = `${GAME_EVENTS_API}${encodedQuery}`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.status || !data.result || data.result.length === 0) {
      return reply(`❌ No events found for "${query}". Try a different search term.`);
    }

    const events = data.result;
    let message = `*⚽ Game Events Search Results ⚽*\n\n`;
    message += `*🔍 Search Query:* "${query}"\n`;
    message += `*📊 Total Results:* ${events.length}\n\n`;
    message += `─────────────────\n\n`;

    // Display each match
    events.forEach((match, index) => {
      message += `*${index + 1}. ${match.match}*\n`;
      
      // Teams and score
      const homeTeam = match.teams?.home?.name || 'Unknown';
      const awayTeam = match.teams?.away?.name || 'Unknown';
      const homeScore = match.teams?.home?.score ?? '?';
      const awayScore = match.teams?.away?.score ?? '?';
      
      message += `   🏠 ${homeTeam} vs 🚌 ${awayTeam}\n`;
      message += `   📊 Score: ${homeScore} - ${awayScore}\n`;
      
      // League and season
      message += `   🏆 ${match.league?.name || 'Unknown League'}`;
      if (match.season) message += ` (${match.season})`;
      message += `\n`;
      
      // Date
      if (match.dateTime?.date) {
        const date = new Date(match.dateTime.date);
        message += `   📅 ${date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })}`;
        if (match.dateTime.time) {
          message += ` at ${match.dateTime.time.substring(0, 5)}`;
        }
        message += `\n`;
      }
      
      // Status
      const statusEmoji = match.status === 'Match Finished' ? '✅' : 
                         match.status?.toLowerCase().includes('live') ? '🔴' : '⏳';
      message += `   ${statusEmoji} ${match.status || 'Scheduled'}\n`;
      
      // Venue
      if (match.venue?.name) {
        message += `   🏟️ ${match.venue.name}`;
        if (match.venue.city) message += `, ${match.venue.city}`;
        message += `\n`;
      }
      
      // Video highlights
      if (match.media?.video) {
        message += `   📺 [Match Highlights](${match.media.video})\n`;
      }
      
      message += `\n`;
      if (index < events.length - 1) message += `─────────────────\n\n`;
    });

    // Add footer with useful commands
    message += `\n*📌 Useful Commands:*\n`;
    message += `• Get match details: .matchdetails [match_id]\n`;
    message += `• Example: .matchdetails ${events[0]?.id || '2401588'}\n`;

    reply(message);
  } catch (error) {
    console.error('Error searching game events:', error);
    reply("❌ Error fetching game events. Please try again later.");
  }
}

// Get match details by ID
async function getMatchDetails(matchId, { reply }) {
  try {
    if (!matchId) {
      return reply("❌ Please provide a match ID. Example: `.matchdetails 2401588`");
    }

    // Search for the match using a generic query and find by ID
    const response = await fetch(`${GAME_EVENTS_API}${encodeURIComponent('vs')}`);
    const data = await response.json();

    if (!data.status || !data.result) {
      return reply("❌ Failed to fetch match details.");
    }

    const match = data.result.find(m => m.id === matchId);
    
    if (!match) {
      return reply(`❌ Match with ID ${matchId} not found.`);
    }

    let message = `*⚽ Detailed Match Information ⚽*\n\n`;
    message += formatMatchDetails(match);

    // Add team badges if available
    if (match.teams?.home?.badge || match.teams?.away?.badge) {
      message += `\n*🏷️ Team Badges:*\n`;
      if (match.teams.home.badge) {
        message += `🏠 Home: ${match.teams.home.badge}\n`;
      }
      if (match.teams.away.badge) {
        message += `🚌 Away: ${match.teams.away.badge}\n`;
      }
    }

    // League badge
    if (match.league?.badge) {
      message += `\n*🏆 League Badge:*\n${match.league.badge}\n`;
    }

    // Media gallery
    if (match.media) {
      message += `\n*📸 Media Gallery:*\n`;
      if (match.media.poster) message += `🎬 Poster: ${match.media.poster}\n`;
      if (match.media.thumb) message += `🖼️ Thumbnail: ${match.media.thumb}\n`;
      if (match.media.banner) message += `📋 Banner: ${match.media.banner}\n`;
      if (match.media.square) message += `🔲 Square: ${match.media.square}\n`;
    }

    reply(message);
  } catch (error) {
    console.error('Error fetching match details:', error);
    reply("❌ Error fetching match details. Please try again later.");
  }
}

// Get live matches
async function getLiveMatches({ reply }) {
  try {
    const liveQueries = ['live', 'ongoing', 'in progress'];
    let allMatches = [];
    
    for (const query of liveQueries) {
      const response = await fetch(`${GAME_EVENTS_API}${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.status && data.result) {
        // Filter matches that are actually live
        const liveMatches = data.result.filter(match => 
          match.status?.toLowerCase().includes('live') ||
          match.status?.toLowerCase().includes('ongoing') ||
          match.status?.toLowerCase().includes('in progress')
        );
        allMatches = [...allMatches, ...liveMatches];
      }
    }

    // Remove duplicates based on match ID
    const uniqueMatches = Array.from(new Map(allMatches.map(m => [m.id, m])).values());

    if (uniqueMatches.length === 0) {
      return reply("❌ No live matches found at the moment.");
    }

    let message = `*🔴 LIVE MATCHES ⚽*\n\n`;
    message += `*📊 Currently Playing: ${uniqueMatches.length}*\n\n`;

    uniqueMatches.forEach((match, index) => {
      message += `*${index + 1}. ${match.match}*\n`;
      message += `   🏆 ${match.league?.name || 'Unknown League'}\n`;
      message += `   📊 Score: ${match.teams?.home?.score || 0} - ${match.teams?.away?.score || 0}\n`;
      if (match.dateTime?.time) {
        message += `   ⏱️ Minute: ${match.dateTime.time}\n`;
      }
      message += `\n`;
    });

    message += `\n_Use .gameevents [team1 vs team2] to search for specific matches_`;

    reply(message);
  } catch (error) {
    console.error('Error fetching live matches:', error);
    reply("❌ Error fetching live matches. Please try again later.");
  }
}

// Get matches by league
async function getMatchesByLeague(leagueName, { reply }) {
  try {
    if (!leagueName) {
      return reply("❌ Please provide a league name. Example: `.leaguematches Premier League`");
    }

    const response = await fetch(`${GAME_EVENTS_API}${encodeURIComponent(leagueName)}`);
    const data = await response.json();

    if (!data.status || !data.result || data.result.length === 0) {
      return reply(`❌ No matches found for league: ${leagueName}`);
    }

    // Group matches by competition
    const matchesByLeague = {};
    data.result.forEach(match => {
      const leagueId = match.league?.id || 'unknown';
      if (!matchesByLeague[leagueId]) {
        matchesByLeague[leagueId] = {
          name: match.league?.name || 'Unknown League',
          badge: match.league?.badge,
          matches: []
        };
      }
      matchesByLeague[leagueId].matches.push(match);
    });

    let message = `*⚽ League Matches ⚽*\n\n`;
    message += `*🔍 League:* ${leagueName}\n`;
    message += `*📊 Total Matches:* ${data.result.length}\n\n`;

    Object.values(matchesByLeague).forEach(league => {
      message += `*🏆 ${league.name}*\n`;
      if (league.badge) {
        message += `🏷️ [League Badge](${league.badge})\n`;
      }
      
      league.matches.forEach((match, idx) => {
        message += `\n  ${idx + 1}. ${match.match}\n`;
        message += `     📊 ${match.teams?.home?.score || '?'} - ${match.teams?.away?.score || '?'}\n`;
        message += `     📅 ${match.dateTime?.date || 'Date TBD'}\n`;
        message += `     ℹ️ ${match.status || 'Scheduled'}\n`;
      });
      message += `\n─────────────────\n\n`;
    });

    reply(message);
  } catch (error) {
    console.error('Error fetching league matches:', error);
    reply("❌ Error fetching league matches. Please try again later.");
  }
}

// Get head-to-head matches
async function getHeadToHead(team1, team2, { reply }) {
  try {
    if (!team1 || !team2) {
      return reply("❌ Please provide both team names. Example: `.h2h Arsenal Chelsea`");
    }

    const query = `${team1} vs ${team2}`;
    const response = await fetch(`${GAME_EVENTS_API}${encodeURIComponent(query)}`);
    const data = await response.json();

    if (!data.status || !data.result || data.result.length === 0) {
      return reply(`❌ No head-to-head matches found between ${team1} and ${team2}`);
    }

    const matches = data.result;
    let message = `*⚽ Head-to-Head: ${team1} vs ${team2} ⚽*\n\n`;
    message += `*📊 Total Meetings:* ${matches.length}\n\n`;

    // Calculate statistics
    let team1Wins = 0, team2Wins = 0, draws = 0;
    let team1Goals = 0, team2Goals = 0;

    matches.forEach(match => {
      const homeScore = match.teams?.home?.score || 0;
      const awayScore = match.teams?.away?.score || 0;
      
      // Determine winner based on home/away
      const homeTeam = match.teams?.home?.name?.toLowerCase() || '';
      const awayTeam = match.teams?.away?.name?.toLowerCase() || '';
      
      if (homeTeam.includes(team1.toLowerCase()) || awayTeam.includes(team2.toLowerCase())) {
        // Team1 is home or Team2 is away
        if (homeScore > awayScore) team1Wins++;
        else if (awayScore > homeScore) team2Wins++;
        else draws++;
        
        team1Goals += homeScore;
        team2Goals += awayScore;
      } else {
        // Team2 is home or Team1 is away
        if (awayScore > homeScore) team1Wins++;
        else if (homeScore > awayScore) team2Wins++;
        else draws++;
        
        team1Goals += awayScore;
        team2Goals += homeScore;
      }
    });

    message += `*📈 Statistics:*\n`;
    message += `   🏠 ${team1}: ${team1Wins} wins (${Math.round(team1Wins/matches.length*100)}%)\n`;
    message += `   🚌 ${team2}: ${team2Wins} wins (${Math.round(team2Wins/matches.length*100)}%)\n`;
    message += `   ⚖️ Draws: ${draws} (${Math.round(draws/matches.length*100)}%)\n`;
    message += `   ⚽ Goals: ${team1} ${team1Goals} - ${team2Goals} ${team2}\n\n`;
    message += `─────────────────\n\n`;

    // Recent matches
    message += `*📅 Recent Encounters:*\n\n`;
    matches.slice(0, 5).forEach((match, index) => {
      message += `${index + 1}. ${match.match}\n`;
      message += `   📊 ${match.teams?.home?.score || 0} - ${match.teams?.away?.score || 0}\n`;
      message += `   🏆 ${match.league?.name || 'Unknown'}\n`;
      message += `   📅 ${match.dateTime?.date || 'Date TBD'}\n`;
      if (match.media?.video) {
        message += `   📺 [Highlights](${match.media.video})\n`;
      }
      message += `\n`;
    });

    reply(message);
  } catch (error) {
    console.error('Error fetching head-to-head:', error);
    reply("❌ Error fetching head-to-head data. Please try again later.");
  }
}

// Get today's matches
async function getTodaysMatches({ reply }) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Search for today's date in matches
    const response = await fetch(`${GAME_EVENTS_API}${today}`);
    const data = await response.json();
    
    if (!data.status || !data.result || data.result.length === 0) {
      return reply("❌ No matches found for today.");
    }

    // Filter matches happening today
    const todaysMatches = data.result.filter(match => 
      match.dateTime?.date === today || 
      new Date(match.dateTime?.timestamp || match.dateTime?.date).toISOString().split('T')[0] === today
    );

    if (todaysMatches.length === 0) {
      return reply("❌ No matches scheduled for today.");
    }

    let message = `*📅 Today's Matches (${today}) ⚽*\n\n`;
    
    // Group by competition
    const byCompetition = {};
    todaysMatches.forEach(match => {
      const comp = match.league?.name || 'Other';
      if (!byCompetition[comp]) byCompetition[comp] = [];
      byCompetition[comp].push(match);
    });

    Object.entries(byCompetition).forEach(([competition, matches]) => {
      message += `*🏆 ${competition}*\n`;
      matches.forEach(match => {
        message += `   • ${match.match}`;
        if (match.status !== 'Scheduled') {
          message += ` (${match.teams?.home?.score || 0}-${match.teams?.away?.score || 0})`;
        }
        message += `\n`;
        if (match.dateTime?.time) {
          message += `     ⏰ ${match.dateTime.time.substring(0, 5)}\n`;
        }
      });
      message += `\n`;
    });

    reply(message);
  } catch (error) {
    console.error('Error fetching today\'s matches:', error);
    reply("❌ Error fetching today's matches. Please try again later.");
  }
}

// ==================== EXPORT ALL COMMANDS ====================

module.exports = [
  // ===== EXISTING FOOTBALL COMMANDS (STANDINGS) =====
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

  // ===== EXISTING FOOTBALL COMMANDS (MATCHES) =====
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

  // ===== EXISTING FOOTBALL COMMANDS (TOP SCORERS) =====
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

  // ===== EXISTING FOOTBALL COMMANDS (UPCOMING MATCHES) =====
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

  // ===== EXISTING WRESTLING COMMANDS =====
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

  // ===== NEW GAME EVENTS COMMANDS =====
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
    command: ['livematches', 'live', 'nowplaying'],
    operate: async ({ m, reply }) => {
      await getLiveMatches({ reply });
    }
  },
  {
    command: ['leaguematches', 'league', 'competition'],
    operate: async ({ m, reply, args }) => {
      const leagueName = args.join(' ');
      await getMatchesByLeague(leagueName, { reply });
    }
  },
  {
    command: ['h2h', 'head2head', 'headtohead', 'vs'],
    operate: async ({ m, reply, args }) => {
      if (args.length < 2) {
        return reply("❌ Please provide both team names. Example: `.h2h Arsenal Chelsea`");
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