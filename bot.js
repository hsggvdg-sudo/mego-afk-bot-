
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const AFK_CHANNEL_ID = '1572851710022516806';
const TIME_LIMIT = 30 * 60 * 1000;

const timers = new Map();

client.once('ready', () => {
  console.log(`MeGo AFK Bot Online: ${client.user.tag}`);
});

client.on('voiceStateUpdate', (oldState, newState) => {
  const member = newState.member;

  if (!member || member.user.bot) return;

  const id = member.id;

  // بدأ كتم المايك بنفسه
  if (newState.selfMute && !oldState.selfMute) {
    if (timers.has(id)) clearTimeout(timers.get(id));

    const timer = setTimeout(async () => {
      const current = member.voice;

      if (current.channel && current.selfMute) {
        const afk = newState.guild.channels.cache.get(AFK_CHANNEL_ID);

        if (afk && afk.isVoiceBased()) {
          await member.voice.setChannel(afk).catch(console.error);
          console.log(`Moved ${member.user.tag} to AFK`);
        }
      }

      timers.delete(id);
    }, TIME_LIMIT);

    timers.set(id, timer);
  }

  // فتح المايك: إلغاء العداد
  if (!newState.selfMute && oldState.selfMute) {
    if (timers.has(id)) {
      clearTimeout(timers.get(id));
      timers.delete(id);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
