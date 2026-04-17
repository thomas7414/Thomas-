if (interaction.commandName === "bump") {

  const userId = interaction.user.id;

  if (!global.bumpCooldown) global.bumpCooldown = new Map();
  if (!global.PREMIUM_USERS) global.PREMIUM_USERS = [];

  function generateAIAd(guild) {
    return `🌟 Welcome to ${guild.name}!\n\n` +
      `Join an active and growing community where you can connect and have fun.\n\n` +
      `✨ Features:\n• Friendly members\n• Active chats\n• Great vibes\n\n` +
      `🚀 Join now and be part of something amazing!`;
  }

  // cooldown
  if (!global.PREMIUM_USERS.includes(userId)) {
    if (global.bumpCooldown.has(userId)) {
      const timeLeft = global.bumpCooldown.get(userId) - Date.now();

      if (timeLeft > 0) {
        const minutes = Math.ceil(timeLeft / 60000);
        return interaction.reply({
          content: `⏳ You must wait ${minutes} minutes before bumping again.`,
          ephemeral: true
        });
      }
    }
  }

  await interaction.reply({
    content: "✅ Bump successful!",
    ephemeral: true
  });

  const ad = generateAIAd(interaction.guild);

  let invite = "No invite available";

  try {
    const channels = interaction.guild.channels.cache
      .filter(c =>
        c.type === 0 &&
        c.permissionsFor(interaction.guild.members.me).has("CreateInstantInvite")
      );

    const firstChannel = channels.first();

    if (firstChannel) {
      const createdInvite = await firstChannel.createInvite({
        maxAge: 0,
        maxUses: 0
      });

      invite = createdInvite.url;
    }
  } catch (err) {
    console.log(err);
  }

  interaction.channel.send({
    content:
      `🚀 **New Bump!**\n\n` +
      `**Server:** ${interaction.guild.name}\n\n` +
      `${ad}\n\n` +
      `🔗 Invite: ${invite}\n` +
      `👤 Bumped by: <@${userId}>`
  });

  if (!global.PREMIUM_USERS.includes(userId)) {
    global.bumpCooldown.set(userId, Date.now() + 2 * 60 * 60 * 1000);
  }
}
