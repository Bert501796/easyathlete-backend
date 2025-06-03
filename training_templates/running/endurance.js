const buildRunningEndurancePrompt = (athleteData, dayMeta) => {
  return [
    { role: 'system', content: 'You are an elite running coach focused on endurance training.' },
    {
      role: 'user',
      content: `Create an endurance run for:
- Athlete Level: ${athleteData.level}
- Duration: ${dayMeta.duration} min
- Zones: ${JSON.stringify(athleteData.heartRateZones)}

Output JSON with: sport, segments (with duration, zone, heartRateMin, heartRateMax), notes`
    }
  ];
};

module.exports = buildRunningEndurancePrompt;