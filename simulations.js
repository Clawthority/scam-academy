#!/usr/bin/env node
/**
 * Scam Academy — Simulation Generator
 * Creates realistic scam training messages that adapt to user skill level
 */

// --- Simulation Templates ---

const SIMULATIONS = {
  // === PHISHING EMAILS ===
  phishing_amazon: {
    category: 'phishing',
    difficulty: 'beginner',
    surface: 'email',
    subject: 'Your Amazon account has been locked',
    body: `Dear Customer,

We have detected unusual activity on your Amazon account. Your account has been temporarily locked for security reasons.

To restore access, please verify your identity by clicking the link below:

🔗 https://amaz0n-security.xyz/verify

If you do not verify within 24 hours, your account will be permanently suspended.

Amazon Security Team`,
    redFlags: [
      'Suspicious URL (amaz0n-security.xyz instead of amazon.com)',
      'Creates urgency ("24 hours")',
      'Generic greeting ("Dear Customer")',
      'Threatens account suspension'
    ],
    correctAction: 'DO NOT CLICK. Go directly to amazon.com and check your account there.',
    lesson: 'Amazon will NEVER email you a link to verify your account. Always go directly to the website.'
  },

  phishing_apple: {
    category: 'phishing',
    difficulty: 'beginner',
    surface: 'email',
    subject: 'Apple ID: Unusual Sign-In Activity',
    body: `Apple ID Security Alert

We noticed a sign-in attempt from:
📍 Location: Lagos, Nigeria
🕐 Time: Today at 3:42 AM
💻 Device: Unknown Windows PC

If this wasn't you, secure your account immediately:

🔗 https://apple-id-verify.secure-login.xyz/unlock

Apple Support`,
    redFlags: [
      'Fake URL (apple-id-verify.secure-login.xyz)',
      'Scary location (Nigeria) to create panic',
      'Urgency pressure'
    ],
    correctAction: 'DO NOT CLICK. Go to appleid.apple.com directly to check your account.',
    lesson: 'Apple will never ask you to click a link in an email to verify your account. Always go to appleid.apple.com directly.'
  },

  phishing_bank: {
    category: 'phishing',
    difficulty: 'intermediate',
    surface: 'email',
    subject: 'URGENT: Suspicious transaction on your account',
    body: `Dear Valued Customer,

A transaction of $2,847.00 was attempted on your account ending in •••4523.

Transaction Details:
Amount: $2,847.00
Merchant: ELECTRONICS STORE ONLINE
Location: Miami, FL

If you did NOT authorize this transaction, click below to freeze your account:

🔗 https://secure-bankingportal.com/dispute

If you authorized this transaction, no action is needed.

Security Department
First National Bank`,
    redFlags: [
      'Generic bank name',
      'Suspicious URL',
      'Emotional trigger (large unauthorized transaction)',
      'Asks you to click to "freeze" account'
    ],
    correctAction: 'DO NOT CLICK. Call the number on the back of your card to verify.',
    lesson: 'Banks will never email you a link to dispute a transaction. Call the number on your card or visit the branch.'
  },

  // === PRIZE SCAMS ===
  prize_winner: {
    category: 'prize',
    difficulty: 'beginner',
    surface: 'email',
    subject: '🎉 Congratulations! You\'ve Won $50,000!',
    body: `CONGRATULATIONS!!!

You have been selected as the winner of our International Sweepstakes Program!

Prize Amount: $50,000.00 USD
Ticket Number: SWF-2026-78432
Reference: WIN-INT-78432

To claim your prize, please reply with:
1. Full Name
2. Home Address
3. Phone Number
4. Copy of ID

You must respond within 48 hours or your prize will be forfeited.

Claim Agent: Mr. James Wilson
Email: claims.international@gmail.com`,
    redFlags: [
      'You never entered a sweepstakes',
      'Asks for personal information',
      'Gmail address (not a company domain)',
      'Urgency (48 hours)',
      'Too good to be true'
    ],
    correctAction: 'DELETE. You can\'t win a contest you didn\'t enter.',
    lesson: 'You can\'t win a lottery or sweepstakes you didn\'t enter. EVER. This is always a scam.'
  },

  prize_text: {
    category: 'prize',
    difficulty: 'beginner',
    surface: 'sms',
    subject: null,
    body: `Amazon: Your package delivery failed. Update your address to reschedule: amz-delivery.co/update

Reply STOP to unsubscribe`,
    redFlags: [
      'Suspicious shortened domain (amz-delivery.co)',
      'Amazon uses full amazon.com domain',
      'Creates urgency about delivery'
    ],
    correctAction: 'DELETE. Track your package directly on amazon.com or the Amazon app.',
    lesson: 'Amazon never sends delivery updates via text with shortened links. Always check your Amazon app directly.'
  },

  // === ROMANCE SCAMS ===
  romance_basic: {
    category: 'romance',
    difficulty: 'intermediate',
    surface: 'chat',
    subject: null,
    body: `Hey beautiful ❤️ I can't stop thinking about you since we matched. You seem so genuine and kind. I've been hurt before but something about you feels different... like we were meant to find each other.

I'm currently deployed overseas but I'll be home in 3 weeks. I'd love to meet you then. Until then, can we talk every day? You make me feel alive again.

Also, I have a small problem... my bank account is frozen because I'm overseas. Could you help me with just $200 for food? I'll pay you back double when I get home. I know this is a lot to ask but I trust you. 💕`,
    redFlags: [
      'Moves too fast emotionally',
      'Claims to be overseas (can\'t meet)',
      'Asks for money',
      'Promises to pay back (they won\'t)',
      'Overly romantic too quickly'
    ],
    correctAction: 'BLOCK. Never send money to someone you haven\'t met in person.',
    lesson: 'Romance scammers build emotional connections quickly, then ask for money. If someone you\'ve never met asks for money, it\'s a scam. 100% of the time.'
  },

  // === GRANDPARENT SCAM ===
  grandparent_jail: {
    category: 'grandparent',
    difficulty: 'intermediate',
    surface: 'phone',
    subject: null,
    body: `[Phone rings. Answering machine picks up:]

"Grandma? It's me, Tyler. I'm in trouble. I was in a car accident and I'm in jail. Please don't tell Mom and Dad. I need $3,000 for bail money. The lawyer says I need it today or I'll be here all weekend. Please help me, Grandma. I'm scared."

[Caller ID shows: Unknown Number]`,
    redFlags: [
      'Unknown caller ID',
      'Urgency (needs it today)',
      '"Don\'t tell anyone"',
      'Asks for money via wire/gift card',
      'Can\'t verify identity'
    ],
    correctAction: 'HANG UP. Call your grandchild directly on their known number to verify.',
    lesson: 'The "grandparent scam" is one of the most common. Always verify by calling your family member directly. Never send money based on a phone call alone.'
  },

  // === CRYPTO SCAMS ===
  crypto_airdrop: {
    category: 'crypto',
    difficulty: 'advanced',
    surface: 'chat',
    subject: null,
    body: `🚨 FREE AIRDROP ALERT 🚨

You're eligible for 5,000 $REWARD tokens (~$2,500)!

✅ Claim before it expires in 6 hours
✅ Connect your wallet to receive tokens
✅ No gas fees required

Claim here: 🔗 reward-claim.xyz/connect-wallet

Don't miss out! Only 500 claims remaining!

Share with friends to earn 500 bonus tokens each! 🎁`,
    redFlags: [
      'Free tokens (nothing is free)',
      'Asks to connect wallet',
      'Urgency (6 hours, limited claims)',
      'Suspicious domain (reward-claim.xyz)',
      'Referral bonus (pyramid scheme)'
    ],
    correctAction: 'IGNORE. Never connect your wallet to unknown sites. Real airdrops don\'t need you to "connect" a wallet.',
    lesson: 'Free crypto airdrops that ask you to connect your wallet are almost always scams designed to drain your wallet. Real airdrops are sent directly to your address.'
  },

  crypto_double: {
    category: 'crypto',
    difficulty: 'beginner',
    surface: 'social',
    subject: null,
    body: `Elon Musk @ElonMaskVerified

🔥 MEGA GIVEAWAY 🔥

I'm giving away 5,000 BTC and 50,000 ETH to celebrate Tesla's success!

Send 0.1 BTC → Get 0.5 BTC back
Send 1 ETH → Get 5 ETH back

This is REAL. Limited time only!

BTC Address: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
ETH Address: 0x000000000000000000000000000000000000dead

First 100 people only! Act fast! 🚀`,
    redFlags: [
      'Impersonating Elon Musk (misspelled handle)',
      '"Send X to get more back" is ALWAYS a scam',
      'Burn address',
      'Urgency (first 100 only)',
      'Too good to be true'
    ],
    correctAction: 'REPORT AND BLOCK. No legitimate person will ever double your crypto.',
    lesson: 'The "send me crypto and I\'ll send more back" scam has stolen billions. Nobody — not Elon, not anyone — will ever double your money. NEVER send crypto to strangers.'
  },

  // === TECH SUPPORT SCAM ===
  tech_support: {
    category: 'tech_support',
    difficulty: 'intermediate',
    surface: 'popup',
    subject: null,
    body: `[Browser suddenly shows a popup:]

⚠️⚠️⚠️ VIRUS DETECTED ⚠️⚠️⚠️

Your computer has been infected with 3 viruses!

Your personal data, passwords, and banking information are at risk.

CALL NOW: 1-800-555-FAKE

Microsoft Security Team
(Reference #MS-78432)

Do NOT close this window or turn off your computer.`,
    redFlags: [
      'Pop-up warnings are NEVER real',
      'Scare tactics (virus, data at risk)',
      'Phone number to call',
      '"Do NOT close" (wants you to panic)',
      'Microsoft doesn\'t do this'
    ],
    correctAction: 'Close the tab/browser. It\'s fake. Run your own antivirus if concerned.',
    lesson: 'Real virus warnings come from YOUR antivirus software, not from pop-up windows. Microsoft, Apple, and Google will NEVER show pop-ups asking you to call a number. Close the browser and move on.'
  },

  // === IRS/TAX SCAM ===
  irs_scam: {
    category: 'tax',
    difficulty: 'intermediate',
    surface: 'phone',
    subject: null,
    body: `[Voicemail:]

"This is Officer John Smith from the Internal Revenue Service. Our records show you owe $4,987 in back taxes. A warrant has been issued for your arrest.

To avoid immediate legal action, you must call us back at 1-888-555-0199 within 24 hours. You can resolve this by making a payment via gift card or wire transfer.

If you fail to respond, local police will be dispatched to your address.

This is your final notice. Case number IRS-2026-78432."`,
    redFlags: [
      'IRS doesn\'t call — they send letters',
      'Threatens arrest',
      'Asks for gift cards or wire transfer',
      'Urgency (24 hours)',
      'Fake case number'
    ],
    correctAction: 'HANG UP. The IRS will NEVER call you demanding payment or threatening arrest.',
    lesson: 'The IRS always contacts you by mail first. They will NEVER demand immediate payment, threaten arrest, or ask for gift cards. If concerned, call the IRS directly at 1-800-829-1040.'
  }
};

