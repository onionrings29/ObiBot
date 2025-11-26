# ObiBot - Facebook Messenger Auto-Reply

An intelligent auto-reply bot for Facebook Messenger with **two modes**:
1. **Official Messenger API** (Recommended) - For Professional Mode/Pages - Legitimate, stable, ToS-compliant
2. **Browser Automation** (Legacy) - For personal accounts - Violates ToS, use at own risk

## 🎯 Which Mode Should I Use?

### ✅ Use Official API if:
- You have **Professional Mode** enabled on Messenger (you mentioned you have this!)
- You have a Facebook Page
- You want a legitimate, ToS-compliant solution
- You need reliability and webhooks

### ⚠️ Use Browser Automation if:
- You only have a personal account (without Professional Mode)
- You understand and accept the risk of account restrictions
- This is for educational/testing purposes only

## ⚠️ Important Warnings (Browser Automation Mode Only)

- **Browser automation violates Facebook's Terms of Service**
- **Your account may be restricted or banned**
- **Use at your own risk - for personal/educational purposes only**
- **For Professional Mode, use the Official API instead (see below)**

## Features

- 🤖 **Two matching modes:**
  - **Simple keyword matching** - Basic substring matching (no API needed)
  - **AI-powered semantic matching** - Uses LLMs to understand message meaning (requires API key)
- 🧠 **LLM Integration** - Supports Claude, OpenRouter, and DeepSeek APIs
- 🌏 **Multi-language support** - Works with any language (Tagalog/Filipino, English, etc.)
- 💬 Customizable trigger words and responses
- ⚙️ Simple JSON configuration
- 🐳 Docker support for easy deployment
- 🖥️ Works on Mac and Linux (Proxmox)

## Prerequisites

