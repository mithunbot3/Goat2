const { getPrefix, getStreamFromURL } = global.utils;
const { commands } = global.GoatBot;

const BOT_NAME = "Mithun goat bot";
const header = "╔═━「 𝐇𝐄𝐋𝐏 𝐌𝐄𝐍𝐔 」━═╗";
const footer = "╚═━──────────────━═╝";
const credit = `🐐 ${BOT_NAME}`;

// 🖼️ এখানে তোমার ছবির লিংক বসাও (direct image link)
const IMAGES = [
  "https://i.imgur.com/XXXXXXX.jpg",
  "https://i.imgur.com/YYYYYYY.jpg"
];

function getRole(cmd) {
  return Number(cmd.config?.role) || 0;
}

function pickText(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.join("\n");
  return value.en || value.vi || Object.values(value)[0] || "";
}

function findCommand(name) {
  return commands.get(name) || commands.get(global.GoatBot.aliases.get(name));
}

// 🖼️ পিক সহ রিপ্লাই পাঠানোর ফাংশন
async function sendWithPic(message, body) {
  try {
    const url = IMAGES[Math.floor(Math.random() * IMAGES.length)];
    const stream = await getStreamFromURL(url);
    return await message.reply({ body, attachment: stream });
  } catch (e) {
    return message.reply(body); // ছবি না এলে শুধু টেক্সট
  }
}

function detailsMessage(cmd, prefix) {
  const info = cmd.config;
  const guide = pickText(info.guide) || "No usage info.";
  const desc = pickText(info.longDescription) || pickText(info.shortDescription) || "No description.";

  return (
    `╔═━「 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐃𝐄𝐓𝐀𝐈𝐋𝐒 」━═╗\n` +
    `┃ ✦ Name: ${info.name}\n` +
    `┃ ✦ Description: ${desc}\n` +
    `┃ ✦ Usage: ${guide.replace(/{p}/g, prefix).replace(/{pn}/g, prefix + info.name).replace(/{n}/g, info.name)}\n` +
    `┃ ✦ Role: ${getRole(cmd)}\n` +
    `┃ ✦ Category: ${info.category || "Uncategorized"}\n` +
    `${footer}\n` +
    `${credit}`
  );
}

module.exports = {
  config: {
    name: "help",
    version: "3.7",
    author: "Mithun",
    usePrefix: true,
    role: 0,
    category: "info",
    priority: 1
  },

  onStart: async function ({ message, args, event, role }) {
    const prefix = getPrefix(event.threadID);
    const arg = args[0]?.toLowerCase();

    const visible = Array.from(new Set(commands.values()))
      .filter(cmd => cmd.config?.name && getRole(cmd) <= role);

    // ---------- main list ----------
    if (!arg) {
      const grouped = {};
      for (const cmd of visible) {
        const cat = (cmd.config.category || "uncategorized").toLowerCase();
        (grouped[cat] = grouped[cat] || []).push(cmd.config.name);
      }

      const body = Object.keys(grouped)
        .sort()
        .map(cat =>
          `┃\n┃ 📁 ${cat.toUpperCase()}\n` +
          grouped[cat].sort().map(n => `┃ ✦ ${n}`).join("\n")
        )
        .join("\n");

      return sendWithPic(
        message,
        `${header}\n` +
        `┃ 🤖 Bot: ${BOT_NAME}\n` +
        `┃ 🔑 Prefix: ${prefix}\n` +
        `┃ 📂 Total Commands: ${visible.length}\n` +
        `${body}\n` +
        `${footer}\n\n` +
        `📌 ${prefix}help -<category> → filter by category\n` +
        `📌 ${prefix}help <command> → command info\n\n` +
        `${credit}`
      );
    }

    // ---------- help -c <command> ----------
    if (arg === "-c") {
      if (!args[1])
        return message.reply(`✘ Usage: ${prefix}help -c <command>`);
      const cmd = findCommand(args[1].toLowerCase());
      if (!cmd || getRole(cmd) > role)
        return message.reply(`✘ Command "${args[1]}" not found or access denied.`);
      return sendWithPic(message, detailsMessage(cmd, prefix));
    }

    // ---------- help -<category> ----------
    if (arg.startsWith("-")) {
      const category = arg.slice(1);
      const matched = visible
        .filter(cmd => (cmd.config.category || "").toLowerCase() === category)
        .map(cmd => `┃ ✦ ${cmd.config.name}`);

      if (matched.length === 0)
        return message.reply(`✘ No commands found under "${category}".`);

      return sendWithPic(
        message,
        `╔═━「 𝐂𝐀𝐓𝐄𝐆𝐎𝐑𝐘: ${category.toUpperCase()} 」━═╗\n` +
        `${matched.join("\n")}\n` +
        `${footer}\n\n` +
        `📌 Try: ${prefix}help <command> to view details\n\n` +
        `${credit}`
      );
    }

    // ---------- help <command> ----------
    const cmd = findCommand(arg);
    if (!cmd || getRole(cmd) > role)
      return message.reply(`✘ Command "${arg}" not found.`);

    return sendWithPic(message, detailsMessage(cmd, prefix));
  }
};
