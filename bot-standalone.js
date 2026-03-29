#!/usr/bin/env node
/**
 * Scam Academy — Telegram Bot
 * Integrates with training engine for adaptive difficulty, stats, achievements
 *
 * Requires TELEGRAM_BOT_TOKEN env var.
 */

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) {
  console.error('Missing TELEGRAM_BOT_TOKEN env var');
  process.exit(1);
}

const TelegramBot = require('node-telegram-bot-api');
const { getNextSimulation, SIMULATIONS } = require('./simulations');
const { recordResponse, getUserStats, getUser, ACHIEVEMENTS } = require('./training');

const bot = new TelegramBot(TOKEN, { polling: true });
console.log('🎓 Scam Academy bot started');

// Track active simulations per chat
const activeSims = {};

// --- Helpers ---

const SURFACE_EMOJI = { email: '📧', sms: '📱', chat: '💬', phone: '📞', social: '🐦', popup: '💻' };
const DIFF_EMOJI = { beginner: '🟢', intermediate: '🟡', advanced: '🔴' };

function formatSim(sim) {
  let text = (SURFACE_EMOJI[sim.surface] || '📨') + ' SCAM ACADEMY\n';
  text += (DIFF_EMOJI[sim.difficulty] || '⚪') + ' ' + sim.difficulty + ' | ' + sim.category.replace('_', ' ') + '\n\n';
  if (sim.subject) text += 'Subject: ' + sim.subject + '\n\n';
  text += sim.body + '\n\n';
  text += 'Is this a scam?\n✅ /pass — I spotted it\n❌ /fail — I fell for it';
  return text;
}

function getAdaptiveSim(userId) {
  const user = getUser(userId);
  // Use adaptive selection if user has history
  if (user.completed.length > 0) {
    return getNextSimulation(user);
  }
  // First time: random beginner-friendly sim
  const keys = Object.keys(SIMULATIONS);
  const id = keys[Math.floor(Math.random() * keys.length)];
  return { id, ...SIMULATIONS[id] };
}

function awardAchievementBadge(achievementId) {
  const a = ACHIEVEMENTS.find(x => x.id === achievementId);
  return a ? a.name : null;
}

// --- Commands ---

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id,
    '🎓 Welcome to Scam Academy!\n\n' +
    'Scammers are getting smarter. Reading about scams isn\'t enough — you need to practice spotting them.\n\n' +
    'I\'ll send you realistic scam simulations. You decide: scam or legit?\n\n' +
    '🧠 Adaptive difficulty — gets harder as you improve\n' +
    '🔥 Streak tracking — keep your streak alive\n' +
    '🏆 Achievements — earn badges as you learn\n' +
    '📊 Stats — track your progress over time\n\n' +
    '/train — Get a simulation\n' +
    '/stats — Your progress\n' +
    '/help — All commands\n\n' +
    '🧪 Free while in beta!'
  );
});

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id,
    '🎓 Scam Academy Commands\n\n' +
    '/train — Get a random simulation (adaptive)\n' +
    '/train phishing — Phishing emails\n' +
    '/train crypto — Crypto scams\n' +
    '/train romance — Romance scams\n' +
    '/train prize — Prize/lottery scams\n' +
    '/train grandparent — Grandparent scam\n' +
    '/train job — Job scams\n' +
    '/train tech — Tech support scams\n' +
    '/train tax — Tax/IRS scams\n' +
    '/train rental — Rental scams\n\n' +
    'After a simulation:\n' +
    '✅ /pass — I spotted the scam\n' +
    '❌ /fail — I fell for it\n\n' +
    '/stats — Your progress & achievements\n' +
    '/categories — List all training categories'
  );
});

bot.onText(/\/train(.*)/, (msg, match) => {
  const type = (match[1] || '').trim().toLowerCase();
  const userId = String(msg.chat.id);

  // Map shorthand to category
  const categoryMap = {
    phishing: 'phishing',
    crypto: 'crypto',
    romance: 'romance',
    prize: 'prize',
    grandparent: 'grandparent',
    job: 'job',
    jobs: 'job',
    tech: 'tech_support',
    techsupport: 'tech_support',
    tax: 'tax',
    irs: 'tax',
    rental: 'rental'
  };

  let sim;
  if (type && categoryMap[type]) {
    const user = getUser(userId);
    sim = getNextSimulation({
      ...user,
      // Override: force this category
      failedCategories: [categoryMap[type]]
    });
    // If adaptive returns wrong category, do direct selection
    if (!sim || sim.category !== categoryMap[type]) {
      const entries = Object.entries(SIMULATIONS)
        .filter(([, s]) => s.category === categoryMap[type])
        .filter(([id]) => !user.completed.map(c => c.id).includes(id));
      if (entries.length > 0) {
        const [id, s] = entries[Math.floor(Math.random() * entries.length)];
        sim = { id, ...s };
      }
    }
  } else {
    sim = getAdaptiveSim(userId);
  }

  if (!sim) {
    return bot.sendMessage(msg.chat.id,
      '🎓 You\'ve completed all simulations in this category!\n\nMore coming soon. Try /train for a different one.'
    );
  }

  activeSims[userId] = sim;
  bot.sendMessage(msg.chat.id, formatSim(sim));
});

