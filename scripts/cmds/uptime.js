const os = require("os");
const moment = require("moment-timezone");

const BOT_BRAND = "Mithun goat bot";
const TIMEZONE = "Asia/Dhaka";

const human = (bytes) => {
	const units = ["B", "KB", "MB", "GB", "TB"];
	let i = 0;
	let v = bytes;
	while (v >= 1024 && i < units.length - 1) {
		v /= 1024;
		i++;
	}
	return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

// ▰▰▰▰▱▱▱▱▱▱ স্টাইলের প্রোগ্রেস বার
const bar = (percent, size = 10) => {
	const p = Math.max(0, Math.min(100, percent));
	const filled = Math.round((p / 100) * size);
	return "▰".repeat(filled) + "▱".repeat(size - filled);
};

const fmtUptime = (sec) => {
	const d = Math.floor(sec / 86400);
	const h = Math.floor((sec % 86400) / 3600);
	const m = Math.floor((sec % 3600) / 60);
	const s = Math.floor(sec % 60);
	return { d, h, m, s, text: `${d}d ${h}h ${m}m ${s}s` };
};

// বট ইউজ করা প্রসেসের CPU % (১ সেকেন্ড স্যাম্পল)
async function getCpuPercent() {
	const start = process.cpuUsage();
	const t0 = process.hrtime.bigint();
	await new Promise((r) => setTimeout(r, 500));
	const diff = process.cpuUsage(start);
	const elapsedUs = Number(process.hrtime.bigint() - t0) / 1000;
	const cores = os.cpus().length || 1;
	return ((diff.user + diff.system) / (elapsedUs * cores)) * 100;
}

module.exports = {
	config: {
		name: "uptime",
		aliases: ["up", "runtime", "status"],
		version: "2.0",
		author: "Mithun",
		countDown: 5,
		role: 0,
		description: {
			en: "Show bot uptime, ping, system stats and live usage"
		},
		category: "info",
		guide: {
			en: "{pn}"
		}
	},

	onStart: async function ({ message, api, event }) {
		const t0 = Date.now();
		api.setMessageReaction("⏳", event.messageID, () => {}, true);

		try {
			// ---------- uptime ----------
			const botStart = (global.GoatBot && global.GoatBot.startTime) || (Date.now() - process.uptime() * 1000);
			const bot = fmtUptime((Date.now() - botStart) / 1000);
			const sys = fmtUptime(os.uptime());

			// ---------- cpu ----------
			const cpus = os.cpus();
			const cpuModel = ((cpus[0] && cpus[0].model) || "Unknown").replace(/\s+/g, " ").trim();
			const cores = cpus.length;
			const cpuUse = await getCpuPercent();
			const load = os.loadavg()[0].toFixed(2);

			// ---------- ram ----------
			const totalMem = os.totalmem();
			const usedMem = totalMem - os.freemem();
			const memPct = (usedMem / totalMem) * 100;

			const proc = process.memoryUsage();
			const heapPct = (proc.heapUsed / proc.heapTotal) * 100;

			// ---------- bot data ----------
			const nick = (global.GoatBot && global.GoatBot.config && global.GoatBot.config.nickNameBot) || BOT_BRAND;
			const prefix = (global.GoatBot && global.GoatBot.config && global.GoatBot.config.prefix) || ".";
			const cmdCount = global.GoatBot && global.GoatBot.commands ? global.GoatBot.commands.size : 0;
			const users = global.db && global.db.allUserData ? global.db.allUserData.length : 0;
			const threads = global.db && global.db.allThreadData ? global.db.allThreadData.length : 0;

			// ---------- ping ----------
			const ping = Date.now() - t0;
			const pingStatus = ping < 300 ? "🟢 Excellent" : ping < 800 ? "🟡 Good" : "🔴 Slow";

			const now = moment().tz(TIMEZONE);

			const body =
`🐐 ${BOT_BRAND.toUpperCase()}
━━━━━━━━━━━━━━━━━
⏱️ 𝗨𝗣𝗧𝗜𝗠𝗘
➤ Bot   : ${bot.text}
➤ Server: ${sys.text}

📡 𝗣𝗜𝗡𝗚
➤ ${ping}ms  ${pingStatus}

🧠 𝗖𝗣𝗨
➤ ${cpuModel}
➤ Cores : ${cores} | Load: ${load}
➤ Usage : ${bar(cpuUse)} ${cpuUse.toFixed(1)}%

💾 𝗥𝗔𝗠
➤ System: ${bar(memPct)} ${memPct.toFixed(1)}%
➤ ${human(usedMem)} / ${human(totalMem)}
➤ Bot   : ${human(proc.rss)} (Heap ${heapPct.toFixed(0)}%)

🖥️ 𝗦𝗬𝗦𝗧𝗘𝗠
➤ ${os.platform()} ${os.arch()}
➤ Node  : ${process.version}

🤖 𝗕𝗢𝗧
➤ Name   : ${nick}
➤ Prefix : ${prefix}
➤ Cmds   : ${cmdCount}
➤ Users  : ${users}
➤ Threads: ${threads}
━━━━━━━━━━━━━━━━━
🕒 ${now.format("DD/MM/YYYY • hh:mm:ss A")}
✨ Created by Mithun ✨`;

			await message.reply(body);
			api.setMessageReaction("✅", event.messageID, () => {}, true);
		} catch (err) {
			console.error("uptime error:", err);
			api.setMessageReaction("❌", event.messageID, () => {}, true);
			return message.reply("⚠️ Uptime তথ্য আনতে সমস্যা হয়েছে।");
		}
	}
};
