#!/usr/bin/env node
/**
 * Scam Academy — Live Scam Monitor
 * Monitors real-world scam trends and updates simulation templates
 * Sources: Reddit r/Scams, FTC alerts, news, crypto scam reports
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

function httpReq(url) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      headers: { 'User-Agent': 'ScamAcademy/1.0' },
      timeout: 15000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
}

// --- Scam Trend Sources ---

// 1. Reddit r/Scams — Real people posting about scams they encountered
async function getRedditScams() {
  const scams = [];
  try {
    const res = await httpReq('https://www.reddit.com/r/Scams/top.rss?t=week');
    if (res.status === 200) {
      const titles = (res.body.match(/<title[^>]*>([^<]+)<\/title>/gi) || [])
        .map(t => t.replace(/<[^>]+>/g, '').trim())
        .filter(t => t.length > 20 && !t.includes('top scoring'));

      for (const title of titles.slice(0, 15)) {
        // Extract scam type from title
        let category = 'unknown';
        const lower = title.toLowerCase();
        if (/phish|email|fake.*site|link/i.test(lower)) category = 'phishing';
        if (/romance|dating|catfish/i.test(lower)) category = 'romance';
        if (/crypto|bitcoin|wallet|nft/i.test(lower)) category = 'crypto';
        if (/phone|call|voicemail|text/i.test(lower)) category = 'phone';
        if (/prize|lottery|winner|giveaway/i.test(lower)) category = 'prize';
        if (/irs|tax|refund/i.test(lower)) category = 'tax';
        if (/tech support|virus|microsoft/i.test(lower)) category = 'tech_support';
        if (/grandparent|bail|emergency/i.test(lower)) category = 'grandparent';
        if (/job|work.*home|employment/i.test(lower)) category = 'job';
        if (/rental|apartment|housing/i.test(lower)) category = 'rental';
        if (/zelle|venmo|cash.?app|wire/i.test(lower)) category = 'payment';

        scams.push({
          source: 'r/Scams',
          title,
          category,
          type: 'user_report',
          date: new Date().toISOString()
        });
      }
    }
  } catch(e) {}
  return scams;
}

// 2. FTC Consumer Alerts
async function getFTCAlerts() {
  const alerts = [];
  try {
    const res = await httpReq('https://www.ftc.gov/rss/consumer-protection');
    if (res.status === 200) {
      const titles = (res.body.match(/<title[^>]*>([^<]+)<\/title>/gi) || [])
        .map(t => t.replace(/<[^>]+>/g, '').trim())
        .filter(t => t.length > 10)
        .slice(0, 10);

      for (const title of titles) {
        alerts.push({
          source: 'FTC',
          title,
          type: 'government_alert',
          date: new Date().toISOString()
        });
      }
    }
  } catch(e) {}
  return alerts;
}

// 3. Crypto scam trends
async function getCryptoScams() {
  const scams = [];
  try {
    const res = await httpReq('https://www.reddit.com/r/CryptoScams/top.rss?t=month');
    if (res.status === 200) {
      const titles = (res.body.match(/<title[^>]*>([^<]+)<\/title>/gi) || [])
        .map(t => t.replace(/<[^>]+>/g, '').trim())
        .filter(t => t.length > 15)
        .slice(0, 10);

      for (const title of titles) {
        scams.push({
          source: 'r/CryptoScams',
          title,
          category: 'crypto',
          type: 'user_report',
          date: new Date().toISOString()
        });
      }
    }
  } catch(e) {}
  return scams;
}

// 4. Check for new scam patterns to add
function analyzeTrends(allScams) {
  const categories = {};
  for (const scam of allScams) {
    const cat = scam.category || 'unknown';
    categories[cat] = (categories[cat] || 0) + 1;
  }

  const trending = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return {
    totalScams: allScams.length,
    byCategory: categories,
    trending: trending.map(([cat, count]) => ({ category: cat, mentions: count })),
    newTemplatesNeeded: trending
      .filter(([cat, count]) => count >= 3)
      .map(([cat]) => cat)
  };
}

// --- Main ---
async function main() {
  const report = {
    timestamp: new Date().toISOString(),
    scams: [],
    trends: {},
    recommendations: []
  };

  console.error('Scanning scam sources...');

  const [reddit, ftc, crypto] = await Promise.all([
    getRedditScams(),
    getFTCAlerts(),
    getCryptoScams()
  ]);

  report.scams = [...reddit, ...ftc, ...crypto];
  report.trends = analyzeTrends(report.scams);

  // Generate recommendations for new templates
  for (const cat of report.trends.newTemplatesNeeded || []) {
    const examples = report.scams
      .filter(s => s.category === cat)
      .map(s => s.title)
      .slice(0, 3);

    report.recommendations.push({
      category: cat,
      action: `Add new ${cat} simulation`,
      evidence: examples
    });
  }

  console.log(JSON.stringify(report, null, 2));
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
