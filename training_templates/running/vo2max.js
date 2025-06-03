const athleteData = { ...(await getUserOnboardingData(userId)), userId };
const buildRunningVo2max = (athleteData, dayMeta) => {
  return [
    { role: 'system', content: 'You are a running coach designing VO2max sessions.' },
    {
      role: 'user',
      content: `Create a VO2max training run:
- Athlete Level: ${athleteData.level}
- Duration: ${dayMeta.duration} min
- VO2max Target: Zone 5
- Zones: ${JSON.stringify(athleteData.heartRateZones)}

Output JSON with: sport, segments (duration, zone, heartRateMin, heartRateMax), notes`
    }
  ];
};

module.exports = buildRunningVo2max;
