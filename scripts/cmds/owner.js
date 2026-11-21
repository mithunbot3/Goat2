const { getStreamFromURL } = global.utils;

const IMG = "https://i.imgur.com/p64G39M.jpeg";

module.exports = {
  config: {
    name: "owner",
    version: "3.0",
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
      return message.reply({ attachment: stream });
    } catch (e) {
      console.error("owner error:", e.message);
    }
  }
};
