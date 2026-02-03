# Mr. Alive - Minecraft Keepalive Bot

A Minecraft bot designed to keep your server alive by connecting periodically through GitHub Actions.

## Purpose

This bot connects to your Minecraft server periodically (every 4 minutes) for 1 minute to keep the server active and prevent it from shutting down due to inactivity.

## Features

- Lightweight Minecraft bot using mineflayer
- Runs on GitHub Actions every 4 minutes for 1 minute
- Comprehensive logging
- Configurable server settings
- Automatic disconnection after session
- Discord webhook notifications for server events

## Configuration

The bot can be configured using environment variables:

- `MINECRAFT_HOST`: Server hostname (default: Furyisthehost.play.hosting)
- `MINECRAFT_PORT`: Server port (default: 50213)
- `MINECRAFT_USERNAME`: Bot username (default: Mr_alive)
- `MINECRAFT_VERSION`: Minecraft version (default: 1.21.1)
- `DISCORD_WEBHOOK_URL`: Discord webhook URL for notifications (default: provided webhook)

## GitHub Actions Secrets

To use this bot with GitHub Actions, set up the following secrets in your repository:

- `MINECRAFT_HOST`
- `MINECRAFT_PORT`
- `DISCORD_WEBHOOK_URL` (optional, defaults to the provided webhook URL)

The username and Minecraft version are configured in the code with these defaults:
- Username: Mr_alive
- Minecraft Version: 1.21.1

## Known Limitations

**Important Note**: Many Minecraft hosting providers (especially free services) block connections from cloud services like GitHub Actions. If your server returns `ECONNREFUSED` consistently, it's likely that your hosting provider is blocking connections from GitHub's IP ranges.

## Alternative Deployment Options

If the GitHub Actions workflow doesn't work due to IP blocking, consider these alternatives:

1. **Run locally on a computer that stays on** (like a home server or Raspberry Pi)
2. **Deploy to a cloud VPS** with a different IP reputation
3. **Use a different CI/CD service** that may have different IP ranges

## Logs

All bot activity is logged to the `logs/` directory and uploaded as artifacts after each run.

## Usage

Simply set up the GitHub Actions workflow and configure the required secrets. The bot will automatically connect to your server every 4 minutes.