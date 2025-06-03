const buildCyclingOutdoorVo2max = (athleteData, dayMeta) => {
  return [
    { role: 'system', content: 'You are a cycling coach focused on improving VO2max through intense outdoor intervals.' },
    {
      role: 'user',
      content: `Design a VO2max session for:
- Athlete Level: ${athleteData.level}
- Duration: ${dayMeta.duration} min
- Focus: Zone 5 intervals
- Zones: ${JSON.stringify(athleteData.heartRateZones)}

Output JSON with: sport, segments (duration, zone, heartRateMin, heartRateMax), notes`
    }
  ];
};

module.exports = buildCyclingOutdoorVo2max;
