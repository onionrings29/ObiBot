require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const LLMService = require('./llm-service');

// Load configuration
const configPath = path.join(__dirname, '..', 'config.json');
let config = {};
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (error) {
  console.error('Error loading config.json:', error.message);
  process.exit(1);
}

// Environment variables
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PORT = process.env.PORT || 3000;
const LLM_PROVIDER = process.env.LLM_PROVIDER;
const LLM_API_KEY = process.env.LLM_API_KEY;

if (!PAGE_ACCESS_TOKEN) {
  console.error('Error: PAGE_ACCESS_TOKEN must be set in .env file');
  process.exit(1);
}

if (!VERIFY_TOKEN) {
  console.error('Error: VERIFY_TOKEN must be set in .env file');
  process.exit(1);
}

// Initialize LLM service if configured
let llmService = null;
if (LLM_PROVIDER && LLM_API_KEY) {
  try {
    llmService = new LLMService(LLM_PROVIDER, LLM_API_KEY);
    console.log(`LLM Service initialized with provider: ${LLM_PROVIDER}`);
  } catch (error) {
    console.error('Failed to initialize LLM service:', error.message);
    console.error('Falling back to simple keyword matching');
  }
}

// Track processed messages to avoid duplicate replies
const processedMessages = new Set();

const app = express();
app.use(bodyParser.json());

// Webhook verification endpoint
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verified!');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Webhook message handler
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    // Process all entries
    for (const entry of body.entry) {
      // Process all messaging events
      for (const event of entry.messaging) {
        if (event.message && !event.message.is_echo) {
          await handleMessage(event);
        }
      }
    }

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Handle incoming messages
async function handleMessage(event) {
  const senderId = event.sender.id;
  const messageText = event.message.text;
  const messageId = event.message.mid;

  // Skip if already processed
  if (processedMessages.has(messageId)) {
    return;
  }

  console.log(`\n📨 Message received from ${senderId}: "${messageText}"`);

  // Check against all rules
  for (const rule of config.rules) {
    let shouldReply = false;
    let matchReason = '';

    // Use LLM-based semantic matching if available and enabled
    if (llmService && rule.useLLM) {
      try {
        const result = await llmService.checkMessageSimilarity(
          messageText,
          rule.triggers || [rule.trigger],
          rule.language || 'English'
        );

        if (result.isMatch && result.confidence >= (rule.minConfidence || 70)) {
          shouldReply = true;
          matchReason = `LLM match (${result.confidence}% confident): ${result.reasoning}`;
        }
      } catch (error) {
        console.error('LLM error:', error.message);
      }
    }
    // Fall back to simple keyword matching
    else if (rule.trigger) {
      if (messageText.toLowerCase().includes(rule.trigger.toLowerCase())) {
        shouldReply = true;
        matchReason = `Keyword match: "${rule.trigger}"`;
      }
    }

    if (shouldReply) {
      console.log(`✅ ${matchReason}`);
      await sendMessage(senderId, rule.response);
      processedMessages.add(messageId);

      // Clean up old processed messages (keep last 1000)
      if (processedMessages.size > 1000) {
        const arr = Array.from(processedMessages);
        processedMessages.delete(arr[0]);
      }

      // Only send one reply per message
      break;
    }
  }
}

// Send message via Messenger API
async function sendMessage(recipientId, messageText) {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        recipient: { id: recipientId },
        message: { text: messageText }
      }
    );

    console.log(`📤 Reply sent: "${messageText}"`);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error.response?.data || error.message);
    throw error;
  }
}

// Health check endpoint
app.get('/', (req, res) => {
  res.send(`
    <h1>ObiBot Messenger API Server</h1>
    <p>Status: Running ✅</p>
    <p>LLM: ${llmService ? 'ENABLED' : 'DISABLED'}</p>
    <p>Active rules: ${config.rules.length}</p>
    <h2>Rules:</h2>
    <ul>
      ${config.rules.map((rule, i) => {
        const mode = rule.useLLM ? '[LLM]' : '[Keyword]';
        const triggers = rule.triggers ? rule.triggers.join(', ') : rule.trigger;
        return `<li>${mode} "${triggers}" → "${rule.response}"</li>`;
      }).join('')}
    </ul>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('🤖 ObiBot Messenger API Server');
  console.log('================================');
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Webhook URL: http://your-domain:${PORT}/webhook`);
  console.log(`✅ LLM Service: ${llmService ? 'ENABLED' : 'DISABLED'}`);
  console.log(`✅ Active rules: ${config.rules.length}`);
  console.log('');

  config.rules.forEach((rule, index) => {
    const mode = rule.useLLM ? '[LLM]' : '[Keyword]';
    const triggers = rule.triggers ? rule.triggers.join(', ') : rule.trigger;
    console.log(`  ${index + 1}. ${mode} Triggers: "${triggers}" → Response: "${rule.response}"`);
  });

  console.log('');
  console.log('⏳ Waiting for messages...');
  console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down gracefully...');
  process.exit(0);
});
