const fetch = require('node-fetch');

async function queryOpenRouter(prompt, systemPrompt = '') {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'Oil & Gas Well Production Forecaster'
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5',
      messages: [
        { role: 'system', content: systemPrompt || 'You are an expert petroleum engineer and data analyst specializing in oil and gas production optimization. Provide detailed, professional analysis with specific recommendations. Format your response with clear sections using markdown headers (##), bullet points, and bold text for key metrics.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.7
    })
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message || 'OpenRouter API error');
  }
  return data.choices[0].message.content;
}

module.exports = { queryOpenRouter };
