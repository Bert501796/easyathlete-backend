const buildSwimmingIntervals = (athleteData, dayMeta) => [
  { role: 'system', content: 'You are a swim coach creating interval workouts for performance.' },
  {
    role: 'user',
    content: `Design a swim interval session.
- Level: ${athleteData.level}
- Duration: ${dayMeta.duration} min

Return JSON with: sport, intervals (distance, effort, rest), warmup, cooldown, notes.`
  }
];

module.exports = buildSwimmingIntervals;