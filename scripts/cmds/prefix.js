const { getPrefix } = global.utils;

module.exports = {
  config: {
    name: "prefix",
    version: "3.4",
    author: "Mithun",
    countDown: 5,
    role: 0,
    category: "TOOLS"
  },

  onStart: async function () {},

  onChat: async function ({ event, message }) {
    const { threadID, body } = event;
    if (!body || body.trim().toLowerCase() !== "prefix") return;

    return message.reply(`🔑 Prefix: ${getPrefix(threadID)}`);
  }
};
