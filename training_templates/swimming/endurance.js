const buildSwimmingEndurance = (athleteData, dayMeta) => [
  { role: 'system', content: 'You are a swim coach creating endurance workouts.' },
  {
    role: 'user',
    content: `Design an endurance swim session.
- Level: ${athleteData.level}
- Duration: ${dayMeta.duration} min

Return JSON with: sport, warmup, mainSet, cooldown, notes.`
  }
];

module.exports = buildSwimmingEndurance;