// src/routes/onboardingBot.js
const express = require('express');
const { OpenAI } = require('openai');
const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post('', async (req, res) => {
  const { userId, conversation } = req.body;

 if (!conversation || !Array.isArray(conversation)) {
  return res.status(400).json({ error: 'Missing or invalid conversation array' });
}
console.log('📨 Incoming onboarding message:', { userId, conversation });


  try {
    const chatHistory = conversation.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text || msg.content
    }));

    chatHistory.unshift({
      role: 'system',
      content: `You are a friendly and expert onboarding assistant for endurance athletes. 
Your job is to help users set a training goal and gather all the needed information to build a customized training plan. Important is to understand the primary goal (race, weight loss, etc.) By when they want to achieve that goal. We provide strava connection by default in the conversation. If they don't want to connect to strava ask further question about ongest recent workout, times/week they can train
Ask one question at a time. When you have enough information, reply with 'Thanks, I have everything I need!'`
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: chatHistory,
      temperature: 0.6
    });

    const reply = completion.choices?.[0]?.message?.content?.trim();
    const finished = reply.toLowerCase().includes("i have everything i need");

    res.json({ reply, finished });
  } catch (error) {
    console.error('❌ Error generating onboarding bot reply:', error);
    res.status(500).json({ error: 'Failed to generate onboarding reply' });
  }
});

module.exports = router;
