const athleteData = { ...(await getUserOnboardingData(userId)), userId };
const buildCyclingIndoorVO2Max = (athleteData, dayMeta) => {
  return [
    { role: 'system', content: 'You are a VO2 max training expert for indoor cycling workouts.' },
    {
      role: 'user',
      content: `Develop a VO2 max indoor cycling workout:
- Athlete Level: ${athleteData.level}
- Duration: ${dayMeta.duration} minutes
- Heart Rate Zones: ${JSON.stringify(athleteData.heartRateZones)}

Return JSON: sport, segments (duration, zone, heartRateMin, heartRateMax), and breathing/effort advice.`
    }
  ];
};

module.exports = buildCyclingIndoorVO2Max;