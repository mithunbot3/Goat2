const fs = require("fs-extra");
const path = require("path");
const { getStreamFromURL } = global.utils;

const IMG = "https://i.imgur.com/IkIpE8E.jpeg";
const LOCAL = path.join(__dirname, "owner.jpg"); // ব্যাকআপ (ঐচ্ছিক)

module.exports = {
  config: {
    name: "owner",
    version: "3.3",
    author: "mithun",
    countDown: 2,
    role: 0,
    description: { en: "Show owner photo" },
    category: "info",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ message }) {
    try {
      const stream = await getStreamFromURL(IMG);
      return await message.reply({ attachment: stream });
    } catch (e) {
      console.error("[owner] link failed:", e.message);
    }

    // লিংক ফেল করলে লোকাল ছবি
    if (fs.existsSync(LOCAL)) {
      return message.reply({ attachment: fs.createReadStream(LOCAL) });
    }

    return message.reply("⚠️ ছবি লোড করা যায়নি।");
  }
};
