const { getPrefix } = global.utils;
const { commands } = global.GoatBot;

const header = "╔═━「 𝐇𝐄𝐋𝐏 𝐌𝐄𝐍𝐔 」━═╗";
const footer = "╚═━──────────────━═╝";

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
    `${footer}`
  );
}

module.exports = {
  config: {
    name: "help",
    version: "3.6",
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

      return message.reply(
        `${header}\n` +
        `┃ 🔑 Prefix: ${prefix}\n` +
        `┃ 📂 Total Commands: ${visible.length}\n` +
        `${body}\n` +
        `${footer}\n\n` +
        `📌 ${prefix}help -<category> → filter by category\n` +
        `📌 ${prefix}help <command> → command info`
      );
    }

    // ---------- help -c <command> ----------
    if (arg === "-c") {
      if (!args[1])
        return message.reply(`✘ Usage: ${prefix}help -c <command>`);
      const cmd = findCommand(args[1].toLowerCase());
      if (!cmd || getRole(cmd) > role)
        return message.reply(`✘ Command "${args[1]}" not found or access denied.`);
      return message.reply(detailsMessage(cmd, prefix));
    }

    // ---------- help -<category> ----------
    if (arg.startsWith("-")) {
      const category = arg.slice(1);
      const matched = visible
        .filter(cmd => (cmd.config.category || "").toLowerCase() === category)
        .map(cmd => `┃ ✦ ${cmd.config.name}`);

      if (matched.length === 0)
        return message.reply(`✘ No commands found under "${category}".`);

      return message.reply(
        `╔═━「 𝐂𝐀𝐓𝐄𝐆𝐎𝐑𝐘: ${category.toUpperCase()} 」━═╗\n` +
        `${matched.join("\n")}\n` +
        `${footer}\n\n` +
        `📌 Try: ${prefix}help <command> to view details`
      );
    }

    // ---------- help <command> ----------
    const cmd = findCommand(arg);
    if (!cmd || getRole(cmd) > role)
      return message.reply(`✘ Command "${arg}" not found.`);

    return message.reply(detailsMessage(cmd, prefix));
  }
};
