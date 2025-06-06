const buildCyclingOutdoorEndurance = (athleteData, dayMeta) => {
  return [
    { role: 'system', content: 'You are a professional outdoor cycling coach specialized in endurance development.' },
    {
      role: 'user',
      content: `Create an outdoor endurance cycling workout for:
- Athlete Level: ${athleteData.level}
- Duration: ${dayMeta.duration} minutes
- Heart Rate Zones: ${JSON.stringify(athleteData.heartRateZones)}

Output a JSON with: sport, segments (duration, zone, heartRateMin, heartRateMax), and additional coaching notes.`
    }
  ];
};

module.exports = buildCyclingOutdoorEndurance;