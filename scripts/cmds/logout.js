module.exports = {
  config: {
    name: "logout",
    aliases: ["lo"],
    version: "2.0",
    author: "Mithun",
    countDown: 0,
    role: 2,
    description: {
      en: "Logout the bot account"
    },
    category: "owner",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, message }) {
    try {
      await message.reply("🔒 Logging out...");
      await api.logout();
    } catch (e) {
      console.error("logout error:", e);
      return message.reply("❌ Logout করতে সমস্যা হয়েছে।");
    }
  }
};
