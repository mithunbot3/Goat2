const axios = require("axios");

const COMMAND_NAME = "baby";
const FALLBACK_API = "https://noobs-api.top/dipto";

// প্রথমে আগের লিংক থেকে নেয়, না পেলে ফলব্যাক API ব্যবহার করে
const baseApiUrl = async () => {
	try {
		const base = await axios.get("https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json", { timeout: 8000 });
		return base.data.api || FALLBACK_API;
	}
	catch (_) {
		return FALLBACK_API;
	}
};

const randomMsgs = [
	"বেশি bot Bot করলে leave নিবো কিন্তু😒😒",
	"শুনবো না😼 তুমি আমার বস সিয়াম কে প্রেম করাই দাও নাই🥺পচা তুমি🥺",
	"আমি আবাল দের সাথে কথা বলি না,ok😒",
	"এতো ডেকো না,প্রেম এ পরে যাবো তো🙈",
	"Bolo Babu, তুমি কি আমার বস সিয়াম কে ভালোবাসো? 🙈💋",
	"বার বার ডাকলে মাথা গরম হয়ে যায় কিন্তু😑",
	"হ্যা বলো😒, তোমার জন্য কি করতে পারি😐😑?",
	"এতো ডাকছিস কেন?গালি শুনবি নাকি? 🤬",
	"I love you janu🥰",
	"আরে Bolo আমার জান ,কেমন আছো?😚",
	"আজ বট বলে অসম্মান করছি,😰😿",
	"Hop beda😾,Boss বল boss😼",
	"চুপ থাক ,নাই তো তোর দাত ভেগে দিবো কিন্তু",
	"আমাকে না ডেকে মেয়ে হলে বস সিয়ামের ইনবক্সে চলে যা 🌚😂",
	"আমাকে বট না বলে , বস সিয়াম কে জানু বল জানু 😘",
	"বার বার Disturb করছিস কোনো😾,আমার জানুর সাথে ব্যাস্ত আছি😋",
	"আরে বলদ এতো ডাকিস কেন🤬",
	"আমাকে ডাকলে ,আমি কিন্তু কিস করে দিবো😘",
	"আমারে এতো ডাকিস না আমি মজা করার mood এ নাই এখন😒",
	"হ্যাঁ জানু , এইদিক এ আসো কিস দেই🤭 😘",
	"দূরে যা, তোর কোনো কাজ নাই, শুধু bot bot করিস 😉😋🤣",
	"তোর কথা তোর বাড়ি কেউ শুনে না ,তো আমি কোনো শুনবো ?🤔😂",
	"আমাকে ডেকো না,আমি বস সিয়ামের সাথে ব্যাস্ত আছি",
	"কি হলো , মিস্টেক করচ্ছিস নাকি🤣",
	"বলো কি বলবা, সবার সামনে বলবা নাকি?🤭🤏",
	"জান মেয়ে হলে বস সিয়ামের ইনবক্সে চলে যাও 😍🫣💕",
	"কালকে দেখা করিস তো একটু 😈",
	"হা বলো, শুনছি আমি 😏",
	"আর কত বার ডাকবি ,শুনছি তো",
	"হুম বলো কি বলবে😒",
	"বলো কি করতে পারি তোমার জন্য",
	"আমি তো অন্ধ কিছু দেখি না🐸 😎",
	"আরে বোকা বট না জানু বল জানু😌",
	"বলো জানু 🌚",
	"তোর কি চোখে পড়ে না আমি ব্যাস্ত আছি😒",
	"হুম জান তোমার ওই খানে উম্মহ😑😘",
	"আহ শুনা আমার তোমার অলিতে গলিতে উম্মাহ😇😘",
	"jang hanga korba😒😬",
	"হুম জান তোমার অইখানে উম্মমাহ😷😘",
	"আসসালামু আলাইকুম বলেন আপনার জন্য কি করতে পারি..!🥰",
	"ভালোবাসার নামক আবলামি করতে চাইলে বস সিয়াম এর ইনবক্সে গুতা দিন ~🙊😘🤣",
	"আমাকে এতো না ডেকে বস সিয়াম কে একটা গফ দে 🙄",
	"আমাকে এতো না ডেকছ কেন ভলো টালো বাসো নাকি🤭🙈",
	"🌻🌺💚-আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ-💚🌺🌻",
	"আমি এখন বস সিয়ামের সাথে বিজি আছি আমাকে ডাকবেন না-😕😏 ধন্যবাদ-🤝🌻",
	"আমাকে না ডেকে আমার বস Siam কে একটা জি এফ দাও-😽🫶🌺",
	"ঝাং থুমালে আইলাপিউ পেপি-💝😽",
	"উফফ বুঝলাম না এতো ডাকছেন কেনো-😤😡😈",
	"জান তোমার বান্ধবী রে আমার বস সিয়ামের হাতে তুলে দিবা-🙊🙆‍♂",
	"আজকে আমার মন ভালো নেই তাই আমারে ডাকবেন না-😪🤧",
	"ঝাং 🫵থুমালে য়ামি রাইতে পালুপাসি উম্মম্মাহ-🌺🤤💦",
	"চুনা ও চুনা আমার বস সিয়ামের হবু বউ রে কেও দেকছো খুজে পাচ্ছি না😪🤧😭",
	"স্বপ্ন তোমারে নিয়ে দেখতে চাই তুমি যদি আমার হয়ে থেকে যাও-💝🌺🌻",
	"জান হাঙ্গা করবা-🙊😝🌻",
	"তোদের জন্য একটুও শান্তি নাই! শুধু ডিস্টার্ব করিস 😿",
	"জান মেয়ে হলে চিপায় আসো বস সিয়াম এর থেকে অনেক ভালোবাসা শিখছি তোমার জন্য-🙊🙈😽",
	"ইসস এতো ডাকো কেনো লজ্জা লাগে তো-🙈🖤🌼",
	"আমার বস সিয়ামের পক্ষ থেকে তোমারে এতো এতো ভালোবাসা-🥰😽🫶",
	"ভালোবাসা করতে চাইলে সিয়ামের ইনবক্স যাও-🙊🥱👅",
	"আমার জান তুমি শুধু আমার 💝",
	"কিরে প্রেম করবি তাহলে বস সিয়ামের ইনবক্সে গুতা দে 😘",
	"জান আমার বস সিয়াম কে বিয়ে করবা-🙊😘🥳"
];

