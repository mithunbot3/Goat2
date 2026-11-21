const { getPrefix, getStreamFromURL } = global.utils;

const BOT_NAME = "Mithun goat bot";

// 🖼️ এখানে তোমার ছবি/ভিডিওর direct লিংক বসাও (র‍্যান্ডম একটা যাবে)
const MEDIA = [
  "https://i.imgur.com/pp6T2Jv.mp4",
  "https://i.imgur.com/XXXXXXX.jpg"
];

async function sendWithMedia(message, body) {
  try {
    const url = MEDIA[Math.floor(Math.random() * MEDIA.length)];
    const stream = await getStreamFromURL(url);
    return await message.reply({ body, attachment: stream });
  } catch (e) {
    return message.reply(body); // মিডিয়া লোড না হলে শুধু টেক্সট
  }
}

module.exports = {
  config: {
    name: "prefix",
    version: "3.0",
    author: "Mithun",
    countDown: 5,
    role: 0,
    category: "TOOLS"
  },

  onStart: async function ({ args, threadsData, event, message }) {
    const threadID = event.threadID;
    const firstArg = args[0]?.toLowerCase();
    const secondArg = args[1]?.toLowerCase();

    if (["-i", "-image"].includes(firstArg)) {
      if (secondArg === "on") {
        await threadsData.set(threadID, true, "data.prefixImage");
        return message.reply("✅ এই গ্রুপে পিক সিস্টেম চালু হয়েছে।");
      }
      if (secondArg === "off") {
        await threadsData.set(threadID, false, "data.prefixImage");
        return message.reply("❌ এই গ্রুপে পিক সিস্টেম বন্ধ হয়েছে।");
      }
      return message.reply("ব্যবহার: prefix -i on  /  prefix -i off");
    }

    return message.reply(
      "┏━━━━━━━━━━━━━━━━━━┓\n" +
      "   📌 PREFIX SETTINGS\n" +
      "┗━━━━━━━━━━━━━━━━━━┛\n" +
      "➤ prefix -i on  → পিক চালু\n" +
      "➤ prefix -i off → পিক বন্ধ"
    );
  },

  onChat: async function ({ event, message, threadsData, usersData }) {
    const { threadID, body } = event;
    if (!body || body.trim().toLowerCase() !== "prefix") return;

    // ডিফল্টভাবে পিক চালু থাকবে, শুধু off করলে বন্ধ হবে
    const saved = await threadsData.get(threadID, "data.prefixImage");
    const imageEnabled = saved !== false;

    const adminID = global.GoatBot.config.adminBot[0];
    let adminName = "Mithun";
    try {
      const data = await usersData.get(adminID);
      if (data?.name) adminName = data.name;
    } catch (e) {}

    const prefix = getPrefix(threadID);
    const botNick = global.GoatBot.config.nickNameBot || BOT_NAME;

    const msg =
      "╭─────────────────╮\n" +
      `   🐐 ${BOT_NAME}\n` +
      "╰─────────────────╯\n\n" +
      `🤖 Bot Name  ⟫ ${botNick}\n` +
      `🔑 Prefix    ⟫ ${prefix}\n` +
      `👑 Owner     ⟫ ${adminName}\n\n` +
      "━━━━━━━━━━━━━━━━━━\n" +
      "✨ Have a great day! ✨\n" +
      "━━━━━━━━━━━━━━━━━━\n" +
      `🔗 fb.com/profile.php?id=${adminID}`;

    if (imageEnabled) return sendWithMedia(message, msg);
    return message.reply(msg);
  }
};
