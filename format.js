#!/usr/bin/env node
const chunks = [];
process.stdin.on('data', chunk => chunks.push(chunk));
process.stdin.on('end', () => {
  const r = JSON.parse(chunks.join(''));
  const lines = [];

  if (r.error) {
    lines.push(`❌ ${r.error}`);
    console.log(lines.join('\n'));
    return;
  }

  // Simulation output
  if (r.category && r.body) {
    const surfaceEmoji = { email: '📧', sms: '📱', chat: '💬', phone: '📞', popup: '🖥️', social: '🐦' };
    const difficultyEmoji = { beginner: '🟢', intermediate: '🟡', advanced: '🔴' };

    lines.push(`${surfaceEmoji[r.surface] || '📨'} **SCAM ACADEMY — Training Simulation**`);
    lines.push(`${difficultyEmoji[r.difficulty] || '⚪'} Difficulty: ${r.difficulty}`);
    lines.push(`Category: ${r.category}`);
    lines.push('');

    if (r.subject) {
      lines.push(`**Subject:** ${r.subject}`);
      lines.push('');
    }

    lines.push('```');
    lines.push(r.body);
    lines.push('```');
    lines.push('');

    lines.push(`**Is this a scam?** Reply with:`);
    lines.push(`✅ /pass — I recognized it as a scam`);
    lines.push(`❌ /fail — I fell for it`);
    lines.push('');
    lines.push(`_This is a training exercise. Your response helps us personalize your learning._`);
  }
  // Stats output
  else if (r.totalSimulations !== undefined) {
    lines.push(`📊 **Your Scam Academy Progress**`);
    lines.push('');
    lines.push(`**Level:** ${r.skillLevel}`);
    lines.push(`**Points:** ${r.points}`);
    lines.push(`**Streak:** ${r.streak} (Best: ${r.bestStreak})`);
    lines.push('');
    lines.push(`**Simulations:** ${r.totalSimulations} total`);
    lines.push(`  ✅ Passed: ${r.totalPassed}`);
    lines.push(`  ❌ Failed: ${r.totalFailed}`);
    lines.push(`  📈 Pass rate: ${r.passRate}`);
    lines.push('');

    if (r.weakCategories && r.weakCategories.length > 0) {
      lines.push(`**⚠️ Needs practice:** ${r.weakCategories.join(', ')}`);
    }

    if (r.achievements && r.achievements.length > 0) {
      lines.push(`**🏆 Achievements:** ${r.achievements.join(' ')}`);
    }

    lines.push(`**📚 Remaining:** ${r.availableCount} simulations available`);
  }
  // Response result
  else if (r.passed !== undefined) {
    if (r.passed) {
      lines.push(`✅ **Correct!** You spotted the scam!`);
      lines.push(`+${r.points > 10 ? 10 + r.streak * 2 : 10} points`);
      if (r.streak > 1) lines.push(`🔥 Streak: ${r.streak}`);
    } else {
      lines.push(`❌ **You fell for it!** But don't worry — that's how we learn.`);
      lines.push('');
      if (r.lesson) {
        lines.push(`**💡 Lesson:**`);
        lines.push(r.lesson);
      }
      if (r.redFlags) {
        lines.push('');
        lines.push(`**🚩 Red flags you missed:**`);
        for (const f of r.redFlags) {
          lines.push(`  • ${f}`);
        }
      }
    }
    lines.push('');
    lines.push(`Pass rate: ${r.passRate}% | Skill level: ${r.skillLevel}`);
  }

  console.log(lines.join('\n'));
});
