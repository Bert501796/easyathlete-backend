const buildStrengthLowerBody = (athleteData, dayMeta) => {
  return [
    { role: 'system', content: 'You are a certified strength coach focusing on lower body development for athletes.' },
    {
      role: 'user',
      content: `Design a ${dayMeta.duration}-minute lower body workout for:
- Athlete Level: ${athleteData.level}
- Goals: ${athleteData.goal}

Output JSON with: sport, segments (exercise, sets, reps, intensity), notes`
    }
  ];
};

module.exports = buildStrengthLowerBody;