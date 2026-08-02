const { Client, GatewayIntentBits } = require('discord.js');
const OpenAIModule = require('openai');
const OpenAI = OpenAIModule.OpenAI || OpenAIModule.default || OpenAIModule;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  try {
    await message.channel.sendTyping();
    
    let messages = await message.channel.messages.fetch({ limit: 10 });
    let prompt = "";
    
    for (let i = messages.size - 1; i >= 0; i--) {
      const m = Array.from(messages.values())[i];
      if (m && m.member && m.content) {
        prompt += `${m.member.displayName}: ${m.content}\n`;
      }
    }
    prompt += `${client.user.username}:`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      stop: ["\n"]
    });

    const reply = response.choices?.[0]?.message?.content;
    
    if (reply && reply.trim().length > 0) {
      await message.channel.send(reply);
    } else {
      await message.channel.send("Hmm, I got an empty response from the AI.");
    }
  } catch (error) {
    console.error("Error message:", error.message);
    await message.channel.send(`Error: ${error.message}`);
  }
});

client.login(process.env.DISCORD_TOKEN);
