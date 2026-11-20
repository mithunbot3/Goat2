const fs = require("fs-extra");

module.exports = {
	config: {
		name: "restart",
		aliases: ["rest", "res"],
		version: "1.2",
		author: "NTKhang modified mithun",
		countDown: 5,
		role: 2,
		description: {
			vi: "Khởi động lại bot",
			en: "Restart bot"
		},
		category: "Owner",
		guide: {
			vi: "   {pn}: Khởi động lại bot",
			en: "   {pn}: Restart bot (also works without prefix: rest, res, restart)"
		}
	},

	langs: {
		vi: {
			restartting: "🔄 | Đang khởi động lại bot..."
		},
		en: {
			restartting: "🔄 | Restarting bot..."
		}
	},

	onLoad: function ({ api }) {
		const pathFile = `${__dirname}/tmp/restart.txt`;
		if (fs.existsSync(pathFile)) {
			const [tid, time] = fs.readFileSync(pathFile, "utf-8").split(" ");
			api.sendMessage(`✅ | Bot restarted\n⏰ | Time: ${(Date.now() - time) / 1000}s`, tid);
			fs.unlinkSync(pathFile);
		}
	},

	// প্রিফিক্স সহ: /restart, /rest, /res
	onStart: async function ({ message, event, getLang }) {
		await restartBot({ message, event, getLang });
	},

	// প্রিফিক্স ছাড়া: rest, res, restart (শুধু অ্যাডমিন)
	onChat: async function ({ message, event, getLang, role }) {
		const triggers = ["rest", "res", "restart"];
		const body = (event.body || "").trim().toLowerCase();

		if (!triggers.includes(body))
			return;
		if (role < 2)
			return;

		await restartBot({ message, event, getLang });
	}
};

async function restartBot({ message, event, getLang }) {
	const dir = `${__dirname}/tmp`;
	fs.ensureDirSync(dir);
	fs.writeFileSync(`${dir}/restart.txt`, `${event.threadID} ${Date.now()}`);
	await message.reply(getLang("restartting"));
	process.exit(2);
}
