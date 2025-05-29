const FitParser = require('fit-file-parser').default;
const fs = require('fs');

const parseFitFile = async (localPath) => {
  return new Promise((resolve, reject) => {
    const parser = new FitParser({ force: true });

    const buffer = fs.readFileSync(localPath);

    parser.parse(buffer, function (error, data) {
      if (error) return reject(error);

      const sessions = data.activity?.sessions || [];

      const summary = sessions.map((session) => ({
        sport: session.sport,
        startTime: session.start_time,
        totalTimeMinutes: (session.total_timer_time || 0) / 60,
        distanceKm: (session.total_distance || 0) / 1000,
        avgHeartRate: session.avg_heart_rate || null,
        maxHeartRate: session.max_heart_rate || null,
        avgSpeed: session.avg_speed || null,
        elevationGain: session.total_ascent || null,
        elevationLoss: session.total_descent || null
      }));

      resolve(summary);
    });
  });
};

module.exports = { parseFitFile };
