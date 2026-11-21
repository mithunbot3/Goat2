const LIMIT = 10;
const BOT_NAME = "Mithun goat bot";

function memberCount(g) {
	return g.participants?.length || g.participantIDs?.length || 0;
}

function groupName(g) {
	return g.threadName || g.name || "Unnamed Group";
}

function getPageMessage(groups, page, totalPages, query) {
	const start = (page - 1) * LIMIT;
	const paged = groups.slice(start, start + LIMIT);

	let msg = `🐐 ${BOT_NAME}\n📦 LISTBOX\n━━━━━━━━━━━\n`;
	if (query) msg += `🔍 Search: ${query}\n`;
	msg += `📊 Total: ${groups.length} group(s)\n━━━━━━━━━━━\n\n`;

	paged.forEach((g, i) => {
		msg += `${i + 1}. ${groupName(g)}\n`;
		msg += `   👥 ${memberCount(g)} members\n`;
		msg += `   🆔 ${g.threadID}\n\n`;
	});

	msg += `📄 Page: ${page}/${totalPages}\n━━━━━━━━━━━\n`;
	msg += `Reply with:\n`;
	msg += `➤ next / back / <page no>\n`;
	msg += `➤ left <n> [n2 n3] → গ্রুপ ছাড়ো\n`;
	msg += `➤ join <n> → তোমাকে অ্যাড করবে\n`;
	msg += `➤ info <n> → গ্রুপের ডিটেইলস\n`;
	msg += `➤ msg <n> <text> → গ্রুপে মেসেজ পাঠাও`;
	return msg;
}

async function sendList(api, event, commandName, groups, page, query) {
	const totalPages = Math.max(1, Math.ceil(groups.length / LIMIT));
	const msg = getPageMessage(groups, page, totalPages, query);

	return api.sendMessage(msg, event.threadID, (err, info) => {
		if (err) return;
		global.GoatBot.onReply.set(info.messageID, {
			commandName,
			messageID: info.messageID,
			author: event.senderID,
			allGroups: groups,
			page,
			query
		});
	}, event.messageID);
}

