/**
 * LLM Service - Supports Claude, OpenRouter, and DeepSeek
 * Uses AI to determine if messages have similar semantic meaning
 */

const https = require('https');
const http = require('http');

class LLMService {
  constructor(provider, apiKey) {
    this.provider = provider.toLowerCase();
    this.apiKey = apiKey;

    // API endpoints
    this.endpoints = {
      'claude': 'https://api.anthropic.com/v1/messages',
      'openrouter': 'https://openrouter.ai/api/v1/chat/completions',
      'deepseek': 'https://api.deepseek.com/v1/chat/completions'
    };

    if (!this.endpoints[this.provider]) {
      throw new Error(`Unsupported LLM provider: ${provider}. Use: claude, openrouter, or deepseek`);
    }
  }

  /**
   * Check if a message has similar meaning to any of the trigger phrases
   */
  async checkMessageSimilarity(incomingMessage, triggerPhrases, language = 'Filipino/Tagalog') {
    const prompt = this.buildPrompt(incomingMessage, triggerPhrases, language);

    try {
      const response = await this.callLLM(prompt);
      return this.parseResponse(response);
    } catch (error) {
      console.error('Error calling LLM:', error.message);
      return { isMatch: false, confidence: 0, reasoning: 'Error calling LLM' };
    }
  }

  buildPrompt(incomingMessage, triggerPhrases, language) {
    return `You are a semantic similarity analyzer for ${language} messages.

Your task: Determine if the incoming message has a similar meaning to ANY of the trigger phrases.

Trigger phrases (target meanings):
${triggerPhrases.map((phrase, i) => `${i + 1}. "${phrase}"`).join('\n')}

Incoming message: "${incomingMessage}"

Analyze if the incoming message asks about or means the same thing as any of the trigger phrases. Consider:
- Synonyms and paraphrasing
- Cultural context
- Common conversational variations
- ${language} language nuances

Respond in JSON format:
{
  "isMatch": true/false,
  "confidence": 0-100,
  "matchedPhrase": "which trigger phrase it matches" or null,
  "reasoning": "brief explanation"
}

Only respond with the JSON, nothing else.`;
  }

  async callLLM(prompt) {
    switch (this.provider) {
      case 'claude':
        return this.callClaude(prompt);
      case 'openrouter':
        return this.callOpenRouter(prompt);
      case 'deepseek':
        return this.callDeepSeek(prompt);
      default:
        throw new Error(`Provider ${this.provider} not implemented`);
    }
  }

  async callClaude(prompt) {
    const payload = {
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    };

    const response = await this.makeRequest(this.endpoints.claude, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      }
    }, payload);

    return response.content[0].text;
  }

  async callOpenRouter(prompt) {
    const payload = {
      model: 'anthropic/claude-3.5-sonnet', // or any other model
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    };

    const response = await this.makeRequest(this.endpoints.openrouter, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'https://github.com/obibot',
        'X-Title': 'ObiBot Messenger'
      }
    }, payload);

    return response.choices[0].message.content;
  }

  async callDeepSeek(prompt) {
    const payload = {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3
    };

    const response = await this.makeRequest(this.endpoints.deepseek, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      }
    }, payload);

    return response.choices[0].message.content;
  }

  makeRequest(url, options, payload) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const protocol = urlObj.protocol === 'https:' ? https : http;

      const reqOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname,
        method: options.method,
        headers: options.headers
      };

      const req = protocol.request(reqOptions, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(new Error(`Failed to parse response: ${e.message}`));
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (payload) {
        req.write(JSON.stringify(payload));
      }

      req.end();
    });
  }

  parseResponse(responseText) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          isMatch: parsed.isMatch || false,
          confidence: parsed.confidence || 0,
          matchedPhrase: parsed.matchedPhrase || null,
          reasoning: parsed.reasoning || ''
        };
      }

      // Fallback: try parsing entire response
      const parsed = JSON.parse(responseText);
      return {
        isMatch: parsed.isMatch || false,
        confidence: parsed.confidence || 0,
        matchedPhrase: parsed.matchedPhrase || null,
        reasoning: parsed.reasoning || ''
      };
    } catch (error) {
      console.error('Failed to parse LLM response:', responseText);
      return {
        isMatch: false,
        confidence: 0,
        matchedPhrase: null,
        reasoning: 'Failed to parse response'
      };
    }
  }
}

module.exports = LLMService;
