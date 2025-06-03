const athleteData = { ...(await getUserOnboardingData(userId)), userId };
const buildCyclingOutdoorRecovery = (athleteData, dayMeta) => {
  return [
    { role: 'system', content: 'You are a professional cycling coach specializing in recovery sessions.' },
    {
      role: 'user',
      content: `Create an easy outdoor recovery ride for:
- Athlete Level: ${athleteData.level}
- Duration: ${dayMeta.duration} minutes
- Heart Rate Zones: ${JSON.stringify(athleteData.heartRateZones)}

Output JSON: sport, segments (duration, zone, heartRateMin, heartRateMax), and short recovery tips.`
    }
  ];
};

module.exports = buildCyclingOutdoorRecovery;
