const { 
  Client, 
  GatewayIntentBits, 
  Partials, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle 
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

// ====== CONFIG ======
const APPROVAL_CHANNEL = "1494463006648569989";
const PARTNER_CHANNEL = "1494487375705931917";
const STAFF_ROLES = [
  "1494464393352581222",
  "1494464501137936435"
];

// Cooldowns
const bumpCooldown = new Map();
const partnershipCooldown = new Map();
const approvedServers = new Set();
const declinedServers = new Map();

// ===== READY =====
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// ===== SLASH COMMANDS =====
client.on("interactionCreate", async (interaction) => {

  if (interaction.isChatInputCommand()) {

    // ===== /BUMP =====
    if (interaction.commandName === "bump") {

      const now = Date.now();
      const cooldown = bumpCooldown.get(interaction.guild.id);

      if (cooldown && now < cooldown) {
        const timeLeft = Math.ceil((cooldown - now) / 60000);
        return interaction.reply({
          content: `⏳ You must wait ${timeLeft} minutes before bumping again.`,
          ephemeral: true
        });
      }

      bumpCooldown.set(interaction.guild.id, now + 2 * 60 * 60 * 1000);

      // ✅ FIX (reply fast)
      await interaction.reply({ content: "🚀 Bumping your server...", ephemeral: true });

      // AI-style description (simple)
      const descriptions = [
        "🔥 A growing and active community!",
        "💬 Chill vibes and friendly members!",
        "🚀 Join now and be part of something big!",
        "🎉 Events, fun, and active chats daily!"
      ];

      const randomDesc = descriptions[Math.floor(Math.random() * descriptions.length)];

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle("🚀 Bump Successful!")
        .setDescription(randomDesc)
        .addFields(
          { name: "Server", value: interaction.guild.name, inline: true },
          { name: "Members", value: `${interaction.guild.memberCount}`, inline: true }
        )
        .setFooter({ text: "Next bump available in 2 hours ⏰" });

      await interaction.channel.send({ embeds: [embed] });
    }
  }

  // ===== BUTTONS =====
  if (interaction.isButton()) {

    const member = interaction.member;

    const isStaff = member.roles.cache.some(role => STAFF_ROLES.includes(role.id));
    if (!isStaff) return interaction.reply({ content: "❌ You are not staff.", ephemeral: true });

    const [action, userId] = interaction.customId.split("_");

    const user = await client.users.fetch(userId);

    if (action === "approve") {

      approvedServers.add(userId);

      await user.send("✅ Your partnership request has been approved! Thank you for partnering 💙");

      const partnerChannel = client.channels.cache.get(PARTNER_CHANNEL);
      partnerChannel.send(`📢 New Partner Approved!\nSubmitted by <@${userId}>`);

      await interaction.update({ content: "✅ Approved", components: [] });

    }

    if (action === "decline") {

      declinedServers.set(userId, Date.now() + (2 * 24 * 60 * 60 * 1000));

      await user.send("❌ Your partnership request was declined. You can try again in 2 days.");

      await interaction.update({ content: "❌ Declined", components: [] });
    }
  }
});

// ===== DM PARTNERSHIP SYSTEM =====
client.on("messageCreate", async (message) => {

  if (message.author.bot) return;

  // ONLY DM
  if (message.channel.type === 1) {

    const userId = message.author.id;

    // Already approved
    if (approvedServers.has(userId)) {
      return message.reply("✅ You are already partnered. Submit another server if you'd like.");
    }

    // Declined cooldown
    if (declinedServers.has(userId)) {
      const timeLeft = declinedServers.get(userId) - Date.now();

      if (timeLeft > 0) {
        const days = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
        return message.reply(`⏳ You were declined. Try again in ${days} day(s).`);
      }
    }

    // Simple cooldown
    if (partnershipCooldown.has(userId)) {
      return message.reply("⏳ Please wait before submitting again.");
    }

    partnershipCooldown.set(userId, true);

    // Send to approval channel
    const channel = client.channels.cache.get(APPROVAL_CHANNEL);

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle("📩 New Partnership Request")
      .setDescription(message.content)
      .setFooter({ text: `User ID: ${userId}` });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`approve_${userId}`)
        .setLabel("Approve")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId(`decline_${userId}`)
        .setLabel("Decline")
        .setStyle(ButtonStyle.Danger)
    );

    channel.send({ embeds: [embed], components: [row] });

    message.reply("📨 Your partnership request has been sent for approval!");
  }
});

// ===== LOGIN =====
client.login(process.env.TOKEN);
