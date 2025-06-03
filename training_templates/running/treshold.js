const buildRunningTreshold = (athleteData, dayMeta) => {
  return [
    { role: 'system', content: 'You are a running coach designing threshold workouts.' },
    {
      role: 'user',
      content: `Create a threshold training run:
- Athlete Level: ${athleteData.level}
- Duration: ${dayMeta.duration} min
- Threshold: Zone 4
- Zones: ${JSON.stringify(athleteData.heartRateZones)}

Output JSON with: sport, segments (duration, zone, heartRateMin, heartRateMax), notes`
    }
  ];
};

module.exports = buildRunningTreshold;
