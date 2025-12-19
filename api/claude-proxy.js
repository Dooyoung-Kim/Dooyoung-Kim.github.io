/**
 * Vercel Serverless Function for Claude API Proxy
 * This solves the CORS issue by making API calls from the server side
 * 
 * Deploy this to Vercel:
 * 1. Install Vercel CLI: npm i -g vercel
 * 2. Run: vercel
 * 3. Or connect your GitHub repo to Vercel
 * 
 * The function will be available at: /api/claude-proxy
 */

export default async function handler(req, res) {
  // Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are allowed'
    });
  }

  try {
    const { apiKey, model, messages, system, maxTokens } = req.body;

    // Validate API key
    if (!apiKey) {
      return res.status(400).json({ 
        error: 'API key is required',
        message: 'Please provide a Claude API key in the request body'
      });
    }

    if (!apiKey.startsWith('sk-ant-')) {
      return res.status(400).json({ 
        error: 'Invalid API key format',
        message: 'API key must start with "sk-ant-"'
      });
    }

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid messages',
        message: 'Please provide an array of messages with at least one message'
      });
    }

    // Call Claude API
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model || 'claude-3-5-sonnet-20241022',
        max_tokens: maxTokens || 2048,
        system: system || undefined,
        messages: messages
      })
    });

    if (!claudeResponse.ok) {
      const errorData = await claudeResponse.json().catch(() => ({
        error: { message: claudeResponse.statusText }
      }));
      
      return res.status(claudeResponse.status).json({
        error: 'Claude API error',
        message: errorData.error?.message || `API request failed: ${claudeResponse.statusText}`,
        status: claudeResponse.status
      });
    }

    const data = await claudeResponse.json();
    
    // Return the response
    return res.status(200).json({
      success: true,
      content: data.content[0]?.text || '',
      model: data.model,
      usage: data.usage
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred'
    });
  }
}

