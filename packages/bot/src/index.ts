import { Client, GatewayIntentBits } from 'discord.js';
import { handleMessage } from './handlers/messageHandler';
import { createActionExecutor } from './workers/actionExecutor';
// Import to start the worker
import './workers/urlResolver';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on('messageCreate', handleMessage);
client.on('messageUpdate', (_, newMsg) => handleMessage(newMsg));

// Start workers
client.on('clientReady', () => {
  console.log(`Logged in as ${client.user?.tag}`);

  // Start action executor worker
  createActionExecutor(client);

  // URL resolver worker is already running via import
  console.log('Workers started');
});

client.login(process.env.DISCORD_TOKEN);
