const buildStrengthMobility = (athleteData, dayMeta) => {
  return [
    { role: 'system', content: 'You are a mobility expert helping athletes improve range of motion and prevent injuries.' },
    {
      role: 'user',
      content: `Generate a ${dayMeta.duration}-minute mobility session for:
- Athlete Level: ${athleteData.level}
- Sport: ${athleteData.primarySport}

Output JSON with: sport, segments (stretch or movement, duration, side if relevant), notes`
    }
  ];
};

module.exports = buildStrengthMobility;
