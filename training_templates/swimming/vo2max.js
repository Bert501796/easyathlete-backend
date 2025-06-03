const buildSwimmingVO2Max = (athleteData, dayMeta) => [
  { role: 'system', content: 'You are a swim coach creating high intensity VO2 max sets.' },
  {
    role: 'user',
    content: `Design a VO2 max swim workout.
- Level: ${athleteData.level}
- Duration: ${dayMeta.duration} min

Return JSON with: sport, intervals (distance, effort, rest), warmup, cooldown, notes.`
  }
];

module.exports = buildSwimmingVO2Max;
