const athleteData = { ...(await getUserOnboardingData(userId)), userId };
const buildSwimmingTreshold = (athleteData, dayMeta) => [
  { role: 'system', content: 'You are a swim coach designing lactate threshold workouts.' },
  {
    role: 'user',
    content: `Design a swim workout for improving lactate threshold.
- Level: ${athleteData.level}
- Duration: ${dayMeta.duration} min

Return JSON with: sport, mainSet (distance, intensity), warmup, cooldown, notes.`
  }
];

module.exports = buildSwimmingTreshold;