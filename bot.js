
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const timers = new Map();

const AFK_CHANNEL_ID = 'ضع_ID_روم_AFK_هنا';
const TIME_LIMIT = 30 * 60 * 1000;

client.once('ready', () => {
  console.log(`MeGo AFK Bot Online: ${client.user.tag}`);
});

client.on('voiceStateUpdate', (oldState, newState) => {
  const member = newState.member;
  if (!member || member.user.bot) return;

  const id = member.id;

  if (newState.selfMute && !oldState.selfMute) {
    const timer = setTimeout(async () => {
      const current = member.voice;

      if (current.channel && current.selfMute) {
        const afk = newState.guild.channels.cache.get(AFK_CHANNEL_ID);

        if (afk && afk.isVoiceBased()) {
          await member.voice.setChannel(afk).catch(console.error);
        }
      }

      timers.delete(id);
    }, TIME_LIMIT);

    timers.set(id, timer);
  }

  if (!newState.selfMute && oldState.selfMute) {
    clearTimeout(timers.get(id));
    timers.delete(id);
  }
});

client.login(process.env.DISCORD_TOKEN);

