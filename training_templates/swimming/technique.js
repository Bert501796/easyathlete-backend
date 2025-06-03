const athleteData = { ...(await getUserOnboardingData(userId)), userId };
const buildSwimmingTechnique = (athleteData, dayMeta) => [
  { role: 'system', content: 'You are a swim coach focused on stroke and technique improvement.' },
  {
    role: 'user',
    content: `Design a swim technique session.
- Level: ${athleteData.level}
- Duration: ${dayMeta.duration} min

Return JSON with: sport, drills (name, description, distance), warmup, cooldown, notes.`
  }
];

module.exports = buildSwimmingTechnique;