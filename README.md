# ObiBot - Facebook Messenger Auto-Reply

A simple automation bot that monitors your Facebook Messenger and automatically replies to messages based on configurable triggers.

## ⚠️ Important Warnings

- **This tool uses browser automation and violates Facebook's Terms of Service**
- **Your account may be restricted or banned**
- **Use at your own risk - for personal/educational purposes only**
- **Facebook does NOT provide API access for personal accounts**
- For production use, consider creating a Facebook Page and using the official Messenger Platform API

## Features

- 🤖 Automatic message detection based on keywords
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
```

**⚠️ NEVER commit the `.env` file to git!**

### 4. Configure Auto-Reply Rules

Edit `config.json` to set your trigger words and responses:

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

- `checkInterval`: How often to check for new messages (in milliseconds)
- `rules`: Array of trigger-response pairs
  - `trigger`: Keyword to look for in incoming messages (case-insensitive)
  - `response`: Message to send automatically

### 5. Run the Bot

#### Option A: Run Directly (Mac)

```bash
npm start
```

The bot will:
1. Open a browser window
2. Log into Facebook
3. Navigate to Messenger
4. Monitor for messages matching your triggers
5. Automatically reply when triggers are detected

#### Option B: Run with Docker (Proxmox/Linux)

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
3. **Monitoring**: Continuously checks conversations for trigger keywords
4. **Auto-Reply**: When a trigger is detected, automatically types and sends the configured response
5. **Deduplication**: Tracks processed messages to avoid duplicate replies

## Security Considerations

- Your `.env` file contains sensitive credentials - keep it secure
- Never commit `.env` to version control (already in `.gitignore`)
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
