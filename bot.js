const mineflayer = require('mineflayer');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');
const net = require('net');

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
  // Only log DEBUG messages if we're in a debugging context
  if (level === 'DEBUG' && !process.env.DEBUG) {
    return;
  }
  
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
function sendWebhook(embed) {
  return new Promise((resolve, reject) => {
    try {
      // Prepare the payload
      const payload = {
        embeds: [embed]
      };

      const webhookUrl = new URL(config.webhookUrl);
      
      const options = {
        hostname: webhookUrl.hostname,
        port: 443,
        path: webhookUrl.pathname + webhookUrl.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'DiscordBot (keepalive, 1.0)'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            log('Discord webhook sent successfully', 'INFO');
            resolve({ ok: true, status: res.statusCode });
          } else {
            log(`Failed to send Discord webhook: ${res.statusCode} ${res.statusMessage}`, 'ERROR');
            resolve({ ok: false, status: res.statusCode, statusText: res.statusMessage });
          }
        });
      });

      req.on('error', (error) => {
        log(`Error sending Discord webhook: ${error.message}`, 'ERROR');
        reject(error);
      });

      req.write(JSON.stringify(payload));
      req.end();
    } catch (error) {
      log(`Error sending Discord webhook: ${error.message}`, 'ERROR');
      reject(error);
    }
  });
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

// Function to test if server is reachable before attempting Minecraft connection
function testServerReachable(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    socket.setTimeout(10000); // 10 second timeout

    socket.on('connect', () => {
      log(`Successfully connected to ${host}:${port}`, 'INFO');
      socket.end();
      resolve(true);
    });

    socket.on('error', (err) => {
      log(`Connection error to ${host}:${port}: ${err.message}`, 'ERROR');
      socket.destroy();
      resolve(false);
    });

    socket.on('timeout', () => {
      log(`Connection timeout to ${host}:${port}`, 'ERROR');
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, host);
  });
}

// Test server reachability before connecting
log(`Testing server reachability: ${config.host}:${config.port}`, 'INFO');
testServerReachable(config.host, config.port).then(isReachable => {
  if (!isReachable) {
    log(`Server ${config.host}:${config.port} is not reachable`, 'ERROR');
    // Send offline notification to Discord
    sendWebhook(createOfflineEmbed(config.host, config.port))
      .then(() => {
        // Exit after a delay to allow webhook to send
        setTimeout(() => process.exit(1), 2000);
      })
      .catch(err => {
        log(`Error sending offline webhook: ${err.message}`, 'ERROR');
        process.exit(1);
      });
    return;
  }
  
  log(`Server ${config.host}:${config.port} is reachable, proceeding with connection`, 'INFO');
  
  // Create bot
  log(`Starting Minecraft bot for server: ${config.host}:${config.port}`, 'INFO');
  log(`Using username: ${config.username}, version: ${config.version}`, 'INFO');

  const botOptions = {
    host: config.host,
    port: config.port,
    username: config.username,
    version: config.version,
    auth: 'offline', // For offline/cracked servers
    // Additional options to improve connection reliability
    timeout: 30000, // 30 second timeout
    // Enable verbose logging for connection issues
    hideErrors: false,
    // Additional connection options that might help with firewall issues
    skipValidation: true
  };

  log(`Attempting to connect with options: host=${config.host}, port=${config.port}, username=${config.username}`, 'DEBUG');
  const bot = mineflayer.createBot(botOptions);
  
  // Bot event handlers
  bot.on('spawn', () => {
    log('Bot spawned successfully', 'SUCCESS');
    
    // Send join notification to Discord
    sendWebhook(createJoinEmbed(config.username)).catch(err => {
      log(`Error sending join webhook: ${err.message}`, 'ERROR');
    });
    
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
    sendWebhook(createJoinEmbed(player.username)).catch(err => {
      log(`Error sending join webhook: ${err.message}`, 'ERROR');
    });
  });

  bot.on('playerLeft', (player) => {
    log(`${player.username} left the game`, 'INFO');
    sendWebhook(createLeaveEmbed(player.username)).catch(err => {
      log(`Error sending leave webhook: ${err.message}`, 'ERROR');
    });
  });

  bot.on('death', () => {
    log(`${config.username} died`, 'WARNING');
    sendWebhook(createDeathEmbed(config.username)).catch(err => {
      log(`Error sending death webhook: ${err.message}`, 'ERROR');
    });
  });

  bot.on('error', (err) => {
    log(`Bot error: ${err.message}`, 'ERROR');
  });

  bot.on('end', (reason) => {
    log(`Bot disconnected: ${reason}`, 'INFO');
    // Send server offline notification to Discord
    sendWebhook(createOfflineEmbed(config.host, config.port)).catch(err => {
      log(`Error sending offline webhook: ${err.message}`, 'ERROR');
    });
  });

  bot.on('kicked', (reason) => {
    log(`Bot kicked: ${reason}`, 'WARNING');
    // Send server offline notification to Discord
    sendWebhook(createOfflineEmbed(config.host, config.port)).catch(err => {
      log(`Error sending offline webhook: ${err.message}`, 'ERROR');
    });
  });

  // Keep the bot running for approximately 1 minute
  setTimeout(() => {
    log('Session time complete, disconnecting...', 'INFO');
    bot.quit();
    process.exit(0);
  }, 60000); // 60 seconds = 1 minute

  log(`Bot connecting to ${config.host}:${config.port} with username ${config.username}`, 'INFO');
  
}).catch(err => {
  log(`Error testing server reachability: ${err.message}`, 'ERROR');
  process.exit(1);
});