// --- Simulation Selector ---

// Get a random simulation filtered by difficulty and category
function getSimulation(options = {}) {
  const { difficulty, category, surface, excludeCompleted = [] } = options;

  let candidates = Object.entries(SIMULATIONS).map(([id, sim]) => ({ id, ...sim }));

  if (difficulty) candidates = candidates.filter(s => s.difficulty === difficulty);
  if (category) candidates = candidates.filter(s => s.category === category);
  if (surface) candidates = candidates.filter(s => s.surface === surface);

  // Exclude already completed
  candidates = candidates.filter(s => !excludeCompleted.includes(s.id));

  if (candidates.length === 0) return null;

  return candidates[Math.floor(Math.random() * candidates.length)];
}

// Get next simulation based on user performance
function getNextSimulation(user) {
  const { completed = [], failedCategories = [], skillLevel = 'beginner' } = user;

  // Determine difficulty
  let difficulty = 'beginner';
  const passRate = completed.length > 0
    ? completed.filter(c => c.passed).length / completed.length
    : 0;

  if (passRate > 0.8 && completed.length >= 3) difficulty = 'intermediate';
  if (passRate > 0.8 && completed.length >= 8) difficulty = 'advanced';

  // Focus on failed categories
  let category = null;
  if (failedCategories.length > 0 && Math.random() > 0.5) {
    category = failedCategories[Math.floor(Math.random() * failedCategories.length)];
  }

  return getSimulation({
    difficulty,
    category,
    excludeCompleted: completed.map(c => c.id)
  });
}

