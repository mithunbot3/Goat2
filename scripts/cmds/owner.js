const fs = require("fs-extra");
const path = require("path");
const { getStreamFromURL } = global.utils;

// 🖼️ ছবির লিংক (একটা ফেল করলে পরেরটা ট্রাই করবে)
const IMAGES = [
  "https://i.imgur.com/p64G39M.jpeg"
  // "https://files.catbox.moe/xxxxxx.jpg",
  // "https://raw.githubusercontent.com/YOUR_USER/YOUR_REPO/main/owner.jpg"
];

// 📁 লোকাল ছবি: scripts/cmds/assets/owner.jpg (থাকলে এটাই আগে যাবে)
const LOCAL = path.join(__dirname, "assets", "owner.jpg");

module.exports = {
  config: {
    name: "owner",
    version: "3.1",
    author: "mithun",
    countDown: 2,
    role: 0,
    description: { en: "Show owner photo" },
    category: "info",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ message }) {
    // ১. লোকাল ফাইল
    if (fs.existsSync(LOCAL)) {
      return message.reply({ attachment: fs.createReadStream(LOCAL) });
    }

    // ২. লিংকগুলো একে একে
    for (const url of IMAGES) {
      try {
        const stream = await getStreamFromURL(url);
        return await message.reply({ attachment: stream });
      } catch (e) {
        console.error(`[owner] failed: ${url} → ${e.message}`);
      }
    }

    // ৩. সব ফেল
    return message.reply("⚠️ ছবি লোড করা যায়নি। লিংক বা লোকাল ফাইল চেক করো।");
  }
};
