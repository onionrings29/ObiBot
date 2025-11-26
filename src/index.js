require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Load configuration
const configPath = path.join(__dirname, '..', 'config.json');
let config = {};
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (error) {
  console.error('Error loading config.json:', error.message);
  process.exit(1);
}

// Load environment variables
const FB_EMAIL = process.env.FB_EMAIL;
const FB_PASSWORD = process.env.FB_PASSWORD;

if (!FB_EMAIL || !FB_PASSWORD) {
  console.error('Error: FB_EMAIL and FB_PASSWORD must be set in .env file');
  process.exit(1);
}

// Track processed messages to avoid duplicate replies
const processedMessages = new Set();

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function loginToFacebook(page) {
  console.log('Navigating to Facebook...');
  await page.goto('https://www.facebook.com/', { waitUntil: 'networkidle2' });

  console.log('Logging in...');

  // Fill in email
  await page.waitForSelector('#email', { timeout: 10000 });
  await page.type('#email', FB_EMAIL);

  // Fill in password
  await page.type('#pass', FB_PASSWORD);

  // Click login button
  await page.click('button[name="login"]');

  // Wait for navigation after login
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  console.log('Logged in successfully!');

  // Navigate to Messenger
  console.log('Navigating to Messenger...');
  await page.goto('https://www.messenger.com/', { waitUntil: 'networkidle2' });
  await sleep(3000);

  console.log('Ready to monitor messages!');
}

async function checkForMessages(page) {
  try {
    // Get all conversation items
    const conversations = await page.evaluate(() => {
      const results = [];

      // Look for unread message indicators or recent conversations
      const messageElements = document.querySelectorAll('div[role="row"], div[role="gridcell"]');

      messageElements.forEach((element) => {
        const text = element.innerText || element.textContent;
        if (text && text.trim()) {
          results.push({
            text: text.trim(),
            element: element.className
          });
        }
      });

      return results;
    });

    // Check if any conversation contains trigger keywords
    for (const conv of conversations) {
      for (const rule of config.rules) {
        if (conv.text.toLowerCase().includes(rule.trigger.toLowerCase())) {
          const messageId = `${conv.text}-${Date.now()}`;

          if (!processedMessages.has(messageId)) {
            console.log(`Detected trigger: "${rule.trigger}" in message`);
            await sendReply(page, rule.response);
            processedMessages.add(messageId);

            // Clean up old processed messages (keep last 100)
            if (processedMessages.size > 100) {
              const arr = Array.from(processedMessages);
              processedMessages.delete(arr[0]);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error checking messages:', error.message);
  }
}

async function sendReply(page, message) {
  try {
    console.log(`Sending reply: "${message}"`);

    // Find the message input box
    const inputSelector = 'div[role="textbox"][contenteditable="true"], div[aria-label*="message" i][contenteditable="true"]';
    await page.waitForSelector(inputSelector, { timeout: 5000 });

    // Type the message
    await page.click(inputSelector);
    await page.type(inputSelector, message);
    await sleep(500);

    // Press Enter to send
    await page.keyboard.press('Enter');

    console.log('Reply sent successfully!');
    await sleep(2000);
  } catch (error) {
    console.error('Error sending reply:', error.message);
  }
}

async function monitorMessenger() {
  console.log('Starting Facebook Messenger Auto-Reply Bot...');
  console.log('WARNING: This violates Facebook ToS. Use at your own risk!');
  console.log('');

  const browser = await puppeteer.launch({
    headless: false, // Set to true for headless mode
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ],
    defaultViewport: {
      width: 1280,
      height: 800
    }
  });

  const page = await browser.newPage();

  // Set user agent to avoid detection
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  try {
    await loginToFacebook(page);

    console.log('Monitoring for messages...');
    console.log(`Active rules: ${config.rules.length}`);
    config.rules.forEach((rule, index) => {
      console.log(`  ${index + 1}. Trigger: "${rule.trigger}" -> Response: "${rule.response}"`);
    });
    console.log('');

    // Monitor messages in a loop
    while (true) {
      await checkForMessages(page);
      await sleep(config.checkInterval || 5000); // Check every 5 seconds by default
    }
  } catch (error) {
    console.error('Error:', error);
    await browser.close();
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  process.exit(0);
});

// Start the bot
monitorMessenger();