### For Mac or Direct Installation:
- Node.js 18+ ([Download](https://nodejs.org/))
- npm (comes with Node.js)

### For Proxmox/Docker Installation:
- Docker
- Docker Compose

## Quick Start

Choose your setup method:
- **[Official API Setup](#official-api-setup-recommended)** (For Professional Mode/Pages)
- **[Browser Automation Setup](#browser-automation-setup-legacy)** (For personal accounts)

---

## Official API Setup (Recommended)

### ✅ Prerequisites
- Facebook Page or Messenger Professional Mode enabled
- Public HTTPS URL for webhooks (use ngrok for testing, or deploy to a server)

### Step 1: Install Dependencies

```bash
cd ObiBot
npm install
```

### Step 2: Create Facebook App

1. Go to https://developers.facebook.com/apps/
2. Click **"Create App"**
3. Select **"Business"** as app type
4. Fill in app details and create

### Step 3: Add Messenger Product

1. In your app dashboard, click **"Add Product"**
2. Find **"Messenger"** and click **"Set Up"**
3. Scroll to **"Access Tokens"**
4. Select your Page and generate a **Page Access Token**
5. **Copy this token** - you'll need it for `.env`

### Step 4: Configure Webhook

1. In Messenger settings, find **"Webhooks"** section
2. Click **"Add Callback URL"**
3. Enter your webhook URL:
   - **For testing with ngrok**: `https://your-ngrok-url.ngrok.io/webhook`
   - **For production**: `https://yourdomain.com/webhook`
4. Enter a **Verify Token** (any random string you choose, e.g., `my-secret-verify-token-123`)
5. Subscribe to webhook fields: **messages**, **messaging_postbacks**
6. Click **"Verify and Save"**

### Step 5: Subscribe App to Page

1. Still in Messenger Webhooks section
2. Find **"Select a page to subscribe your webhook"**
3. Select your Page
4. Subscribe to **messages** events

### Step 6: Configure Environment Variables

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Messenger API
PAGE_ACCESS_TOKEN=your-page-access-token-from-step-3
VERIFY_TOKEN=my-secret-verify-token-123
PORT=3000

# Optional: LLM for semantic matching
LLM_PROVIDER=claude
LLM_API_KEY=sk-ant-xxxxx
```

### Step 7: Configure Rules

Edit `config.json` (already configured with your Tagalog example):

```json
{
  "checkInterval": 5000,
  "rules": [
    {
      "useLLM": true,
      "triggers": ["nakauwi ka na", "busy", "anong gawa mo"],
      "response": "opo nagrereview",
      "language": "Filipino/Tagalog",
      "minConfidence": 70
    }
  ]
}
```

### Step 8: Start the Server

**For local testing with ngrok:**

Terminal 1 - Start ngrok:
```bash
ngrok http 3000
```
Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

Terminal 2 - Start bot:
```bash
npm start
```

**For production:**
```bash
npm start
```

Or with Docker:
```bash
docker-compose up -d
```

### Step 9: Test It!

1. Send a message to your Page on Messenger
2. Try: "Nandyan ka na ba?" or "Busy ka?" or "Anong ginagawa mo?"
3. Bot should reply with "opo nagrereview"

✅ **Done! Your bot is now running with the official API!**

---

## Browser Automation Setup (Legacy)

⚠️ **Use only if you don't have Professional Mode**

### 1. Clone and Setup

```bash
cd ObiBot
```

### 2. Install Dependencies (Mac/Direct Installation)

```bash
npm install
```

### 3. Configure Credentials

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` and add your Facebook credentials:

```env
FB_EMAIL=your-facebook-email@example.com
FB_PASSWORD=your-facebook-password

# Optional: LLM Configuration for semantic matching
LLM_PROVIDER=claude
LLM_API_KEY=your-api-key-here
```

**⚠️ NEVER commit the `.env` file to git!**

#### LLM Provider Setup (Optional)

For AI-powered semantic matching, choose one provider and get an API key:

**Option 1: Claude (Recommended)**
- Sign up at https://console.anthropic.com/
- Get API key from Settings → API Keys
- Supports: Claude 3.5 Sonnet (best for understanding context)

**Option 2: OpenRouter**
- Sign up at https://openrouter.ai/
- Get API key and choose from multiple models
- More flexible, pay-per-use pricing

**Option 3: DeepSeek**
- Sign up at https://platform.deepseek.com/
- Get API key
- Cost-effective option

Then set in `.env`:
```env
LLM_PROVIDER=claude  # or openrouter, or deepseek
LLM_API_KEY=sk-ant-xxxxx  # your actual API key
```

**Note:** If you don't configure LLM, the bot will use simple keyword matching (still works fine!).

### 4. Configure Auto-Reply Rules

Edit `config.json` to set your trigger words and responses:

#### Simple Keyword Matching (No LLM needed):

```json
{
  "checkInterval": 5000,
  "rules": [
    {
      "trigger": "hello",
      "response": "Hi! This is an automated response. I'll get back to you soon!"
    },
    {
      "trigger": "are you there",
      "response": "I'm currently away but will respond when I'm back!"
    }
  ]
}
```

#### AI-Powered Semantic Matching (Requires LLM):

```json
{
  "checkInterval": 5000,
  "rules": [
    {
      "useLLM": true,
      "triggers": [
        "nakauwi ka na",
        "busy",
        "anong gawa mo"
      ],
      "response": "opo nagrereview",
      "language": "Filipino/Tagalog",
      "minConfidence": 70
    },
    {
      "trigger": "urgent",
      "response": "I've received your urgent message!"
    }
  ]
}
```

**Configuration Options:**

- `checkInterval`: How often to check for new messages (in milliseconds)
- `rules`: Array of trigger-response rules

**For simple keyword matching:**
- `trigger`: Single keyword to look for (case-insensitive)
- `response`: Message to send automatically

**For LLM-based semantic matching:**
- `useLLM`: Set to `true` to enable AI matching
- `triggers`: Array of phrases representing the meaning you want to detect
- `response`: Message to send when semantic match is found
- `language`: Language context (e.g., "Filipino/Tagalog", "English", "Spanish")
- `minConfidence`: Minimum confidence percentage (0-100) required to trigger response

**How LLM matching works:**
Instead of exact keyword matching, the AI analyzes if the incoming message has *similar meaning* to your trigger phrases. For example, with triggers `["nakauwi ka na", "busy", "anong gawa mo"]`, it will match messages like:
- "Nandyan ka na ba?" (similar to "nakauwi ka na")
- "May ginagawa ka ba?" (similar to "anong gawa mo")
- "Occupied ka?" (similar to "busy")
- And many other variations with similar meaning!

### 5. Run the Bot (Browser Automation Mode)

⚠️ **Note:** For browser automation only. If using Official API, see setup above.

#### Option A: Run Directly (Mac)

```bash
npm run start:browser
```

The bot will:
1. Open a browser window
2. Log into Facebook
3. Navigate to Messenger
4. Monitor for messages matching your triggers
5. Automatically reply when triggers are detected

#### Option B: Run with Docker (Proxmox/Linux)

Update `docker-compose.yml` to use browser mode, then:

```bash
docker-compose up -d
```

To view logs:
```bash
docker-compose logs -f
```

To stop:
```bash
docker-compose down
```

---

## Configuration Options

### config.json

| Field | Description | Default |
|-------|-------------|---------|
| `checkInterval` | Polling interval in milliseconds | 5000 |
| `rules` | Array of trigger-response rules | [] |

### Headless Mode

By default, the bot runs with a visible browser window. To run in headless mode (no UI):

Edit `src/index.js` and change:
```javascript
headless: false, // Set to true for headless mode
```

to:
```javascript
headless: true,
```

## How It Works

1. **Login**: Uses Puppeteer to log into Facebook with your credentials
2. **Navigation**: Navigates to messenger.com
3. **Monitoring**: Continuously checks conversations for messages
4. **Message Analysis**:
   - **Simple mode**: Checks if message contains trigger keywords
   - **LLM mode**: Sends message to AI to determine semantic similarity with trigger phrases
5. **Auto-Reply**: When a match is detected (keyword or semantic), automatically types and sends the configured response
6. **Deduplication**: Tracks processed messages to avoid duplicate replies

## Security Considerations

- Your `.env` file contains sensitive credentials (Facebook password + LLM API keys) - keep it secure
- Never commit `.env` to version control (already in `.gitignore`)
- LLM API keys have usage costs - monitor your API usage
- Messages are sent to the LLM provider for analysis (if using LLM mode)
- Consider using a VPN or your home network
- Facebook may detect automation and require verification
- Enable 2FA on your Facebook account for additional security

## Troubleshooting

### Bot doesn't reply to messages

1. Check that the browser window shows Messenger loaded correctly
2. Verify your trigger keywords are correct (case-insensitive matching)
3. Check the console logs for errors
4. Make sure messages contain the exact trigger text

### Login fails

1. Verify credentials in `.env` are correct
2. Check if Facebook requires verification (check the browser window)
3. You may need to manually verify in the browser window
4. Try disabling 2FA temporarily (not recommended long-term)

### Docker container crashes

1. Check logs: `docker-compose logs`
2. Ensure `.env` file exists and is configured
3. Verify config.json is valid JSON

### Facebook blocks/restricts account

- This is a known risk of using automation
- You may need to verify your identity
- Consider taking a break from automation
- Use official APIs with a Facebook Page instead

## Mac vs Proxmox Deployment

### Mac (Recommended for Testing)
- Easier to debug with visible browser
- Good for initial setup and testing
- Can see what the bot is doing in real-time

### Proxmox/Docker (Recommended for Production)
- Runs in background
- Automatically restarts if crashes
- Isolated environment
- Can run 24/7

## Advanced Usage

### Multiple Accounts

To run multiple bots for different accounts:

1. Duplicate the project folder
2. Configure each with different credentials
3. Run each instance separately

### Custom Logic

Edit `src/index.js` to add custom logic:
- Time-based responses
- Different responses for different users
- Rate limiting
- Response delays

## Limitations

- Only works with Facebook personal accounts (not Pages)
- Requires browser to be running
- May not detect all message formats
- Subject to Facebook's anti-automation measures
- Cannot access archived conversations
- Trigger matching is simple substring matching

## Legal Disclaimer

This tool is provided for educational purposes only. By using this software, you acknowledge that:

- Automating Facebook violates their Terms of Service
- Your account may be banned or restricted
- The developers are not responsible for any consequences
- You use this software at your own risk

For legitimate business use, please use Facebook's official Messenger Platform API with a Facebook Page.

## Contributing

Feel free to submit issues or pull requests for improvements.

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Facebook's status for any platform issues
3. Open an issue in this repository

---

**Remember: Use responsibly and at your own risk!**
