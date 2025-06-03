const buildRunningIntervals = (athleteData, dayMeta) => {
  return [
    { role: 'system', content: 'You are a running coach designing interval workouts.' },
    {
      role: 'user',
      content: `Create a running interval session:
- Athlete Level: ${athleteData.level}
- Duration: ${dayMeta.duration} min
- Target Zones: Zone 4-5
- Zones: ${JSON.stringify(athleteData.heartRateZones)}

Output JSON with: sport, segments (duration, zone, heartRateMin, heartRateMax), notes`
    }
  ];
};

module.exports = buildRunningIntervals;