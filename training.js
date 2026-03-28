#!/usr/bin/env node
/**
 * Scam Academy — Training Engine
 * Tracks user responses, provides lessons, adapts difficulty
 */

const fs = require('fs');
const path = require('path');
const { getNextSimulation, SIMULATIONS } = require('./simulations');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// --- User Management ---

function getUser(userId) {
  const file = path.join(DATA_DIR, `${userId}.json`);
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch(e) {
    return {
      id: userId,
      createdAt: new Date().toISOString(),
      role: 'trainee', // trainee or guardian
      familyId: null,
      completed: [],
      failedCategories: [],
      skillLevel: 'beginner',
      streak: 0,
      bestStreak: 0,
      totalSimulations: 0,
      totalPassed: 0,
      totalFailed: 0,
      points: 0,
      achievements: [],
      lastSimulation: null,
      nextSimulation: null,
      notifications: true
    };
  }
}

function saveUser(user) {
  fs.writeFileSync(path.join(DATA_DIR, `${user.id}.json`), JSON.stringify(user, null, 2));
}

// --- Family Management ---

function getFamily(familyId) {
  const file = path.join(DATA_DIR, `family_${familyId}.json`);
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch(e) {
    return {
      id: familyId,
      createdAt: new Date().toISOString(),
      guardianId: null,
      members: [],
      settings: {
        frequency: 'weekly', // daily, weekly, biweekly
        difficulty: 'auto', // beginner, intermediate, advanced, auto
        categories: 'all'
      }
    };
  }
}

function saveFamily(family) {
  fs.writeFileSync(path.join(DATA_DIR, `family_${family.id}.json`), JSON.stringify(family, null, 2));
}

// --- Training Logic ---

// Record a response to a simulation
function recordResponse(userId, simulationId, passed, responseTime = null) {
  const user = getUser(userId);
  const simulation = SIMULATIONS[simulationId];
  
  if (!simulation) return { error: 'Simulation not found' };

  user.totalSimulations++;
  user.lastSimulation = {
    id: simulationId,
    timestamp: new Date().toISOString(),
    passed,
    responseTime
  };

  if (passed) {
    user.totalPassed++;
    user.streak++;
    user.bestStreak = Math.max(user.bestStreak, user.streak);
    user.points += 10 + (user.streak * 2); // Bonus for streaks

    // Remove from failed categories if they passed
    user.failedCategories = user.failedCategories.filter(c => c !== simulation.category);
  } else {
    user.totalFailed++;
    user.streak = 0;
    user.points += 1; // Participation point

    // Track failed categories
    if (!user.failedCategories.includes(simulation.category)) {
      user.failedCategories.push(simulation.category);
    }
  }

  // Mark as completed
  user.completed.push({
    id: simulationId,
    passed,
    timestamp: new Date().toISOString(),
    responseTime
  });

  // Update skill level
  const passRate = user.totalPassed / user.totalSimulations;
  if (passRate > 0.8 && user.totalSimulations >= 5) {
    user.skillLevel = 'intermediate';
  }
  if (passRate > 0.8 && user.totalSimulations >= 15) {
    user.skillLevel = 'advanced';
  }

  // Check achievements
  checkAchievements(user);

  saveUser(user);

  return {
    passed,
    points: user.points,
    streak: user.streak,
    skillLevel: user.skillLevel,
    passRate: Math.round(passRate * 100),
    lesson: passed ? null : simulation.lesson,
    redFlags: passed ? null : simulation.redFlags
  };
}

// Get the next training simulation for a user
function getNextTraining(userId) {
  const user = getUser(userId);
  const simulation = getNextSimulation(user);

  if (!simulation) {
    return { message: 'You\'ve completed all available simulations! More coming soon.' };
  }

  user.nextSimulation = {
    id: simulation.id,
    scheduledAt: new Date().toISOString()
  };
  saveUser(user);

  return simulation;
}

// Get user stats
function getUserStats(userId) {
  const user = getUser(userId);
  const passRate = user.totalSimulations > 0
    ? Math.round((user.totalPassed / user.totalSimulations) * 100)
    : 0;

  return {
    totalSimulations: user.totalSimulations,
    totalPassed: user.totalPassed,
    totalFailed: user.totalFailed,
    passRate: `${passRate}%`,
    streak: user.streak,
    bestStreak: user.bestStreak,
    skillLevel: user.skillLevel,
    points: user.points,
    achievements: user.achievements,
    weakCategories: user.failedCategories,
    completedCount: user.completed.length,
    availableCount: Object.keys(SIMULATIONS).length - user.completed.length
  };
}

// Get family stats
function getFamilyStats(familyId) {
  const family = getFamily(familyId);
  const memberStats = [];

  for (const memberId of family.members) {
    const stats = getUserStats(memberId);
    memberStats.push({ memberId, ...stats });
  }

  return {
    familyId,
    memberCount: family.members.length,
    members: memberStats,
    settings: family.settings
  };
}

// --- Achievements ---

const ACHIEVEMENTS = [
  { id: 'first_lesson', name: '🎓 First Lesson', desc: 'Completed first simulation', condition: (u) => u.totalSimulations >= 1 },
  { id: 'streak_5', name: '🔥 On Fire', desc: '5 correct in a row', condition: (u) => u.streak >= 5 },
  { id: 'streak_10', name: '⚡ Unstoppable', desc: '10 correct in a row', condition: (u) => u.streak >= 10 },
  { id: 'all_categories', name: '🏆 Well Rounded', desc: 'Completed simulations in all categories', condition: (u) => {
    const cats = new Set(u.completed.map(c => SIMULATIONS[c.id]?.category));
    return cats.size >= 5;
  }},
  { id: 'perfect_10', name: '💯 Perfect 10', desc: '10 simulations with 100% pass rate', condition: (u) => u.totalSimulations >= 10 && u.totalPassed === u.totalSimulations },
  { id: 'phishing_master', name: '🎣 Phishing Master', desc: 'Passed all phishing simulations', condition: (u) => {
    const phishing = u.completed.filter(c => SIMULATIONS[c.id]?.category === 'phishing');
    return phishing.length >= 3 && phishing.every(c => c.passed);
  }},
  { id: 'scam_expert', name: '🛡️ Scam Expert', desc: 'Passed 20+ simulations', condition: (u) => u.totalPassed >= 20 },
];

function checkAchievements(user) {
  for (const a of ACHIEVEMENTS) {
    if (!user.achievements.includes(a.id) && a.condition(user)) {
      user.achievements.push(a.id);
    }
  }
}

// --- Exports ---
module.exports = {
  getUser, saveUser,
  getFamily, saveFamily,
  recordResponse, getNextTraining,
  getUserStats, getFamilyStats,
  ACHIEVEMENTS, SIMULATIONS
};

// CLI
if (require.main === module) {
  const action = process.argv[2] || 'next';
  const userId = process.argv[3] || 'demo';

  if (action === 'next') {
    console.log(JSON.stringify(getNextTraining(userId), null, 2));
  } else if (action === 'stats') {
    console.log(JSON.stringify(getUserStats(userId), null, 2));
  }
}
