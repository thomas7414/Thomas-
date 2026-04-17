const { 
  Client, 
  GatewayIntentBits, 
  Partials, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  REST,
  Routes,
  SlashCommandBuilder
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// ===== CONFIG =====
const APPROVAL_CHANNEL = "1494463006648569989";
const PARTNER_CHANNEL = "1494487375705931917";
const STAFF_ROLES = [
  "1494464393352581222",
  "1494464501137936435"
];

// ===== READY + REGISTER COMMAND =====
client.once("ready", async () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);

  const commands = [
    new SlashCommandBuilder()
      .setName("bump")
      .setDescription("Bump your server!")
  ].map(cmd => cmd.toJSON());

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  await rest.put(
    Routes.applicationCommands(client.user.id),
    { body: commands }
  );

  console.log("✅ /bump registered!");
});

// ===== BUMP COMMAND =====
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "bump") {

    await interaction.reply({ content: "🚀 Bumping...", ephemeral: true });

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle("🚀 Bump Successful!")
      .setDescription("🔥 Join this amazing server!")
      .addFields(
        { name: "Server", value: interaction.guild.name },
        { name: "Members", value: `${interaction.guild.memberCount}` }
      )
      .setFooter({ text: "Next bump in 2 hours ⏰" });

    await interaction.channel.send({ embeds: [embed] });
  }
});

// ===== PARTNERSHIP DM =====
client.on("messageCreate", async message => {
  if (message.author.bot) return;

  if (message.channel.type === 1) {

    const embed = new EmbedBuilder()
      .setTitle("📩 Partnership Request")
      .setDescription(message.content);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`approve_${message.author.id}`)
        .setLabel("Approve")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId(`decline_${message.author.id}`)
        .setLabel("Decline")
        .setStyle(ButtonStyle.Danger)
    );

    const channel = client.channels.cache.get(APPROVAL_CHANNEL);
    channel.send({ embeds: [embed], components: [row] });

    message.reply("✅ Sent for approval!");
  }
});

// ===== BUTTONS =====
client.on("interactionCreate", async interaction => {
  if (!interaction.isButton()) return;

  const [action, userId] = interaction.customId.split("_");

  const user = await client.users.fetch(userId);

  if (action === "approve") {
    await user.send("✅ Approved!");
    client.channels.cache.get(PARTNER_CHANNEL)
      .send(`📢 New Partner: <@${userId}>`);

    await interaction.update({ content: "Approved ✅", components: [] });
  }

  if (action === "decline") {
    await user.send("❌ Declined.");
    await interaction.update({ content: "Declined ❌", components: [] });
  }
});

client.login(process.env.TOKEN);
