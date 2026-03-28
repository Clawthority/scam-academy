#!/usr/bin/env node
/**
 * Scam Academy — Realistic Template Generator
 * Creates variations of scam simulations so they don't look templated
 * Uses randomized elements to make each simulation feel unique
 */

// --- Randomization helpers ---
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randAmount = (min, max) => `$${randInt(min, max).toLocaleString()}`;

// --- Name/Company Generators ---
const NAMES = {
  first: ['John', 'Michael', 'David', 'James', 'Robert', 'Sarah', 'Jennifer', 'Lisa', 'Emily', 'Maria', 'James', 'Officer', 'Agent', 'Dr.', 'Mr.', 'Mrs.'],
  last: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Taylor', 'Anderson', 'Thomas'],
  companies: ['Amazon', 'Apple', 'Microsoft', 'PayPal', 'Netflix', 'Google', 'Bank of America', 'Chase', 'Wells Fargo', 'Citibank', 'USPS', 'FedEx', 'UPS', 'DHL'],
  banks: ['First National', 'Community', 'Regional', 'United', 'Metro', 'Premier', 'Pacific', 'Atlantic', 'Central'],
};

// --- Phishing Email Generator ---
function generatePhishingEmail(variant = 'random') {
  const templates = {
    account_locked: () => {
      const company = rand(NAMES.companies);
      return {
        category: 'phishing',
        difficulty: 'beginner',
        surface: 'email',
        subject: `Your ${company} account has been suspended`,
        body: `Dear Valued Customer,

We detected unusual activity on your ${company} account. For your protection, your account has been temporarily suspended.

Activity detected:
📍 Location: ${rand(['Lagos, Nigeria', 'Moscow, Russia', 'Beijing, China', 'Mumbai, India', 'São Paulo, Brazil'])}
🕐 Time: Today at ${randInt(1, 12)}:${randInt(10, 59)} ${rand(['AM', 'PM'])}
💻 Device: Unknown ${rand(['Windows', 'Mac', 'Linux'])} device

To restore your account, verify your identity within 24 hours:

🔗 https://${company.toLowerCase().replace(/ /g, '')}-security-${rand(['verify', 'login', 'confirm'])}.xyz/unlock

If you did not make this change, click the link above immediately.

${company} Security Team`,
        redFlags: [
          `Suspicious URL (not ${company.toLowerCase().replace(/ /g, '')}.com)`,
          'Creates urgency ("24 hours")',
          'Generic greeting ("Dear Valued Customer")',
          'Scary location to create panic'
        ],
        correctAction: `DO NOT CLICK. Go directly to ${company.toLowerCase().replace(/ /g, '')}.com and check your account.`,
        lesson: `${company} will NEVER email you a link to verify your account. Always go directly to the website.`
      };
    },

    order_problem: () => {
      const company = rand(['Amazon', 'Walmart', 'Target', 'Best Buy']);
      const orderNum = `${randInt(100, 999)}-${randInt(1000000, 9999999)}-${randInt(1000000, 9999999)}`;
      return {
        category: 'phishing',
        difficulty: 'beginner',
        surface: 'email',
        subject: `Your ${company} order #${orderNum} has a problem`,
        body: `${company} Order Update

Hello,

We were unable to deliver your order #${orderNum} because your address could not be verified.

Order Details:
📦 Item: ${rand(['iPhone 16 Pro', 'MacBook Air', 'Sony Headphones', 'Samsung TV', 'iPad Pro'])}
💰 Total: ${randAmount(99, 2499)}
📍 Status: Delivery Failed — Address Issue

To update your delivery address and reschedule:

🔗 https://${company.toLowerCase()}-delivery-${rand(['update', 'track', 'reschedule'])}.co/verify

If we don't hear from you within 48 hours, your order will be cancelled and refunded.

Thank you,
${company} Customer Service`,
        redFlags: [
          `Fake domain (${company.toLowerCase()}-delivery-${rand(['update', 'track'])}.co)`,
          `You didn't order anything from ${company}`,
          'Urgency (48 hours)',
          'Asks you to click a link'
        ],
        correctAction: `If you ordered from ${company}, check your order status directly in the ${company} app or website.`,
        lesson: `Delivery notifications from ${company} always come from @${company.toLowerCase()}.com, and they never ask you to click a link to "verify" your address.`
      };
    }
  };

  if (variant === 'random') variant = rand(Object.keys(templates));
  return templates[variant]();
}

