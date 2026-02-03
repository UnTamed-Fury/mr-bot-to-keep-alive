const https = require('https');
const { URL } = require('url');

// Configuration
const config = {
  webhookUrl: process.env.DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/1468272015445327955/50a0c60l5WMYLRLEUwJRVmmFF03FnxTYSXbaSeGygOfx1qDvPA9QG6JIBApwbV6cIFK4'
};

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
            console.log('Discord webhook sent successfully');
            resolve({ ok: true, status: res.statusCode });
          } else {
            console.log(`Failed to send Discord webhook: ${res.statusCode} ${res.statusMessage}`);
            console.log('Response:', data);
            resolve({ ok: false, status: res.statusCode, statusText: res.statusMessage });
          }
        });
      });

      req.on('error', (error) => {
        console.log(`Error sending Discord webhook: ${error.message}`);
        reject(error);
      });

      req.write(JSON.stringify(payload));
      req.end();
    } catch (error) {
      console.log(`Error sending Discord webhook: ${error.message}`);
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

// Test all webhook types
async function runTests() {
  console.log('Testing Discord webhook functionality...\n');

  console.log('1. Testing JOIN event:');
  await sendWebhook(createJoinEmbed('Mr_alive'));

  setTimeout(async () => {
    console.log('\n2. Testing LEAVE event:');
    await sendWebhook(createLeaveEmbed('Mr_alive'));
  }, 2000);

  setTimeout(async () => {
    console.log('\n3. Testing DEATH event:');
    await sendWebhook(createDeathEmbed('Mr_alive'));
  }, 4000);

  setTimeout(async () => {
    console.log('\n4. Testing OFFLINE event:');
    await sendWebhook(createOfflineEmbed('Furyisthehost.play.hosting', 50213));
  }, 6000);

  setTimeout(() => {
    console.log('\nAll webhook tests completed!');
  }, 8000);
}

runTests().catch(console.error);