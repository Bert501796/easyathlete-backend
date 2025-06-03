const athleteData = { ...(await getUserOnboardingData(userId)), userId };
const buildRunningRecovery = (athleteData, dayMeta) => {
  return [
    { role: 'system', content: 'You are a running coach prescribing recovery runs.' },
    {
      role: 'user',
      content: `Create a recovery run:
- Athlete Level: ${athleteData.level}
- Duration: ${dayMeta.duration} min
- Target: Zone 1
- Zones: ${JSON.stringify(athleteData.heartRateZones)}

Output JSON with: sport, segments (duration, zone, heartRateMin, heartRateMax), notes`
    }
  ];
};

module.exports = buildRunningRecovery;