// --- Prize Scam Generator ---
function generatePrizeScam(variant = 'random') {
  const templates = {
    lottery: () => {
      const amount = randAmount(10000, 500000);
      return {
        category: 'prize',
        difficulty: 'beginner',
        surface: 'email',
        subject: `🎉 YOU WON ${amount}!!! CLAIM NOW!!!`,
        body: `*** WINNING NOTIFICATION ***

CONGRATULATIONS!!!

Your email has been selected as the winner of our International Sweepstakes Program!

Prize Amount: ${amount} USD
Ticket Number: SWF-${randInt(2020, 2026)}-${randInt(10000, 99999)}
Reference: WIN-INT-${randInt(10000, 99999)}

To claim your prize, send the following information:
1. Full Name
2. Home Address
3. Phone Number
4. Date of Birth
5. Bank Account Details (for transfer)

You must respond within 48 HOURS or your prize will be forfeited!!!

Contact Agent: ${rand(NAMES.first)} ${rand(NAMES.last)}
Email: ${rand(['claims', 'prize', 'winner', 'award'])}@${rand(['gmail', 'yahoo', 'hotmail', 'outlook'])}.com

*This is a legitimate notification. Do not share with others until you claim.*`,
        redFlags: [
          'You never entered a sweepstakes',
          'Asks for personal AND bank information',
          'Free email address (not a company domain)',
          'Urgency (48 hours)',
          '"Do not share" — isolates you from advice'
        ],
        correctAction: 'DELETE. You can\'t win a contest you didn\'t enter.',
        lesson: 'You can\'t win a lottery or sweepstakes you didn\'t enter. EVER. This is ALWAYS a scam. Real lotteries don\'t email you.'
      };
    },

    gift_card: () => ({
      category: 'prize',
      difficulty: 'beginner',
      surface: 'sms',
      subject: null,
      body: `${rand(['Walmart', 'Target', 'Costco', 'Amazon'])}: Congratulations! You've been selected for a FREE $${rand([500, 1000, 2500, 5000])} gift card! Claim now: ${rand(['gift', 'reward', 'prize', 'claim'])}-${rand(['now', 'fast', 'link', 'go'])}.co/${randInt(1000, 9999)} Reply STOP to opt out`,
      redFlags: [
        'Free gift card for no reason',
        'Suspicious shortened URL',
        'Too good to be true'
      ],
      correctAction: 'DELETE. Real retailers don\'t give away free gift cards via random texts.',
      lesson: 'If you didn\'t enter a giveaway, you can\'t win one. These texts are designed to steal your information.'
    })
  };

  if (variant === 'random') variant = rand(Object.keys(templates));
  return templates[variant]();
}

// --- Romance Scam Generator ---
function generateRomanceScam() {
  const scenarios = [
    {
      body: `Hey ${rand(['beautiful', 'gorgeous', 'honey', 'sweetheart'])} 💕

I know we just matched yesterday, but I feel like I've known you forever. There's something special about you. I haven't felt this way in years.

I'm currently ${rand(['deployed overseas', 'working abroad', 'on a business trip', 'taking care of my sick mother'])} but I'll be back in ${randInt(2, 6)} weeks. I can't wait to meet you in person.

Until then, can we talk every day? You make me smile every time I see your message. 🥰

Also... I have a small problem. My ${rand(['bank account', 'credit card', 'wallet'])} was ${rand(['frozen', 'stolen', 'compromised'])} while I was ${rand(['traveling', 'overseas', 'away'])}. Could you help me with just ${randAmount(100, 500)} for ${rand(['food', 'medicine', 'a hotel', 'transportation'])}?

I know this is a lot to ask someone I just met, but I promise I'll pay you back ${rand(['double', 'as soon as I get home', 'with interest'])}. You're the only person I trust right now. 💕`,
      redFlags: [
        'Moves too fast emotionally (known you 1 day)',
        'Claims to be away (can\'t meet)',
        'Asks for money',
        'Creates urgency and isolation',
        'Overly romantic too quickly'
      ],
      correctAction: 'BLOCK. Never send money to someone you haven\'t met in person.',
      lesson: 'Romance scammers build emotional connections quickly, then ask for money. If someone you\'ve never met asks for money, it\'s a scam. 100% of the time. Real love doesn\'t need your bank details.'
    }
  ];

  return {
    category: 'romance',
    difficulty: 'intermediate',
    surface: 'chat',
    subject: null,
    ...rand(scenarios)
  };
}

