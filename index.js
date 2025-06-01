const express = require('express');
const cors = require('cors');
require('dotenv').config();
const uploadFitRoute = require('./routes/upload-fit'); // ✅ Import the route
const onboardingRoute = require('./routes/onboarding');
const aiPromptRoute = require('./routes/aiPrompt');


const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(uploadFitRoute); // ✅ Enable the .fit file upload route
app.use(onboardingRoute);
app.use(aiPromptRoute);

app.get('/', (req, res) => {
  res.send('EasyAthlete API is running ✅');
});

app.post('/strava/exchange', async (req, res) => {
  const { code, userId } = req.body;

  if (!code || !userId) {
    return res.status(400).json({ error: 'Missing code or userId' });
  }

  try {
    console.log(`🔁 Exchanging Strava code for user: ${userId}`);

    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.access_token) {
      console.error('❌ Strava token exchange failed:', data);
      return res.status(500).json({ error: 'Token exchange failed' });
    }

    const { access_token, refresh_token, expires_at } = data;

    console.log(`✅ Access token for ${userId}:`, access_token);

    // You could store tokens here temporarily for future use (optional MVP logic)
    // global.tokenStore = global.tokenStore || {};
    // global.tokenStore[userId] = { access_token, refresh_token, expires_at };

    res.status(200).json({ access_token });
  } catch (error) {
    console.error('❌ Error during token exchange:', error);
    res.status(500).json({ error: 'Strava token exchange failed' });
  }
});


app.listen(PORT, () => {
  console.log(`✅ EasyAthlete API running on http://localhost:${PORT}`);
});