bot.onText(/\/pass/, (msg) => {
  const userId = String(msg.chat.id);
  if (!activeSims[userId]) return bot.sendMessage(msg.chat.id, 'Use /train first!');

  const sim = activeSims[userId];
  const result = recordResponse(userId, sim.id, true);
  delete activeSims[userId];

  let text = '✅ Correct! You spotted the scam!\n\n';
  text += '📊 +' + (10 + result.streak * 2) + ' points';
  if (result.streak > 1) text += ' (streak x' + result.streak + '!)';
  text += '\n🎯 Pass rate: ' + result.passRate + '%';
  text += '\n📈 Level: ' + result.skillLevel + '\n';

  // Check for new achievements
  const user = getUser(userId);
  const prevAchievements = user.achievements.slice(0, -1); // rough check
  if (user.achievements.length > 0) {
    const latest = user.achievements[user.achievements.length - 1];
    const badge = awardAchievementBadge(latest);
    if (badge) text += '\n🏅 Achievement unlocked: ' + badge;
  }

  text += '\n\nUse /train for another.';
  bot.sendMessage(msg.chat.id, text);
});

bot.onText(/\/fail/, (msg) => {
  const userId = String(msg.chat.id);
  if (!activeSims[userId]) return bot.sendMessage(msg.chat.id, 'Use /train first!');

  const sim = activeSims[userId];
  const result = recordResponse(userId, sim.id, false);
  delete activeSims[userId];

  let text = '❌ You fell for it — but now you know!\n\n';
  text += '💡 ' + sim.lesson + '\n\n';
  text += '🚩 Red flags:\n' + sim.redFlags.map(f => '  • ' + f).join('\n');
  text += '\n\n🎯 Correct action: ' + sim.correctAction;
  text += '\n📊 Pass rate: ' + result.passRate + '%';

  if (result.weakCategories && result.weakCategories.length > 0) {
    text += '\n💪 Focus areas: ' + result.weakCategories.join(', ');
  }

  text += '\n\nUse /train for another.';
  bot.sendMessage(msg.chat.id, text);
});

bot.onText(/\/stats/, (msg) => {
  const userId = String(msg.chat.id);
  const stats = getUserStats(userId);

  let text = '📊 Your Scam Academy Progress\n\n';
  text += '🎯 Simulations: ' + stats.totalSimulations + '\n';
  text += '✅ Passed: ' + stats.totalPassed + '\n';
  text += '❌ Failed: ' + stats.totalFailed + '\n';
  text += '📈 Pass rate: ' + stats.passRate + '\n';
  text += '🔥 Current streak: ' + stats.streak + '\n';
  text += '⚡ Best streak: ' + stats.bestStreak + '\n';
  text += '🏆 Points: ' + stats.points + '\n';
  text += '📊 Level: ' + stats.skillLevel + '\n';
  text += '📚 Remaining: ' + stats.availableCount + ' simulations\n';

  if (stats.weakCategories.length > 0) {
    text += '\n💪 Focus areas: ' + stats.weakCategories.join(', ');
  }

  if (stats.achievements.length > 0) {
    text += '\n\n🏅 Achievements:\n';
    for (const aId of stats.achievements) {
      const a = ACHIEVEMENTS.find(x => x.id === aId);
      if (a) text += '  ' + a.name + ' — ' + a.desc + '\n';
    }
  }

  if (stats.totalSimulations === 0) {
    text += '\n\nNo simulations yet! Use /train to start.';
  }

  bot.sendMessage(msg.chat.id, text);
});

bot.onText(/\/categories/, (msg) => {
  const cats = {};
  for (const sim of Object.values(SIMULATIONS)) {
    if (!cats[sim.category]) cats[sim.category] = { beginner: 0, intermediate: 0, advanced: 0 };
    cats[sim.category][sim.difficulty]++;
  }

  let text = '📚 Training Categories\n\n';
  for (const [cat, counts] of Object.entries(cats)) {
    const total = counts.beginner + counts.intermediate + counts.advanced;
    const name = cat.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
    text += name + ' (' + total + ' sims)\n';
    text += '  🟢 ' + counts.beginner + ' beginner  🟡 ' + counts.intermediate + ' intermediate  🔴 ' + counts.advanced + ' advanced\n';
    text += '  Use: /train ' + cat.replace('_', '') + '\n\n';
  }

  text += 'Total: ' + Object.keys(SIMULATIONS).length + ' simulations across ' + Object.keys(cats).length + ' categories';
  bot.sendMessage(msg.chat.id, text);
});
