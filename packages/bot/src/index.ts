import { Client, Events, GatewayIntentBits } from 'discord.js';
import { handleMessage } from './handlers/messageHandler';
import { createActionExecutor } from './workers/actionExecutor';
// Import to start workers
import './workers/urlResolver';
import './workers/blocklistChecker';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on(Events.MessageCreate, handleMessage);
client.on(Events.MessageUpdate, (_, newMsg) => handleMessage(newMsg));

// Start workers
client.on(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user?.username}`);

  // Start action executor worker
  createActionExecutor(client);

  // URL resolver worker is already running via import
  console.log('Workers started');
});

client.login(process.env.DISCORD_TOKEN);