module.exports = {
	config: {
		name: "listbox",
		aliases: ["grouplist", "listgroup"],
		author: "Mithun",
		version: "2.0.0",
		cooldowns: 5,
		role: 2,
		shortDescription: {
			en: "List all groups with search, info, join, leave and message options."
		},
		longDescription: {
			en: "List all group chats the bot is in (sorted by members) with pagination, search, info, leave, join and send message controls."
		},
		category: "BOX CHAT",
		guide: {
			en: "{p}{n} [page_number]\n{p}{n} <group name to search>"
		}
	},

	onStart: async function ({ api, event, args, commandName }) {
		try {
			const allThreads = await api.getThreadList(1000, null, ["INBOX"]);
			let groups = allThreads.filter(g => g.isGroup === true);

			if (groups.length === 0) {
				return api.sendMessage("❌ কোনো গ্রুপ পাওয়া যায়নি।", event.threadID, event.messageID);
			}

			// বেশি মেম্বারের গ্রুপ আগে
			groups.sort((a, b) => memberCount(b) - memberCount(a));

			let page = 1;
			let query = "";

			if (args.length > 0) {
				if (args.length === 1 && !isNaN(args[0])) {
					page = parseInt(args[0]);
				} else {
					// নাম দিয়ে সার্চ
					query = args.join(" ");
					groups = groups.filter(g =>
						groupName(g).toLowerCase().includes(query.toLowerCase()) ||
						String(g.threadID) === query
					);
					if (groups.length === 0) {
						return api.sendMessage(`❌ "${query}" নামে কোনো গ্রুপ পাওয়া যায়নি।`, event.threadID, event.messageID);
					}
				}
			}

			const totalPages = Math.ceil(groups.length / LIMIT);
			if (page > totalPages || page < 1) {
				return api.sendMessage(`❌ ভুল পেজ! 1 থেকে ${totalPages} এর মধ্যে দাও।`, event.threadID, event.messageID);
			}

			return sendList(api, event, commandName, groups, page, query);
		} catch (error) {
			console.error("Error in listbox:", error);
			api.sendMessage("❌ গ্রুপ লিস্ট আনতে সমস্যা হয়েছে।", event.threadID, event.messageID);
		}
	},

	onReply: async function ({ api, event, Reply, commandName }) {
		const { author, allGroups, page, messageID, query } = Reply;
		if (event.senderID !== author) return;

		const args = event.body.trim().split(/\s+/);
		const action = args[0].toLowerCase();
		const totalPages = Math.max(1, Math.ceil(allGroups.length / LIMIT));

		const getTarget = (n) => {
			const idx = (page - 1) * LIMIT + (n - 1);
			if (isNaN(n) || n < 1 || n > LIMIT || idx < 0 || idx >= allGroups.length) return null;
			return allGroups[idx];
		};

		// ---------- LEFT ----------
		if (action === "left" || action === "out") {
			const nums = args.slice(1).map(n => parseInt(n)).filter(n => !isNaN(n));
			if (nums.length === 0) {
				return api.sendMessage("⚠️ গ্রুপ নম্বর দাও। যেমন: left 1 অথবা left 1 2 3", event.threadID, event.messageID);
			}

			let left = 0, failed = 0;
			const names = [];
			for (const n of [...new Set(nums)]) {
				const g = getTarget(n);
				if (!g) { failed++; continue; }
				try {
					await api.removeUserFromGroup(api.getCurrentUserID(), g.threadID);
					left++;
					names.push(groupName(g));
				} catch (e) {
					failed++;
					console.error(`Failed to leave ${g.threadID}:`, e);
				}
			}

			let res = `✅ ${left}টি গ্রুপ ছেড়েছে।`;
			if (names.length) res += `\n\n` + names.map(n => `• ${n}`).join("\n");
			if (failed) res += `\n\n⚠️ ${failed}টি ফেল হয়েছে।`;
			return api.sendMessage(res, event.threadID, event.messageID);
		}

		// ---------- JOIN ----------
		if (action === "join") {
			const g = getTarget(parseInt(args[1]));
			if (!g) return api.sendMessage("❌ ভুল গ্রুপ নম্বর! উদাহরণ: join 1", event.threadID, event.messageID);

			const name = groupName(g);
			try {
				const threadInfo = await api.getThreadInfo(g.threadID);
				if ((threadInfo.participantIDs || []).includes(event.senderID)) {
					return api.sendMessage(`ℹ️ তুমি আগে থেকেই "${name}" গ্রুপে আছো।`, event.threadID, event.messageID);
				}
				await api.addUserToGroup(event.senderID, g.threadID);

				if (threadInfo.approvalMode) {
					return api.sendMessage(`⏳ গ্রুপে অ্যাপ্রুভাল অন আছে। অ্যাডমিন অ্যাপ্রুভ করলে তুমি জয়েন হবে (পেন্ডিং লিস্টে আছো)।`, event.threadID, event.messageID);
				}
				return api.sendMessage(`✅ তোমাকে "${name}" গ্রুপে অ্যাড করা হয়েছে!`, event.threadID, event.messageID);
			} catch (err) {
				console.error("Join error:", err);
				return api.sendMessage(`❌ "${name}" গ্রুপে অ্যাড করা যায়নি। প্রাইভেসি সেটিং বা বটের পারমিশন চেক করো।`, event.threadID, event.messageID);
			}
		}

		// ---------- INFO ----------
		if (action === "info") {
			const g = getTarget(parseInt(args[1]));
			if (!g) return api.sendMessage("❌ ভুল গ্রুপ নম্বর! উদাহরণ: info 1", event.threadID, event.messageID);

			try {
				const t = await api.getThreadInfo(g.threadID);
				const info =
					`📋 GROUP INFO\n━━━━━━━━━━━\n` +
					`📛 Name: ${t.threadName || groupName(g)}\n` +
					`🆔 TID: ${g.threadID}\n` +
					`👥 Members: ${(t.participantIDs || []).length}\n` +
					`👑 Admins: ${(t.adminIDs || []).length}\n` +
					`🔒 Approval: ${t.approvalMode ? "ON" : "OFF"}\n` +
					`💬 Messages: ${t.messageCount ?? g.messageCount ?? "N/A"}\n` +
					`😀 Emoji: ${t.emoji || "N/A"}`;
				return api.sendMessage(info, event.threadID, event.messageID);
			} catch (e) {
				console.error("Info error:", e);
				return api.sendMessage("❌ গ্রুপের তথ্য আনা যায়নি।", event.threadID, event.messageID);
			}
		}

		// ---------- MSG ----------
		if (action === "msg" || action === "send") {
			const g = getTarget(parseInt(args[1]));
			const text = args.slice(2).join(" ");
			if (!g || !text) {
				return api.sendMessage("⚠️ ব্যবহার: msg <n> <মেসেজ>\nযেমন: msg 1 Hello everyone", event.threadID, event.messageID);
			}
			try {
				await api.sendMessage(text, g.threadID);
				return api.sendMessage(`✅ "${groupName(g)}" গ্রুপে মেসেজ পাঠানো হয়েছে।`, event.threadID, event.messageID);
			} catch (e) {
				console.error("Msg error:", e);
				return api.sendMessage("❌ মেসেজ পাঠানো যায়নি।", event.threadID, event.messageID);
			}
		}

		// ---------- PAGE NAVIGATION ----------
		let newPage = page;
		if (action === "next") newPage = page + 1;
		else if (action === "back" || action === "prev") newPage = page - 1;
		else if (!isNaN(action)) newPage = parseInt(action);
		else return;

		if (newPage > totalPages || newPage < 1) {
			return api.sendMessage(`❌ ভুল পেজ! 1 থেকে ${totalPages} এর মধ্যে দাও।`, event.threadID, event.messageID);
		}

		api.unsendMessage(messageID);
		return sendList(api, event, commandName, allGroups, newPage, query);
	}
};
