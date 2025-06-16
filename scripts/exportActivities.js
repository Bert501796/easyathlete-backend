const mongoose = require('mongoose');
const fs = require('fs');
const StravaActivity = require('../models/StravaActivity');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:wGGXpgRpOFRvySOUePtrWYKNJPajAxNN@mongodb.railway.internal:27017';

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const activities = await StravaActivity.find().lean();

    fs.writeFileSync('strava_activities_export.json', JSON.stringify(activities, null, 2));
    console.log(`✅ Exported ${activities.length} activities to strava_activities_export.json`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error exporting:', err);
    process.exit(1);
  }
};

run();
