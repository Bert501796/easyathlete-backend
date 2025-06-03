const athleteData = { ...(await getUserOnboardingData(userId)), userId };
const buildRunningEndurance = (athleteData, dayMeta) => {
  return [
    { role: 'system', content: 'You are a running coach designing endurance runs.' },
    {
      role: 'user',
      content: `Create an endurance run:
- Athlete Level: ${athleteData.level}
- Duration: ${dayMeta.duration} min
- Zones: ${JSON.stringify(athleteData.heartRateZones)}

Output JSON with: sport, segments (duration, zone, heartRateMin, heartRateMax), notes`
    }
  ];
};

module.exports = buildRunningEndurance;
