const athleteData = { ...(await getUserOnboardingData(userId)), userId };
const buildCyclingIndoorThreshold = (athleteData, dayMeta) => {
  return [
    { role: 'system', content: 'You are a coach specializing in indoor threshold power training for cyclists.' },
    {
      role: 'user',
      content: `Design an indoor threshold power workout:
- Athlete Level: ${athleteData.level}
- Duration: ${dayMeta.duration} minutes
- Heart Rate Zones: ${JSON.stringify(athleteData.heartRateZones)}

Output format: JSON with sport, segments (duration, zone, heartRateMin, heartRateMax), and motivational notes.`
    }
  ];
};

module.exports = buildCyclingIndoorThreshold;