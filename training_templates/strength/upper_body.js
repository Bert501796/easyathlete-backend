const buildStrengthUpperBody = (athleteData, dayMeta) => {
  return [
    { role: 'system', content: 'You are a certified strength coach creating upper body workouts tailored for endurance athletes.' },
    {
      role: 'user',
      content: `Create a ${dayMeta.duration}-minute upper body strength training session for:
- Athlete Level: ${athleteData.level}
- Focus Areas: Shoulders, back, arms

Output JSON with: sport, segments (exercise, sets, reps, rest), notes`
    }
  ];
};

module.exports = buildStrengthUpperBody;