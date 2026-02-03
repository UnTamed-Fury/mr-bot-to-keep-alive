const mineflayer = require('mineflayer');
const fs = require('fs');
const path = require('path');
const { fetch } = require('undici');

// Configuration
const config = {
  host: process.env.MINECRAFT_HOST || 'Furyisthehost.play.hosting',
  port: parseInt(process.env.MINECRAFT_PORT) || 50213,
  username: process.env.MINECRAFT_USERNAME || 'Mr_alive',
  version: process.env.MINECRAFT_VERSION || '1.21.1',
  webhookUrl: process.env.DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/1468272015445327955/50a0c60l5WMYLRLEUwJRVmmFF03FnxTYSXbaSeGygOfx1qDvPA9QG6JIBApwbV6cIFK4'
};

// Logging function
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  console.log(logMessage);

  // Write to log file
  const logDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logFile = path.join(logDir, `${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, logMessage + '\n');
}

// Function to send Discord webhook
async function sendWebhook(embed) {
  try {
    // Prepare the payload
    const payload = {
      embeds: [embed]
    };

    // Send the webhook using fetch
    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      log(`Failed to send Discord webhook: ${response.status} ${response.statusText}`, 'ERROR');
    } else {
      log('Discord webhook sent successfully', 'INFO');
    }
  } catch (error) {
    log(`Error sending Discord webhook: ${error.message}`, 'ERROR');
  }
}

// Function to create embed for joining
function createJoinEmbed(username) {
  return {
    title: "Player Joined",
    description: `${username} has joined the server`,
    color: 65280, // Green
    footer: {
      text: "Minecraft Keepalive Bot",
    },
    timestamp: new Date().toISOString()
  };
}

// Function to create embed for leaving
function createLeaveEmbed(username) {
  return {
    title: "Player Left",
    description: `${username} has left the server`,
    color: 16776960, // Yellow
    footer: {
      text: "Minecraft Keepalive Bot",
    },
    timestamp: new Date().toISOString()
  };
}

// Function to create embed for death
function createDeathEmbed(username) {
  return {
    title: "Player Died",
    description: `${username} has died`,
    color: 16711680, // Red
    footer: {
      text: "Minecraft Keepalive Bot",
    },
    timestamp: new Date().toISOString()
  };
}

// Function to create embed for server offline
function createOfflineEmbed(serverHost, serverPort) {
  return {
    title: "Server Offline",
    description: `Server ${serverHost}:${serverPort} is offline`,
    color: 16711680, // Red
    footer: {
      text: "Minecraft Keepalive Bot",
    },
    timestamp: new Date().toISOString()
  };
}

// Create bot
log(`Starting Minecraft bot for server: ${config.host}:${config.port}`, 'INFO');

const bot = mineflayer.createBot({
  host: config.host,
  port: config.port,
  username: config.username,
  version: config.version,
  // Additional options to appear more human-like
  auth: 'offline' // For offline/cracked servers
});

// Bot event handlers
bot.on('spawn', () => {
  log('Bot spawned successfully', 'SUCCESS');

  // Send join notification to Discord
  sendWebhook(createJoinEmbed(config.username));

  // Move the bot slightly to appear active
  bot.setControlState('forward', true);
  setTimeout(() => {
    bot.setControlState('forward', false);
  }, 2000);
});

bot.on('chat', (username, message) => {
  if (username === bot.username) return;
  log(`Chat received from ${username}: ${message}`, 'CHAT');
});

bot.on('playerJoined', (player) => {
  log(`${player.username} joined the game`, 'INFO');
  sendWebhook(createJoinEmbed(player.username));
});

bot.on('playerLeft', (player) => {
  log(`${player.username} left the game`, 'INFO');
  sendWebhook(createLeaveEmbed(player.username));
});

bot.on('death', () => {
  log(`${config.username} died`, 'WARNING');
  sendWebhook(createDeathEmbed(config.username));
});

bot.on('error', (err) => {
  log(`Bot error: ${err.message}`, 'ERROR');
});

bot.on('end', (reason) => {
  log(`Bot disconnected: ${reason}`, 'INFO');
  // Send server offline notification to Discord
  sendWebhook(createOfflineEmbed(config.host, config.port));
});

bot.on('kicked', (reason) => {
  log(`Bot kicked: ${reason}`, 'WARNING');
  // Send server offline notification to Discord
  sendWebhook(createOfflineEmbed(config.host, config.port));
});

// Keep the bot running for approximately 1 minute
setTimeout(() => {
  log('Session time complete, disconnecting...', 'INFO');
  bot.quit();
  process.exit(0);
}, 60000); // 60 seconds = 1 minute

log(`Bot connecting to ${config.host}:${config.port} with username ${config.username}`, 'INFO');