const athleteData = { ...(await getUserOnboardingData(userId)), userId };
const buildStrengthFullBody = (athleteData, dayMeta) => {
  return [
    { role: 'system', content: 'You are a professional strength coach focusing on full-body workouts for endurance athletes.' },
    {
      role: 'user',
      content: `Create a ${dayMeta.duration}-minute full-body strength workout for:
- Athlete Level: ${athleteData.level}
- Available Equipment: ${athleteData.equipment || 'Bodyweight only'}

Output JSON with: sport, segments (exercise, sets, reps, rest), notes`
    }
  ];
};

module.exports = buildStrengthFullBody;