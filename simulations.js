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

  // === JOB SCAMS ===
  job_fake_check: {
    category: 'job',
    difficulty: 'intermediate',
    surface: 'email',
    subject: 'Welcome Aboard! Your First Payment is Ready',
    body: `Dear New Hire,

Welcome to Global Solutions Inc! We're excited to have you join our team as a Remote Data Entry Clerk ($35/hr).

We've mailed you a cashier's check for $4,850. This covers:
- Your first week salary: $1,400
- Home office equipment allowance: $2,450
- Software license: $1,000

Please deposit the check into your bank account, then purchase the required equipment from our approved vendor portal:

🔗 https://global-solutions-portal.com/shop

You'll need to send $3,450 to our vendor via Zelle or gift cards to receive your equipment kit within 3 business days.

Keep the remaining $1,400 as your signing bonus!

HR Department
Global Solutions Inc.`,
    redFlags: [
      'Check overpayment scheme — the check will bounce',
      'Asks you to buy from a specific vendor (their site)',
      'Payment via Zelle or gift cards',
      'Unusually high pay ($35/hr for data entry)',
      'You never had a real interview'
    ],
    correctAction: 'DO NOT DEPOSIT. This is a classic fake check scam. The check will bounce and you lose the money you sent.',
    lesson: 'Legitimate employers will NEVER send you a check and ask you to send money elsewhere. The check is fake — it will bounce in days, and the money you sent is gone forever.'
  },

  job_upfront_fee: {
    category: 'job',
    difficulty: 'beginner',
    surface: 'email',
    subject: 'Congratulations! Selected for Premium Position',
    body: `Dear Applicant,

After reviewing your resume on Indeed, we'd like to offer you a position as a Customer Service Representative with TechServ Solutions.

Position: Remote Customer Service Rep
Salary: $28/hour + benefits
Start Date: Next Monday

To proceed, please complete the following before your start date:

1. Background Check Fee: $49.99 (refundable after 90 days)
2. Training Materials: $89.99
3. Equipment Deposit: $150.00

Pay here: 🔗 techserv-solutions.com/onboarding-fee

Once payment is confirmed, we'll send your login credentials and schedule your orientation.

HR Onboarding Team
TechServ Solutions
hr@techserv-solutions.net`,
    redFlags: [
      'Asks YOU to pay to get hired',
      'Fees for background check, training, equipment',
      'Says fees are "refundable" (they never are)',
      '.net domain for a "tech company"',
      'Salary too good to be true for customer service'
    ],
    correctAction: 'DO NOT PAY. Real jobs pay YOU — you never pay to get hired.',
    lesson: 'If a job asks you to pay ANY fee — for training, equipment, background checks, or anything else — it\'s a scam. Legitimate employers cover these costs. You should NEVER pay to work.'
  },

  job_reshipping: {
    category: 'job',
    difficulty: 'advanced',
    surface: 'email',
    subject: 'Logistics Coordinator — Immediate Start (No Experience Needed)',
    body: `Hello!

We're PackageFlow LLC, a logistics company hiring Remote Shipping Coordinators. No experience required!

Job Description:
- Receive packages at your home address
- Inspect and repackage items
- Print prepaid shipping labels (we provide)
- Drop packages at UPS/FedEx within 24 hours

Pay: $25/package + $500 weekly base salary
Average monthly earnings: $3,500-$5,000

Requirements:
- Must be home to receive deliveries
- Reliable printer for shipping labels
- Valid ID for tax purposes (upload to our portal)

Apply now: 🔗 packageflow-llc.com/apply

We'll send your first packages within 48 hours of approval!

Best,
Sarah Chen
Recruiting Manager, PackageFlow LLC`,
    redFlags: [
      'Reshipping stolen goods — you become a fence',
      'No interview process',
      'No experience needed for "good" pay',
      'Uses YOUR address (makes YOU liable)',
      'Asks for ID upload (identity theft risk)'
    ],
    correctAction: 'DO NOT APPLY. Reshipping jobs are used to move stolen goods with YOUR address on them.',
    lesson: 'Reshipping "jobs" use your address to receive stolen merchandise. You become the middleman, and when police trace the packages, they come to YOUR door. This is a federal crime even if you didn\'t know.'
  },

  job_interview_scam: {
    category: 'job',
    difficulty: 'intermediate',
    surface: 'chat',
    subject: null,
    body: `LinkedIn Notification: Sarah from Apex Technologies wants to connect

[New message from Sarah Miller, Talent Acquisition at Apex Technologies]

Hi! I found your profile and was impressed by your background. We have an immediate opening for a Remote Project Manager — $75K-$95K base + benefits.

Are you available for an interview today? We're doing all interviews via Google Chat for speed. Add me: sarah.apexcareers@gmail.com

Looking forward to speaking with you! 🌟

---

[On Google Chat:]

Hi! Thanks for connecting. Before the interview, I need to verify your identity for compliance. Can you please send me:

1. Full legal name
2. Date of birth
3. Social Security Number
4. Current address
5. Bank name (for direct deposit setup)

This is standard for our remote hiring process. Once verified, we'll start the interview! 😊`,
    redFlags: [
      'Personal email (gmail) not company email',
      'Interview on Google Chat (not professional)',
      'Asks for SSN BEFORE any interview',
      'Asks for bank info upfront',
      'Too eager to hire — no real interview'
    ],
    correctAction: 'BLOCK. This is identity theft, not a job interview.',
    lesson: 'Never give your SSN, date of birth, or bank information before a formal job offer from a verified company. Real companies verify identity AFTER hiring, not before an interview on a chat app.'
  },

  job_task_scam: {
    category: 'job',
    difficulty: 'intermediate',
    surface: 'sms',
    subject: null,
    body: `📱 WhatsApp Message from Unknown Number:

Hi! I'm Lisa from AppBoost Marketing. We found your profile on Indeed.

We're hiring remote workers to rate and review apps on the App Store. You earn $2-$5 per task. No experience needed!

Here's how it works:
1. Complete 40 "training" tasks (unpaid but fast)
2. After training, you start earning immediately
3. Tasks take 30 seconds each
4. Withdraw anytime after $50 minimum

First bonus: Deposit $50 to unlock VIP tasks that pay $10-$20 each!

Sign up: appboost-tasks.com/register

Most people earn $200-$500/day after training! 💰`,
    redFlags: [
      'Unsolicited WhatsApp message',
      'Requires deposit to "unlock" higher pay',
      'Fake reviews/ratings (against App Store rules)',
      '"Too good to be true" earnings',
      'Unpaid "training" tasks'
    ],
    correctAction: 'BLOCK. This is a task scam — you do free work, then they ask for money to "unlock" earnings.',
    lesson: 'Task scams lure you with easy work, then require a deposit or upgrade fee to access your earnings. Once you pay, they disappear or ask for more. Real jobs never ask you to deposit money to earn money.'
  },

  job_crypto_mule: {
    category: 'job',
    difficulty: 'advanced',
    surface: 'chat',
    subject: null,
    body: `📩 Telegram message from "CryptoFlow Finance":

Hey! 👋 We're a fast-growing crypto trading firm and we need reliable people to help process transactions.

Your role as a "Fund Processor":
- Receive crypto (USDT/USDC) to your wallet
- Convert to USD and transfer to specified bank accounts
- Keep 8-12% as your commission
- Work from anywhere, 1-2 hours/day
- Average earnings: $1,500-$4,000/week

No experience needed — we provide full training!

To start, just send your:
✅ Wallet address
✅ Bank account for receiving transfers
✅ Photo of your ID (for "KYC compliance")

We're onboarding 10 new processors today. Interested?

— Jordan, Head of Operations @ CryptoFlow`,
    redFlags: [
      'Money laundering disguised as a job',
      'Moving money through YOUR accounts makes YOU liable',
      'Telegram-based (no accountability)',
      'Asks for bank account and ID upfront',
      'Unrealistic pay for minimal work',
      '8-12% commission is the classic mule payment structure'
    ],
    correctAction: 'BLOCK. You would be a money mule — this is money laundering, a serious federal crime.',
    lesson: 'Crypto "fund processor" jobs are money laundering schemes. By moving dirty money through your accounts, YOU become the criminal — not the person who recruited you. When the FBI traces the money, it leads to YOUR bank account. Never let anyone use your accounts to move money.'
  },

  job_flex_offer: {
    category: 'job',
    difficulty: 'beginner',
    surface: 'sms',
    subject: null,
    body: `📱 Text from +1 (555) 0123:

Hi! I'm Jessica from FlexJobs Inc. We have a flexible part-time position available:

💼 Remote Social Media Manager
💰 $45/hour | 2-3 hrs/day | Work from home
📅 Start immediately

Requirements:
- Smartphone or laptop
- 1 hour of online training

Interested? Reply YES and I'll send you the application link!

Or apply directly at: flexjobs-hiring.com/apply

We're filling spots fast! 🚀`,
    redFlags: [
      'Unsolicited text from unknown number',
      'Domain "flexjobs-hiring.com" is not the real FlexJobs.com',
      'Too-high pay ($45/hr) for simple work',
      'Pressure to reply fast',
      'No real interview process'
    ],
    correctAction: 'DELETE. Do not reply or click the link. Real job boards don\'t recruit via random texts.',
    lesson: 'Scammers impersonate real job boards (like FlexJobs) with slightly different URLs. If you get an unsolicited job text, search for the company directly — never click their link. Real recruiters contact you through official channels, not random texts.'
  },

  job_freelance_escrow: {
    category: 'job',
    difficulty: 'intermediate',
    surface: 'email',
    subject: 'Your Freelance Application Was Approved! 🎉',
    body: `Dear Freelancer,

Congratulations! Your application to WorkHub Global has been approved.

You've been selected for: Senior Content Writer
Rate: $85/article (500 words)
Expected volume: 10-20 articles/week

To activate your account and receive your first assignments, please:

1. Create a free account at workhub-global.com/activate
2. Purchase your Writer Verification Badge: $29.99 (one-time)
3. Complete a 10-minute writing sample (unpaid)

Your Badge fee is refunded after your first 5 articles!

Once verified, you'll have access to our full job board with 500+ writing gigs.

Welcome to the team!

WorkHub Global — Freelancer Success Team`,
    redFlags: [
      'Must pay to "activate" account',
      'Unpaid writing sample (free work)',
      '"Verification badge" is not a real thing',
      'Refund promise is a hook — they vanish after you pay',
      'High pay rate to make you overlook the fee'
    ],
    correctAction: 'DELETE. Legitimate freelance platforms (Upwork, Fiverr) never charge you to apply or get verified.',
    lesson: 'Real freelance platforms make money from clients, not freelancers. If a platform asks YOU to pay a fee to access work — whether it\'s a "badge," "activation," or "verification" — it\'s a scam. Upwork, Fiverr, and others never charge upfront fees.'
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
  },

  // === RENTAL SCAMS ===
  rental_fake_listing: {
    category: 'rental',
    difficulty: 'beginner',
    surface: 'email',
    subject: 'Beautiful 2BR Apartment — Available Now! $950/mo',
    body: `Hi there!

Thanks for your interest in the apartment at 742 Maple Street, Apt 3B. It's a gorgeous 2-bedroom, 1-bath unit with hardwood floors, in-unit washer/dryer, and a private balcony. Pets welcome!

Rent: $950/month (utilities included!)
Available: Immediately

Because of high demand, I'm offering a special deal:
- First month FREE if you sign within 48 hours
- Security deposit: only $500 (normally $950)

To hold the unit, send a $500 deposit via Zelle or CashApp to secure your spot. I'll email you the lease to sign once payment is received.

Unfortunately I'm currently out of the country managing a property in another state, so I can't do an in-person showing. But I can send you a video walkthrough!

Let me know ASAP — this won't last!

Best,
David Chen
Property Manager`,
    redFlags: [
      'Rent far below market rate for the area',
      'Landlord is "out of town" — can\'t show the property',
      'Asks for deposit BEFORE seeing the unit or signing a lease',
      'Payment via Zelle or CashApp (no paper trail)',
      'Artificial urgency (48 hours, special deal)',
      'First month free is a classic hook'
    ],
    correctAction: 'STOP. Never send money without seeing an apartment in person and signing a real lease. Verify the owner via county property records.',
    lesson: 'Fake rental listings use photos stolen from real listings at below-market prices to lure victims. The scammer collects deposits from dozens of people for a property they don\'t own or that doesn\'t exist. Always tour in person, verify ownership, and never pay via Zelle/CashApp for housing.'
  },

  rental_bait_switch: {
    category: 'rental',
    difficulty: 'intermediate',
    surface: 'email',
    subject: 'Re: Your application for 123 Oak Avenue',
    body: `Hi!

Great news — your application for 123 Oak Avenue has been pre-approved! 🎉

Unfortunately, that specific unit was just rented (the listing hadn't been updated yet). BUT — we have a similar unit available at 456 Pine Road! It's actually a better deal:

- 3BR/2BA instead of 2BR/1BA
- Same price: $1,100/month
- Move-in ready today!

There's a small catch — this unit requires:
1. Application fee: $75 (non-refundable)
2. Background check: $50
3. Holding deposit: $1,100 (one month's rent)

We can do everything online! Just send the fees via Venmo to @ApexRentals-PM and I'll process everything within 2 hours.

The original unit at Oak Ave was listed at $1,100 too, so you're getting MORE for the same price. This is actually a better deal!

Ready to apply?

— Jessica, Apex Property Management`,
    redFlags: [
      'Classic bait-and-switch — the good listing was never real',
      'Multiple upfront fees (application, background check, deposit)',
      'Payment via Venmo (no protection)',
      'Pressure to pay quickly ("within 2 hours")',
      '"Better deal" is designed to make you forget you were scammed',
      'No in-person showing offered for the new unit'
    ],
    correctAction: 'WALK AWAY. The original listing was fake, and the "replacement" likely is too. Never pay application fees without seeing a unit and verifying the management company.',
    lesson: 'Bait-and-switch rental scams advertise amazing properties to collect your info and fees, then redirect you to other "available" units. The original listing was never real. Always verify the management company independently (Google them, check BBB) and never pay fees before touring a unit in person.'
  },

  rental_cloned_listing: {
    category: 'rental',
    difficulty: 'advanced',
    surface: 'social',
    subject: null,
    body: `[Facebook Marketplace listing]

🏠 STUNNING 1BR Condo — Downtown! $1,200/mo
📍 890 River Road, Unit 12A
✨ Granite counters, stainless steel appliances, gym access, parking included!

[15 high-quality photos — looks legitimate]

Description:
Beautiful 1BR/1BA condo in the heart of downtown. Walking distance to restaurants, shops, and public transit. Building amenities include gym, pool, and 24/7 concierge.

Rent: $1,200/month (ALL utilities included!)
Lease: 12 months
Available: April 1st

Contact: riverroad.rentals@gmail.com
Text only: (555) 0123

---

[You text the number:]

"Hi! I saw the listing on Facebook for 890 River Road. Is it still available?"

[Response:]
"Hi! Yes it's still available! We've had a lot of interest though. I actually manage this property for the owner. He lives overseas and hired me to find a tenant. I can meet you there Saturday at 2pm for a showing. But fair warning — we've had 6 inquiries today. If you want to lock it in before the showing, you can send a refundable holding deposit of $600 via Zelle and I'll take it off the market for you. If you don't like it at the showing, I refund you on the spot! 😊"`,
    redFlags: [
      'Listing is copied from a real Zillow/Realtor.com listing',
      'Gmail contact, not a property management company',
      '"Owner lives overseas" — can\'t verify ownership',
      'Offers to refund holding deposit if you don\'t like it (they won\'t)',
      'Urgency from manufactured interest ("6 inquiries today")',
      'Asks for Zelle payment before any in-person meeting'
    ],
    correctAction: 'DO NOT SEND MONEY. Reverse-image-search the photos on Google. Verify the owner via county property records. Only tour in person with a verified agent.',
    lesson: 'Scammers clone real rental listings — same photos, same address — but with their contact info. The real listing is on Zillow or a legitimate site; the scammer reposts it on Facebook/Craigslist with a lower price. Always reverse image search photos and verify ownership independently.'
  },

  rental_roommate_scam: {
    category: 'rental',
    difficulty: 'intermediate',
    surface: 'chat',
    subject: null,
    body: `[Craigslist reply to your "Room Wanted" ad:]

Hey! I saw your ad looking for a room. I actually have a perfect situation:

🏠 Room in a 3BR house in Midtown
💰 $700/month (includes utilities, wifi, Netflix)
🛏️ Furnished room — queen bed, desk, closet
🐕 Dog-friendly (I have a golden retriever named Cooper)

I'm 28, work in tech, pretty chill. The other roommate is a nurse, she's barely home. We're looking for someone laid back who keeps common areas clean.

The room is available now but I'm currently traveling for work until April 5th. To hold the room for you, I just need:
- First month's rent: $700
- Security deposit: $350

You can Venmo me and I'll mail you the keys. I'll also send you a video tour of the house right now!

Here's a video walkthrough: [link to Google Drive folder]

Sound good? I'd love to lock this in before I get back! 🏡`,
    redFlags: [
      'Room available but person is "traveling" — can\'t meet',
      'Below-market rent with too many perks (furnished, utilities included, Netflix)',
      'Asks for full payment + deposit before meeting or seeing the room',
      'Will "mail you the keys" (classic scam line)',
      'Video walkthrough could be from Airbnb or stolen listing',
      'Friendly, detailed story to build trust before the ask'
    ],
    correctAction: 'DO NOT PAY. Insist on meeting in person and seeing the room before any money changes hands. A real roommate will understand.',
    lesson: 'Roommate scams prey on people desperate for affordable housing. The scammer builds a believable persona with details (name, job, pet) to seem real, then asks for money while "out of town." Never pay for a room you haven\'t seen in person, and never Venmo someone you haven\'t met.'
  },

  rental_application_harvest: {
    category: 'rental',
    difficulty: 'advanced',
    surface: 'email',
    subject: 'Application Received — Please Complete Full Rental Application',
    body: `Thank you for your interest in 567 Elm Street, Unit 8!

To process your rental application, please complete the attached form with the following information:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RENTAL APPLICATION — ELM PROPERTIES LLC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PERSONAL INFORMATION:
☐ Full Legal Name:
☐ Date of Birth:
☐ Social Security Number:
☐ Driver's License Number & State:
☐ Current Address:
☐ Previous Address (last 3 years):

FINANCIAL INFORMATION:
☐ Bank Name & Account Number:
☐ Routing Number:
☐ Credit Card Number (for credit check):
☐ Employer Name & Salary:
☐ Monthly Income:

EMERGENCY CONTACT:
☐ Name, Phone, & Relationship:

APPLICATION FEE: $35 (send via Zelle to elmproperties.mgmt@gmail.com)

Please reply to this email with all completed fields. We process applications within 24 hours!

— Management Office
Elm Properties LLC`,
    redFlags: [
      'Asks for SSN, driver\'s license, and bank account details in an EMAIL',
      'Requests credit card number (never needed for a rental application)',
      'Asks for routing and account numbers',
      'Gmail address for "management company"',
      'No secure portal — just reply to email with sensitive data',
      'Small application fee ($35) to seem legitimate while harvesting your identity'
    ],
    correctAction: 'DO NOT FILL OUT. This is identity theft disguised as a rental application. Legitimate landlords use secure portals and never ask for SSN via email.',
    lesson: 'Some rental scams don\'t want your deposit — they want your IDENTITY. By collecting SSN, bank info, and driver\'s license, scammers can open credit cards, take loans, and file tax returns in your name. Real landlords use secure application portals (like AppFolio or Zillow Rental Manager) — they never ask for sensitive info via email or text.'
  },

  'job-equipment': {
    title: 'Remote Work Equipment Scam',
    category: 'job',
    difficulty: 'beginner',
    surface: 'email',
    subject: 'Welcome to DataFlow Solutions — Next Steps',
    description: 'You got hired for a remote data entry job! But your new "employer" needs you to purchase equipment from their approved vendor before you can start...',
    stages: [
      {
        scenario: 'You received an email after applying to a remote job on a popular job board. The company, "DataFlow Solutions," is offering $28/hr for data entry work from home.',
        messages: [
          {
            sender: 'HR Manager — DataFlow Solutions',
            text: `Hi! Congratulations, we'd love to offer you the Remote Data Entry position at $28/hr. We were very impressed with your application.

Before we can get you started, we need to set up your workstation. We'll send you a check for $2,400 to cover equipment. Please deposit it, then purchase your setup from our approved vendor at dataflow-equipment-portal.com.

What's your full name and mailing address so we can send the check?`,
            isScam: true,
            hint: 'A real employer provides equipment directly — they never ask you to buy from a specific vendor with reimbursement.'
          }
        ],
        redFlags: [
          'Hired without a real interview',
          'Asks you to buy equipment from a "vendor" they specify',
          'Sending a check to deposit (classic overpayment scam)',
          'Unusually high pay for simple data entry',
          'Vague company with no verifiable presence'
        ],
        correctAction: 'STOP. Do not deposit any check or buy from their vendor. Research the company independently — call the real company directly using contact info from their official website, not what the email provides.',
        lesson: 'In a real equipment scam, the check bounces after you\'ve already spent money on their fake vendor site. You lose the money, and the "employer" disappears. Real companies ship equipment directly or have you use your own. Never deposit a check and send money elsewhere.'
      },
      {
        scenario: 'You haven\'t responded yet. They follow up urgently.',
        messages: [
          {
            sender: 'HR Manager — DataFlow Solutions',
            text: `Hi again! Just following up — we have 3 other candidates waiting for this position. We need your address by end of day to secure your spot.

Also, you'll need to purchase the equipment within 48 hours of receiving the check or the offer expires. Our vendor handles everything — laptop, headset, software licenses, ergonomic chair. It's all top-of-the-line!

This is a really great opportunity. Don't miss out! 🙂`,
            isScam: true,
            hint: 'Urgency + pressure + too-good-to-be-true benefits = scam playbook.'
          }
        ],
        redFlags: [
          'Artificial urgency ("end of day," "48 hours")',
          'Manufactured scarcity ("3 other candidates")',
          'Excessive enthusiasm to pressure you',
          'Still no real interview or contract',
          'Emojis from "HR" in professional context'
        ],
        correctAction: 'BLOCK and REPORT. This is a confirmed scam. Report the email to the job board where you found the posting, and to the FTC at reportfraud.ftc.gov.',
        lesson: 'Scammers create urgency to prevent you from thinking critically. A real employer gives you time, provides a written contract, and never pressures you to act immediately or lose the opportunity. If someone is pushing you to move fast with money — it\'s a scam.'
      }
    ]
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

// --- Scam Shield Bridge Integration ---
// Auto-imports real-world scam detections from Scam Shield
const path = require('path');
const fs = require('fs');
const BRIDGE_SIMS_PATH = path.resolve(__dirname, '..', 'shared', 'exported-sims', 'bridge-sims.js');

function loadBridgeSims() {
  if (fs.existsSync(BRIDGE_SIMS_PATH)) {
    try {
      const bridgeSims = require(BRIDGE_SIMS_PATH);
      let count = 0;
      for (const [key, sim] of Object.entries(bridgeSims)) {
        if (!SIMULATIONS[key]) {
          SIMULATIONS[key] = sim;
          count++;
        }
      }
      if (count > 0) {
        console.error(`[Scam Academy] Loaded ${count} bridge simulations from Scam Shield`);
      }
    } catch (e) {
      console.error(`[Scam Academy] Could not load bridge sims: ${e.message}`);
    }
  }
}

// Load bridge sims on startup
loadBridgeSims();

// Export
module.exports = { SIMULATIONS, getSimulation, getNextSimulation, getCategories, loadBridgeSims };

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
