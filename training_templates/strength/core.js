const buildStrengthCore = (athleteData, dayMeta) => {
  return [
    { role: 'system', content: 'You are a professional strength coach focused on developing core strength in endurance athletes.' },
    {
      role: 'user',
      content: `Create a 30-minute core workout for:
- Athlete Level: ${athleteData.level}
- Goals: ${athleteData.goal}

Output JSON with: sport, segments (with duration, exercise, reps, sets), notes`
    }
  ];
};

module.exports = buildStrengthCore;