function registerReply(info, author) {
	if (!info || !info.messageID)
		return;
	global.GoatBot.onReply.set(info.messageID, {
		commandName: COMMAND_NAME,
		messageID: info.messageID,
		author
	});
}

async function chat(text, senderID) {
	const url = `${await baseApiUrl()}/baby?text=${encodeURIComponent(text)}&senderID=${senderID}&font=1`;
	return (await axios.get(url, { timeout: 15000 })).data.reply;
}

// "a - b" কে ভাগ করে, ফরম্যাট ঠিক না থাকলে null দেয়
function splitDash(text) {
	const idx = text.search(/\s+-\s+/);
	if (idx === -1)
		return null;
	const left = text.slice(0, idx).trim();
	const right = text.slice(idx).replace(/^\s+-\s+/, "").trim();
	if (!left || !right)
		return null;
	return [left, right];
}

module.exports = {
	config: {
		name: "baby",
		aliases: ["bbe", "babe"],
		version: "7.0",
		author: "dipto",
		countDown: 0,
		role: 0,
		description: {
			vi: "Tốt hơn tất cả sim simi",
			en: "better than all sim simi"
		},
		category: "chat",
		guide: {
			en: "   {pn} [anyMessage]"
				+ "\n   {pn} teach [YourMessage] - [Reply1], [Reply2]..."
				+ "\n   {pn} teach amar [YourMessage] - [Reply]"
				+ "\n   {pn} teach react [YourMessage] - [react1], [react2]..."
				+ "\n   {pn} remove [YourMessage]"
				+ "\n   {pn} rm [YourMessage] - [indexNumber]"
				+ "\n   {pn} msg [YourMessage]"
				+ "\n   {pn} list | list all [limit]"
				+ "\n   {pn} edit [YourMessage] - [NewMessage]"
				+ "\n\n   Without prefix: baby / bby / bot / বট + message"
		}
	},

	onStart: async function ({ event, args, message, usersData }) {
		try {
			const link = `${await baseApiUrl()}/baby`;
			const dipto = args.join(" ").toLowerCase();
			const uid = event.senderID;
			const invalid = "❌ | Invalid format! Use: teach [YourMessage] - [Reply1], [Reply2]...";

			if (!args[0]) {
				const ran = ["Bolo baby", "hum", "type help baby", "type !baby hi"];
				return message.reply(ran[Math.floor(Math.random() * ran.length)]);
			}

			if (args[0] === "remove") {
				const fina = dipto.replace("remove ", "");
				const res = await axios.get(`${link}?remove=${encodeURIComponent(fina)}&senderID=${uid}`);
				return message.reply(res.data.message);
			}

			if (args[0] === "rm") {
				const parts = splitDash(dipto.replace("rm ", ""));
				if (!parts)
					return message.reply("❌ | Invalid format! Use: rm [YourMessage] - [indexNumber]");
				const res = await axios.get(`${link}?remove=${encodeURIComponent(parts[0])}&index=${encodeURIComponent(parts[1])}`);
				return message.reply(res.data.message);
			}

			if (args[0] === "list") {
				const res = await axios.get(`${link}?list=all`);
				if (args[1] === "all") {
					const list = res.data?.teacher?.teacherList;
					if (!Array.isArray(list))
						return message.reply("❌ | API off or no data");
					const limit = parseInt(args[2]) || 100;
					const teachers = await Promise.all(list.slice(0, limit).map(async (item) => {
						const number = Object.keys(item)[0];
						const value = item[number];
						const name = (await usersData.getName(number).catch(() => number)) || "unknown";
						return { name, value };
					}));
					teachers.sort((a, b) => b.value - a.value);
					const output = teachers.map((t, i) => `${i + 1}/ ${t.name}: ${t.value}`).join("\n");
					return message.reply(`Total Teach = ${res.data.length}\n\n👑 | List of Teachers of baby\n${output}`);
				}
				return message.reply(`❇️ | Total Teach = ${res.data.length || "api off"}\n♻️ | Total Response = ${res.data.responseLength || "api off"}`);
			}

			if (args[0] === "msg" || args[0] === "message") {
				const text = dipto.replace(/^(msg|message) /, "");
				const res = await axios.get(`${link}?list=${encodeURIComponent(text)}`);
				return message.reply(`Message ${text} = ${res.data.data}`);
			}

			if (args[0] === "edit") {
				const parts = splitDash(dipto.replace("edit ", ""));
				if (!parts)
					return message.reply("❌ | Invalid format! Use edit [YourMessage] - [NewReply]");
				const res = await axios.get(`${link}?edit=${encodeURIComponent(parts[0])}&replace=${encodeURIComponent(parts[1])}&senderID=${uid}`);
				return message.reply(`changed ${res.data.message}`);
			}

			if (args[0] === "teach" && args[1] !== "amar" && args[1] !== "react") {
				const parts = splitDash(dipto.replace("teach ", ""));
				if (!parts)
					return message.reply(invalid);
				const re = await axios.get(`${link}?teach=${encodeURIComponent(parts[0])}&reply=${encodeURIComponent(parts[1])}&senderID=${uid}&threadID=${event.threadID}`);
				let teacher = "unknown";
				try {
					teacher = (await usersData.getName(re.data.teacher)) || "unknown";
				}
				catch (_) { }
				return message.reply(`✅ Replies added ${re.data.message}\nTeacher: ${teacher}\nTeachs: ${re.data.teachs}`);
			}

			if (args[0] === "teach" && args[1] === "amar") {
				const parts = splitDash(dipto.replace("teach amar ", ""));
				if (!parts)
					return message.reply(invalid);
				const re = await axios.get(`${link}?teach=${encodeURIComponent(parts[0])}&senderID=${uid}&reply=${encodeURIComponent(parts[1])}&key=intro`);
				return message.reply(`✅ Replies added ${re.data.message}`);
			}

			if (args[0] === "teach" && args[1] === "react") {
				const parts = splitDash(dipto.replace("teach react ", ""));
				if (!parts)
					return message.reply(invalid);
				const re = await axios.get(`${link}?teach=${encodeURIComponent(parts[0])}&react=${encodeURIComponent(parts[1])}`);
				return message.reply(`✅ Replies added ${re.data.message}`);
			}

			if (["amar name ki", "amr nam ki", "amar nam ki", "amr name ki", "whats my name"].some(p => dipto.includes(p))) {
				const res = await axios.get(`${link}?text=amar name ki&senderID=${uid}&key=intro`);
				return message.reply(res.data.reply);
			}

			const reply = await chat(dipto, uid);
			return message.reply(reply, (err, info) => registerReply(info, uid));
		}
		catch (e) {
			console.log(e);
			return message.reply("Check console for error");
		}
	},

	// বটের রিপ্লাইয়ের উপর রিপ্লাই করলে চ্যাট চলবে
	onReply: async function ({ api, event, message }) {
		if (event.senderID == api.getCurrentUserID())
			return;
		try {
			const text = (event.body || "").toLowerCase().trim();
			if (!text)
				return;
			const reply = await chat(text, event.senderID);
			return message.reply(reply, (err, info) => registerReply(info, event.senderID));
		}
		catch (e) {
			return message.reply(`Error: ${e.message}`);
		}
	},

	// প্রিফিক্স ছাড়া: baby / bby / bot / বট
	onChat: async function ({ api, event, message }) {
		try {
			if (event.senderID == api.getCurrentUserID())
				return;

			const body = (event.body || "").toLowerCase().trim();
			const match = body.match(/^(baby|bby|bot|বট)(\s+|$)/);
			if (!match)
				return;

			const text = body.slice(match[0].length).trim();

			if (!text) {
				const msg = randomMsgs[Math.floor(Math.random() * randomMsgs.length)];
				return message.reply(msg, (err, info) => registerReply(info, event.senderID));
			}

			const reply = await chat(text, event.senderID);
			return message.reply(reply, (err, info) => registerReply(info, event.senderID));
		}
		catch (e) {
			return message.reply(`Error: ${e.message}`);
		}
	}
};
