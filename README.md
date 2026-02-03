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

## Configuration

The bot can be configured using environment variables:

- `MINECRAFT_HOST`: Server hostname (default: Furyisthehost.play.hosting)
- `MINECRAFT_PORT`: Server port (default: 50213)
- `MINECRAFT_USERNAME`: Bot username (default: Mr_alive)
- `MINECRAFT_VERSION`: Minecraft version (default: 1.21.1)

## GitHub Actions Secrets

To use this bot with GitHub Actions, set up the following secrets in your repository:

- `MINECRAFT_HOST`
- `MINECRAFT_PORT`
- `MINECRAFT_USERNAME`
- `MINECRAFT_VERSION`

## Logs

All bot activity is logged to the `logs/` directory and uploaded as artifacts after each run.

## Usage

Simply set up the GitHub Actions workflow and configure the required secrets. The bot will automatically connect to your server every 4 minutes.