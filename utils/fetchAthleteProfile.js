// utils/fetchAthleteProfile.js
const axios = require('axios');
const User = require('../models/User');

const fetchAthleteProfile = async (accessToken, userId) => {
  try {
    // Check if user already has birthYear — if so, skip unnecessary API call
    const existingUser = await User.findById(userId);
    if (existingUser && existingUser.birthYear) {
      console.log(`ℹ️ User ${userId} already has birthYear. Skipping Strava profile fetch.`);
      return;
    }

    const { data } = await axios.get('https://www.strava.com/api/v3/athlete', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const {
      sex,
      weight,
      ftp,
      city,
      country,
      profile_medium,
      profile,
      created_at,
      updated_at,
      date_preference,
      measurement_preference,
      clubs,
      firstname,
      lastname,
      birth_year
    } = data;

    // Calculate age if birth_year is available
    let birthYear = birth_year || null;
    let age = birthYear ? new Date().getFullYear() - birthYear : null;

    await User.updateOne(
      { _id: userId },
      {
        $set: {
          sex,
          weight,
          ftp,
          city,
          country,
          stravaCreatedAt: created_at,
          stravaUpdatedAt: updated_at,
          datePreference: date_preference,
          measurementPreference: measurement_preference,
          profilePic: profile,
          profilePicMedium: profile_medium,
          clubs,
          firstName: firstname,
          lastName: lastname,
          birthYear,
          age
        }
      }
    );

    console.log(`✅ Strava profile updated for user ${userId}`);
  } catch (err) {
    console.error(`❌ Failed to fetch Strava athlete profile for ${userId}:`, err.message);
  }
};

module.exports = { fetchAthleteProfile };
