// utils/enrichActivity.js
const axios = require('axios');
const StravaActivity = require('../models/StravaActivity');

const ENRICHMENT_VERSION = 1; // bump this when logic updates

const getHRZone = (hr, maxHr = 190) => {
  const percent = hr / maxHr;
  if (percent < 0.6) return 1;
  if (percent < 0.7) return 2;
  if (percent < 0.8) return 3;
  if (percent < 0.9) return 4;
  return 5;
};

const enrichActivity = async (activity, accessToken) => {
  const existing = await StravaActivity.findOne({ stravaId: activity.id, userId: activity.athlete?.id?.toString() });

  // // ✅ Skip enrichment if already enriched and up-to-date
  // if (
  //   existing &&
  //   existing.streamEnriched === true &&
  //   existing.enrichmentVersion >= ENRICHMENT_VERSION
  // ) {
  //   console.log(`⏭️ Skipping enrichment for ${activity.id} (already enriched v${existing.enrichmentVersion})`);
  //   return { ...existing.toObject(), alreadyEnriched: true };
  // }

  let zoneDistribution = [];
  let hrZoneBuckets = [0, 0, 0, 0, 0];

  let heartRateStream = [];
  let timeStream = [];
  let cadenceStream = [];
  let wattsStream = [];
  let speedStream = [];
  let altitudeStream = [];
  let distanceStream = [];
  let latlngStream = [];
  let stream_data_full = [];

  try {
    const streamRes = await axios.get(
      `https://www.strava.com/api/v3/activities/${activity.id}/streams`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          keys: 'time,heartrate,watts,cadence,velocity_smooth,altitude,distance,latlng',
          key_by_type: true
        }
      }
    );

    const streamData = streamRes.data;

    heartRateStream = streamData.heartrate?.data || [];
    timeStream = streamData.time?.data || [];
    cadenceStream = streamData.cadence?.data || [];
    wattsStream = streamData.watts?.data || [];
    speedStream = streamData.velocity_smooth?.data || [];
    altitudeStream = streamData.altitude?.data || [];
    distanceStream = streamData.distance?.data || [];
    latlngStream = streamData.latlng?.data || [];

    // ✅ Calculate HR zones
    for (let i = 0; i < heartRateStream.length; i++) {
      const zone = getHRZone(heartRateStream[i]);
      if (zone >= 1 && zone <= 5) hrZoneBuckets[zone - 1] += 1;
    }

    const total = hrZoneBuckets.reduce((a, b) => a + b, 0);
    zoneDistribution = hrZoneBuckets.map(z => total ? +(z / total * 100).toFixed(1) : 0);

    // ✅ Determine max stream length across all available streams
    const streamLengths = [
      timeStream?.length || 0,
      heartRateStream?.length || 0,
      cadenceStream?.length || 0,
      wattsStream?.length || 0,
      speedStream?.length || 0,
      altitudeStream?.length || 0,
      distanceStream?.length || 0
    ];
    const length = Math.max(...streamLengths);

    // ✅ Build full stream data safely with null fallbacks
    for (let i = 0; i < length; i++) {
      stream_data_full.push({
        time_sec: timeStream?.[i] ?? null,
        heart_rate: heartRateStream?.[i] ?? null,
        watts: wattsStream?.[i] ?? null,
        speed: speedStream?.[i] ?? null,
        cadence: cadenceStream?.[i] ?? null,
        altitude: altitudeStream?.[i] ?? null,
        distance: distanceStream?.[i] ?? null
      });
    }

  } catch (err) {
    console.warn(`⚠️ Failed to fetch streams for activity ${activity.id}: ${err.response?.data?.message || err.message}`);
  }

  const distanceKm = activity.distance ? activity.distance / 1000 : 0;
  const movingTimeMin = activity.moving_time ? activity.moving_time / 60 : 0;
  const avgHR = activity.average_heartrate || 0;

  const paceMinPerKm = distanceKm ? +(movingTimeMin / distanceKm).toFixed(2) : null;
  const hrEfficiency = avgHR ? +(paceMinPerKm / avgHR).toFixed(4) : null;
  const elevationPerKm = distanceKm ? +(activity.total_elevation_gain / distanceKm).toFixed(2) : null;
  const estimatedLoad = avgHR && movingTimeMin ? +(avgHR * movingTimeMin / 100).toFixed(2) : null;

  return {
    ...activity,
    zoneDistribution,
    hrZoneBuckets,
    distanceKm,
    movingTimeMin,
    paceMinPerKm,
    hrEfficiency,
    elevationPerKm,
    estimatedLoad,
    heartRateStream,
    timeStream,
    cadenceStream,
    wattsStream,
    speedStream,
    altitudeStream,
    distanceStream,
    latlngStream,
    stream_data_full,
    streamEnriched: true,
    enrichmentVersion: ENRICHMENT_VERSION
  };
};

module.exports = { enrichActivity };
