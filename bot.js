const mineflayer = require('mineflayer');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  host: process.env.MINECRAFT_HOST || 'Furyisthehost.play.hosting',
  port: parseInt(process.env.MINECRAFT_PORT) || 50213,
  username: process.env.MINECRAFT_USERNAME || 'Mr_alive',
  version: process.env.MINECRAFT_VERSION || '1.21.1'
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

bot.on('error', (err) => {
  log(`Bot error: ${err.message}`, 'ERROR');
});

bot.on('end', (reason) => {
  log(`Bot disconnected: ${reason}`, 'INFO');
});

bot.on('kicked', (reason) => {
  log(`Bot kicked: ${reason}`, 'WARNING');
});

// Keep the bot running for approximately 1 minute
setTimeout(() => {
  log('Session time complete, disconnecting...', 'INFO');
  bot.quit();
  process.exit(0);
}, 60000); // 60 seconds = 1 minute

log(`Bot connecting to ${config.host}:${config.port} with username ${config.username}`, 'INFO');