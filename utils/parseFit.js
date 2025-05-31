const FitParser = require('fit-file-parser').default;
const fs = require('fs');

const parseFitFile = async (localPath) => {
  return new Promise((resolve, reject) => {
    const parser = new FitParser({
      force: true,
      speedUnit: 'km/h',
      lengthUnit: 'km',
      temperatureUnit: 'celsius',
      elapsedRecordField: true,
      mode: 'list'
    });

    let buffer;
    try {
      buffer = fs.readFileSync(localPath);
    } catch (err) {
      console.error(`❌ Failed to read file: ${localPath}`, err.message);
      return reject(err);
    }

    parser.parse(buffer, (error, data) => {
      if (error) {
        console.error(`❌ Failed to parse file: ${localPath}`, error.message);
        return reject(error);
      }

      const sessions = data.sessions || data.activity?.sessions || [];

      if (!sessions.length) {
        console.warn(`⚠️ No sessions found in file: ${localPath}`);
        return resolve([]);
      }

      // 🔍 Extract resting heart rate from monitoring records
      const monitoringRecords = data.monitoring || [];
      const restingHeartRates = monitoringRecords
        .map((record) => record.resting_heart_rate)
        .filter((val) => typeof val === 'number');

      const restingHeartRate = restingHeartRates.length > 0
        ? Math.min(...restingHeartRates)
        : null;

      const summary = sessions.map((session) => ({
        sport: session.sport,
        startTime: session.start_time,
        totalTimeMinutes: (session.total_timer_time || 0) / 60,
        distanceKm: (session.total_distance || 0) / 1000,
        avgHeartRate: session.avg_heart_rate || null,
        maxHeartRate: session.max_heart_rate || null,
        avgSpeed: session.avg_speed || null,
        elevationGain: session.total_ascent || null,
        elevationLoss: session.total_descent || null,
        restingHeartRate // 🫀 Include extracted value here
      }));

      console.log(`✅ Parsed ${summary.length} session(s) from file: ${localPath}`);
      resolve(summary);
    });
  });
};

module.exports = { parseFitFile };
