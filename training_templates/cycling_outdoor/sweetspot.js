const athleteData = { ...(await getUserOnboardingData(userId)), userId };
const buildCyclingOutdoorSweetSpot = (athleteData, dayMeta) => {
  return [
    { role: 'system', content: 'You are a top-tier outdoor cycling coach focused on sweet spot training.' },
    {
      role: 'user',
      content: `Design a sweet spot outdoor cycling session for:
- Athlete Level: ${athleteData.level}
- Duration: ${dayMeta.duration} minutes
- Heart Rate Zones: ${JSON.stringify(athleteData.heartRateZones)}

Provide JSON with: sport, segments (duration, zone, heartRateMin, heartRateMax), plus guidance for pacing and perceived effort.`
    }
  ];
};

module.exports = buildCyclingOutdoorSweetSpot;