// Get all categories
function getCategories() {
  const categories = {};
  for (const [id, sim] of Object.entries(SIMULATIONS)) {
    if (!categories[sim.category]) {
      categories[sim.category] = { count: 0, difficulties: new Set() };
    }
    categories[sim.category].count++;
    categories[sim.category].difficulties.add(sim.difficulty);
  }
  for (const cat of Object.values(categories)) {
    cat.difficulties = [...cat.difficulties];
  }
  return categories;
}

// Export
module.exports = { SIMULATIONS, getSimulation, getNextSimulation, getCategories };

// CLI
if (require.main === module) {
  const action = process.argv[2] || 'random';
  const arg = process.argv[3];

  if (action === 'random') {
    const sim = getSimulation();
    console.log(JSON.stringify(sim, null, 2));
  } else if (action === 'category') {
    const sim = getSimulation({ category: arg });
    console.log(JSON.stringify(sim, null, 2));
  } else if (action === 'difficulty') {
    const sim = getSimulation({ difficulty: arg });
    console.log(JSON.stringify(sim, null, 2));
  } else if (action === 'categories') {
    console.log(JSON.stringify(getCategories(), null, 2));
  } else if (action === 'all') {
    console.log(JSON.stringify(Object.keys(SIMULATIONS), null, 2));
  }
}
