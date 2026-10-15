/* Currency plugin — Malvin API (global.wow + global.KevinApi)
 *   GET {global.wow}info/currency?from=USD&to=UGX&amount=1&apikey=KEY
 * Commands: currency | convert | currencymenu
 * The file name is the menu category, so these show up under "CURRENCY MENU".
 */
const axios = require('axios');
const { apiBase } = require('../start/lib/malvin');

const POPULAR = [
  ['USD', 'US Dollar'], ['EUR', 'Euro'], ['GBP', 'British Pound'], ['UGX', 'Ugandan Shilling'],
  ['KES', 'Kenyan Shilling'], ['TZS', 'Tanzanian Shilling'], ['RWF', 'Rwandan Franc'],
  ['NGN', 'Nigerian Naira'], ['GHS', 'Ghanaian Cedi'], ['ZAR', 'South African Rand'],
  ['INR', 'Indian Rupee'], ['CNY', 'Chinese Yuan'], ['JPY', 'Japanese Yen'],
  ['AED', 'UAE Dirham'], ['SAR', 'Saudi Riyal'], ['CAD', 'Canadian Dollar'], ['AUD', 'Australian Dollar']
];

const FILLER = new Set(['to', 'in', 'into', 'as', '=', '->', '=>', '>']);

function parseAmount(tok) {
  if (tok === undefined || tok === null) return null;
  let t = String(tok).trim().toLowerCase().replace(/,/g, '');
  let mult = 1;
  const suffix = t.match(/^([\d.]+)([kmb])$/);
  if (suffix) { t = suffix[1]; mult = { k: 1e3, m: 1e6, b: 1e9 }[suffix[2]]; }
  if (!/^(\d+\.?\d*|\.\d+)$/.test(t)) return null;
  const n = parseFloat(t) * mult;
  return Number.isFinite(n) && n > 0 ? n : null;
}

// Understands: "USD UGX", "100 usd ugx", "100 usd to ugx kes", "usd/ugx 50", "100usd ugx"
function parseInput(args) {
  const raw = args.join(' ').replace(/[\/]|->|=>/g, ' ');
  const tokens = raw.split(/\s+/).filter(Boolean).flatMap(t => {
    const glued = t.match(/^([\d.,]+[kmb]?)([a-z]{3})$/i);
    return glued ? [glued[1], glued[2]] : [t];
  });
  let amount = null;
  const codes = [];
  for (const t of tokens) {
    if (FILLER.has(t.toLowerCase())) continue;
    if (/^[a-z]{3}$/i.test(t)) { codes.push(t.toUpperCase()); continue; }
    const n = parseAmount(t);
    if (n !== null && amount === null) amount = n;
  }
  return { amount: amount === null ? 1 : amount, from: codes[0], targets: [...new Set(codes.slice(1))].slice(0, 5) };
}

function fmt(n, maxDec) {
  const v = Number(n);
  if (!Number.isFinite(v)) return String(n);
  const dec = maxDec !== undefined ? maxDec : (Math.abs(v) >= 1 ? 2 : 6);
  return v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: dec });
}

async function lookup(from, to, amount) {
  try {
    const res = await axios.get(`${apiBase()}info/currency`, {
      params: { from, to, amount, apikey: global.KevinApi },
      timeout: 20000
    });
    const d = res.data;
    if (d?.status && d?.data && d.data.rate !== undefined) return d.data;
    throw new Error(d?.message || d?.error || 'No rate returned');
  } catch (err) {
    const apiMsg = err?.response?.data?.message || err?.response?.data?.error;
    throw new Error(apiMsg || err.message);
  }
}

function usage(prefix, command) {
  return `💱 *Currency*\n\n` +
    `Usage: *${prefix}${command} <amount> <from> <to>*\n` +
    `Examples:\n` +
    `• ${prefix}${command} 100 USD UGX\n` +
    `• ${prefix}${command} usd kes\n` +
    `• ${prefix}${command} 50 eur to ugx kes tzs\n\n` +
    `See all codes: *${prefix}currencymenu*`;
}

async function run({ reply, args, prefix, command }, mode) {
  const { amount, from, targets } = parseInput(args);
  if (!from || targets.length === 0) return reply(usage(prefix, command));

  const results = await Promise.allSettled(targets.map(to => lookup(from, to, amount)));
  const ok = results.filter(r => r.status === 'fulfilled').map(r => r.value);
  const failed = results
    .map((r, i) => ({ r, to: targets[i] }))
    .filter(x => x.r.status === 'rejected');

  if (!ok.length) {
    const why = failed[0]?.r?.reason?.message || 'Unknown error';
    return reply(`❌ Couldn't get that rate.\n_${why}_\n\nCheck the currency codes (e.g. USD, UGX, KES) and try again.`);
  }

  let out = mode === 'convert' ? `💱 *Currency Convert*\n\n` : `💱 *Exchange Rate*\n\n`;
  for (const d of ok) {
    const f = d.from || from, t = d.to;
    if (mode === 'convert' || Number(d.amount) !== 1) {
      out += `💰 ${fmt(d.amount, 4)} ${f} = *${fmt(d.converted)} ${t}*\n`;
    }
    out += `📈 1 ${f} = ${fmt(d.rate, 4)} ${t}\n\n`;
  }
  const upd = ok[0].updated_at;
  if (upd) out += `🕒 Updated: ${upd}\n`;
  if (failed.length) out += `⚠️ Failed: ${failed.map(x => x.to).join(', ')}\n`;
  return reply(out.trim());
}

module.exports = [
  {
    command: ['currency', 'rate', 'fx', 'exchange'],
    operate: async (ctx) => run(ctx, 'rate')
  },
  {
    command: ['convert', 'cconvert', 'curconvert'],
    operate: async (ctx) => run(ctx, 'convert')
  },
  {
    command: ['currencymenu', 'currencies', 'fxmenu'],
    operate: async ({ reply, prefix }) => {
      const p = prefix || '.';
      let msg = `┏⟡  *CURRENCY MENU* ⟡\n`;
      msg += `┃⌬ ${p}currency <from> <to> [amount]\n`;
      msg += `┃⌬ ${p}convert <amount> <from> <to> [more…]\n`;
      msg += `┃⌬ ${p}currencymenu\n`;
      msg += `┗━⟡\n\n`;
      msg += `*Examples*\n`;
      msg += `• ${p}currency USD UGX\n`;
      msg += `• ${p}convert 100 USD UGX\n`;
      msg += `• ${p}convert 50 EUR to UGX KES TZS _(up to 5 targets)_\n`;
      msg += `• ${p}convert 2k gbp ngn _(k = thousand, m = million)_\n\n`;
      msg += `*Popular codes*\n`;
      msg += POPULAR.map(([c, n]) => `${c} — ${n}`).join('\n');
      msg += `\n\n_Any 3-letter currency code works._`;
      return reply(msg);
    }
  }
];