// --- Crypto Scam Generator ---
function generateCryptoScam(variant = 'random') {
  const templates = {
    airdrop: () => ({
      category: 'crypto',
      difficulty: 'advanced',
      surface: 'chat',
      subject: null,
      body: `🚨 FREE AIRDROP ALERT 🚨

You're eligible for ${randInt(1000, 50000)} $${rand(['REWARD', 'BONUS', 'AIRDROP', 'GIFT', 'CLAIM'])} tokens (~${randAmount(500, 5000)})!

✅ Claim before it expires in ${randInt(2, 24)} hours
✅ Connect your wallet to receive tokens
✅ No gas fees required
✅ ${randInt(100, 500)} claims remaining

Claim here: 🔗 ${rand(['reward', 'claim', 'airdrop', 'bonus'])}-${rand(['app', 'xyz', 'io', 'fun'])}/connect

Share with friends to earn ${randInt(100, 1000)} bonus tokens each! 🎁`,
      redFlags: [
        'Free tokens (nothing is free)',
        'Asks to connect wallet (can drain funds)',
        `Suspicious domain (${rand(['reward', 'claim'])}-${rand(['app', 'xyz'])})`,
        'Urgency + limited claims',
        'Referral bonus (pyramid scheme)'
      ],
      correctAction: 'IGNORE. Never connect your wallet to unknown sites.',
      lesson: 'Free crypto airdrops that ask you to connect your wallet are almost always scams. Real airdrops are sent directly to your address. Connecting your wallet to a scam site can drain ALL your funds.'
    }),

    giveaway: () => ({
      category: 'crypto',
      difficulty: 'beginner',
      surface: 'social',
      subject: null,
      body: `${rand(['Elon Musk', 'Vitalik Buterin', 'CZ', 'Brian Armstrong'])} @${rand(['ElonMask', 'VitalikV', 'cz_binance', 'brian_armstrong'])}Verified

🔥 MEGA GIVEAWAY 🔥

I'm giving away ${randInt(1000, 10000)} BTC and ${randInt(10000, 100000)} ETH!

Send ${randAmount(50, 500)} in BTC → Get ${randAmount(250, 2500)} back
Send ${randAmount(0.1, 2)} ETH → Get ${randAmount(0.5, 10)} back

This is REAL and time-limited!

BTC: ${rand(['1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2'])}
ETH: ${rand(['0x000000000000000000000000000000000000dead', '0x0000000000000000000000000000000000000000'])}

First ${randInt(50, 500)} people only! 🚀`,
      redFlags: [
        'Impersonating celebrity (misspelled handle)',
        '"Send X to get more back" is ALWAYS a scam',
        'Burn address',
        'Urgency'
      ],
      correctAction: 'REPORT AND BLOCK. No legitimate person will ever double your crypto.',
      lesson: 'The "send me crypto and I\'ll send more back" scam has stolen billions. Nobody will EVER double your money. NEVER send crypto to strangers.'
    })
  };

  if (variant === 'random') variant = rand(Object.keys(templates));
  return templates[variant]();
}

// --- Export all generators ---
module.exports = {
  generatePhishingEmail,
  generatePrizeScam,
  generateRomanceScam,
  generateCryptoScam,
  rand
};

// CLI
if (require.main === module) {
  const type = process.argv[2] || 'random';

  const generators = {
    phishing: generatePhishingEmail,
    prize: generatePrizeScam,
    romance: generateRomanceScam,
    crypto: generateCryptoScam
  };

  if (type === 'random') {
    const gen = rand(Object.values(generators));
    console.log(JSON.stringify(gen(), null, 2));
  } else if (generators[type]) {
    console.log(JSON.stringify(generators[type](), null, 2));
  } else {
    console.log('Usage: node generate.js [phishing|prize|romance|crypto|random]');
  }
}
