const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "murgi_data.json");
const DEFAULT_INTERVAL = 3; // সেকেন্ড

// [কথা, ট্যাগ হবে কিনা]
const DEFAULT_MESSAGES = [
	// ---------- ছোট কথা ----------
	["আমার বস মিঠুনের কাছে ক্ষমা চা, না হলে মজা শুরু করলাম, আটকাতে পারলে আটকা🥰", true],
	["ওই মুরগি 🐔 কক কক কক 😍..", true],
	["মুরগির বাচ্ছা কোথায় পালাস 🐰", true],
	["ডিম পাড়ার সময় হয়ে গেছে 💔!", true],
	["কথা কম বল, নইলে তোকে মুরগির খোঁয়াড়ে ঢুকিয়ে দিব", true],
	["depression থেকেও বড় হলো তোর মুরগির ডাক 🤬", true],
	["বোকা মুরগি, দানা খাবি আয় 🤟", true],
	["কক কক কক, মুরগির মতো দৌড়ানি দেখাইতে হবে 🤝", true],
	["~ আরো মজা খাবি নাকি মুরগি 🤖", false],
	["DNA টেস্ট করা দেখবি তুই মুরগিরই বংশ 🧬", true],
	["হিজলা মুরগি, বালির মধ্যে দৌড়াইয়া দেখা ✋", true],
	["টুকাই মুরগি, দানা খাবি আয় 🤟", true],
	["মুরগির ঝোল রাঁধমু আজকে 🍲", true],
	["~ আমার মুরগির ছানা, যা ভাগ 🤖", false],

	// ---------- বড় বড় ফানি কথা ----------
	["শোন মুরগি, তুই এত জোরে কক কক করিস যে পাশের বাড়ির মোরগ পর্যন্ত ঘুম থেকে উঠে বলছে ‘ভাই, এই পাবলিকটা কে? আমার চাকরিটা খেয়ে ফেলবে তো!’ 🐓😂", true],
	["তোরে দেখলে আমার মনে হয় বিধাতা ডিম পাড়ার মেশিন বানাইতে গিয়া ভুল করে একটা মানুষ বানাইয়া ফেলছে, তারপর লজ্জায় ওপর থেকে পালক লাগাইয়া দিছে 🥚🤣", true],
	["তোর হাঁটা দেখলে মনে হয় মুরগি ম্যারাথনে নাম লিখাইছে কিন্তু রাস্তা চিনে না, তাই গোল গোল ঘুরতেছে আর মাঝে মাঝে থেমে দানা খুঁজতেছে 🏃‍♂️🌾😆", true],
	["তুই যেদিন প্রথম অনলাইনে আসছিলি, সেদিন ফেসবুকের সার্ভার নিজেই বলছিল ‘এই ট্রাফিক সামলানো যাবে না, একটা মুরগি ঢুকছে!’ তারপর থেকে সবাই সাবধানে আছে 💻🐔", true],
	["মিঠুন বসের ঘোষণা: আজ থেকে তোর নাম মুরগি রাখা হইলো। তোর জন্য আলাদা খাঁচা, আলাদা দানা আর আলাদা বাংলা সিনেমার টিকেট বরাদ্দ। শুধু ডিম পাড়তে ভুলিস না, বস রাগ করবে 🎬🥚", true],
	["তোর কথা শুনে আমার মাথা ঘুরতেছে। মনে হয় আমি রোবট না, আমি একটা পুরান ফ্যান, আর তুই বাতাস ছাড়া শুধু শব্দ করতেছিস ঘ্যাঁচ ঘ্যাঁচ কক কক 🌀🐔", true],
	["তুই এমন মুরগি যে কেএফসি তোরে দেখে বলছে ‘ভাই, আমরা মার্কেটিং বন্ধ করে দিলাম, তুই একাই যথেষ্ট ভয় দেখাইতে পারস’ 🍗😱", true],
	["রাতে ঘুমানোর আগে তুই নাকি মুরগির মতো ‘কক’ করে গুড নাইট বলিস, সেই শব্দে পাড়ার কুত্তাগুলাও ভাবে ‘এই লোকটা আমাদের চেয়েও ডেঞ্জারাস!’ 🌙🐶", true],
	["তোরে একটা সিক্রেট বলি, মুরগিরা নাকি তোরে নিয়ে মিটিং করছে। এজেন্ডা ছিল ‘এই মানুষটা আমাদের চেয়েও বেশি কক কক করে কেন?’ রেজুলেশন এখনো পাস হয় নাই 🤫🐔", true],
	["মিঠুন বস বলছে তোর মতো মুরগি পাইলে সে খামার খুলবে, কিন্তু ডিম পাড়ার আগেই তুই গান ধরিস, তাই কাস্টমাররা ভয়ে ডিম কিনতে আসে না 🎤🥚😭", true],
	["তুই যখন অনলাইনে আসিস তখন নেটওয়ার্ক বলে ‘ভাই, আজ আমি ছুটিতে, একটা মুরগি আসছে, এখন সব ল্যাগ হবে’ আর সবাই বুঝে ফেলে তুই এসেছিস 📶🐔", true],
	["শোন মুরগি, ইলেকশনে দাঁড়া। তোর মতো কক কক করা নেতা পাইলে জনগণ ভাববে নতুন ধরনের স্লোগান শুনতেছে। ভোটের দিনে দানা বিলি করলে তুই নির্বাত জিতবি 🗳️🌾", true],
	["তুই এমনভাবে পালাস যেন পুলিশ ধরতে আসছে, অথচ আসলে তোর হাতে শুধু একটা ডিম ছিল আর সেইটা তুই নিজেই পাড়ছিস 🚓🥚😂", true],
	["মুরগি ভাই, তোর খাঁচাটা এত ছোট যে তুই যখন কক বলিস তখন দেয়ালে ধাক্কা খাইয়া প্রতিধ্বনি হইয়া ফিরে আসে, তারপর তুই নিজেই বলিস ‘কে কক করে রে?’ 😵‍💫🔊", true],
	["আজকের মুরগি টাইমস: বিশেষ খবর! একটি মুরগি অনলাইনে এসে সবাইকে কক কক করে বিরক্ত করছে। প্রত্যক্ষদর্শীরা বলছেন, মুরগির নাম সম্ভবত তোর নামের সাথে মিলে যায় 📰🐔", true],
	["তোর লাইফ ফর্মুলা: সকালে কক, দুপুরে কক, রাতে কক আর মাঝখানে ডিম পাড়ার ভান। এই প্ল্যান নিয়া তুই কেমনে ইউনিভার্সিটিতে ভর্তি হইলি সেইটাই আমার মাথায় ঢুকে না 📚🥚", true],
	["বস মিঠুন বলছে, তোরে ক্ষমা করতে পারে, কিন্তু আগে তোরে ১০০ বার কক কক করে ‘আমি একটা সুন্দর মুরগি’ বলতে হবে, রেকর্ড করে পাঠাইতে হবে, নইলে ক্ষমা বাতিল 🎙️🙏😂", true],
	["তোর বুদ্ধি দেখে মনে হয় মুরগি নিজেও লজ্জা পাইছে। তাই সে একটা চিঠি লিখছে ‘প্রিয় মানুষ, দয়া করে আমাদের সাথে তুলনা করিস না, আমাদের সম্মান আছে’ ✉️🐔", true],
	["এই মুরগি, তুই কি জানিস তোর কক কক শুনে ফ্রিজে রাখা মাংসও ভয় পাইয়া বরফ হইয়া গেছে? ফ্রিজের ভেতর থেকে আওয়াজ আসতেছে ‘আমি তো আগেই মরছি, আবার কেন ভয় দেখাস!’ 🧊😱", true],
	["শেষ কথা বলি, তুই মুরগি হইলেও আমার চোখে তুই সেরা মুরগি। কারণ তুই একমাত্র যে প্রতিদিন নতুন নতুন কক কক আবিষ্কার করিস। এখন যা, দানা খাইয়া ঘুমা 🌙🤝", true],
	["~ আমি ক্লান্ত, এবার আমি ঘুমাতে গেলাম। তুই পারলে একা একাই কক কক করতে থাক 😴🤖", false]
];

function buildDefaultData() {
	return {
		interval: DEFAULT_INTERVAL,
		messages: DEFAULT_MESSAGES.map(([text, tag]) => ({ text, tag }))
	};
}

function loadData() {
	try {
		const d = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
		if (Array.isArray(d.messages) && d.messages.length)
			return { interval: Number(d.interval) || DEFAULT_INTERVAL, messages: d.messages };
	}
	catch (_) { }
	const d = buildDefaultData();
	saveData(d);
	return d;
}

function saveData(d) {
	fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2), "utf8");
}

if (!global.temp.murgiTimers)
	global.temp.murgiTimers = {};

module.exports = {
	config: {
		name: "murgi2",
		version: "2.0",
		author: "mithun",
		countDown: 10,
		role: 2,
		description: {
			vi: "Tag bạn bè liên tục nhiều lần",
			en: "মেনশন করা ব্যক্তিকে একের পর এক মজার কথা দিয়ে ট্যাগ করবে, কথা নিজে এড করা যাবে"
		},
		category: "nsfw",
		guide: {
			vi: "   {pn} @mention",
			en: "   {pn} @mention  → শুরু (থামাতে: rest)"
				+ "\n   {pn} add [কথা] | [কথা২] | [কথা৩]  → ট্যাগসহ কথা এড"
				+ "\n   {pn} addn [কথা] | [কথা২]  → ট্যাগ ছাড়া কথা এড"
				+ "\n   {pn} list [পেজ]  → সব কথা দেখো"
				+ "\n   {pn} remove [নম্বর] [নম্বর]...  → কথা মোছো"
				+ "\n   {pn} delay [সেকেন্ড]  → দুই কথার মাঝের গ্যাপ"
				+ "\n   {pn} reset  → ডিফল্ট কথায় ফেরত যাও"
		}
	},

	langs: {
		vi: {
			noMention: "মিঠুন বস মুরগী দিয়ো না মরে যাবে তো☹️🥺",
			start: "মিঠুন বস যদি তুমি থামাতে চাও তাহলে আমাকে থামাতে rest লিখুন",
			stopped: "✅ | থামানো হয়েছে।"
		},
		en: {
			noMention: "মিঠুন বস মুরগী দিয়ো না মরে যাবে তো☹️🥺",
			start: "মিঠুন বস যদি তুমি থামাতে চাও তাহলে আমাকে থামাতে rest লিখুন",
			stopped: "✅ | থামানো হয়েছে।"
		}
	},

	onStart: async function ({ api, event, args, message, getLang }) {
		const { threadID } = event;
		const sub = (args[0] || "").toLowerCase();

		// ---------- কথা এড (ট্যাগসহ / ট্যাগ ছাড়া) ----------
		if (sub === "add" || sub === "addn") {
			const parts = args.slice(1).join(" ").split("|").map(s => s.trim()).filter(Boolean);
			if (!parts.length)
				return message.reply(`❌ | কথা লিখো!\nউদাহরণ: murgi ${sub} তুই একটা মুরগি 🐔 | আরেকটা কথা`);
			const data = loadData();
			const tag = sub === "add";
			parts.forEach(text => data.messages.push({ text, tag }));
			saveData(data);
			return message.reply(`✅ | ${parts.length} টা কথা এড হয়েছে!\n📦 | মোট কথা: ${data.messages.length}`);
		}

		// ---------- লিস্ট ----------
		if (sub === "list") {
			const data = loadData();
			const perPage = 15;
			const pages = Math.ceil(data.messages.length / perPage);
			const page = Math.min(Math.max(parseInt(args[1]) || 1, 1), pages);
			const start = (page - 1) * perPage;
			const lines = data.messages.slice(start, start + perPage).map((m, i) => {
				const short = m.text.length > 45 ? m.text.slice(0, 45) + "…" : m.text;
				return `${start + i + 1}. ${m.tag ? "🏷️" : "💬"} ${short}`;
			});
			return message.reply(
				`📜 | কথার তালিকা (পেজ ${page}/${pages})\n⏱️ | গ্যাপ: ${data.interval} সেকেন্ড\n\n${lines.join("\n")}`
			);
		}

		// ---------- রিমুভ ----------
		if (sub === "remove" || sub === "rm" || sub === "del") {
			const nums = args.slice(1).map(n => parseInt(n)).filter(n => !isNaN(n));
			if (!nums.length)
				return message.reply("❌ | নম্বর দাও! উদাহরণ: murgi remove 3 5");
			const data = loadData();
			const valid = [...new Set(nums)].filter(n => n >= 1 && n <= data.messages.length).sort((a, b) => b - a);
			if (!valid.length)
				return message.reply("❌ | সঠিক নম্বর দাও।");
			if (valid.length >= data.messages.length)
				return message.reply("❌ | সব কথা মুছা যাবে না, অন্তত ১টা রাখতে হবে।");
			valid.forEach(n => data.messages.splice(n - 1, 1));
			saveData(data);
			return message.reply(`🗑️ | ${valid.length} টা কথা মুছা হয়েছে!\n📦 | বাকি: ${data.messages.length}`);
		}

		// ---------- গ্যাপ ----------
		if (sub === "delay") {
			const sec = parseFloat(args[1]);
			if (isNaN(sec) || sec < 1 || sec > 60)
				return message.reply("❌ | ১ থেকে ৬০ এর মধ্যে সেকেন্ড দাও। উদাহরণ: murgi delay 4");
			const data = loadData();
			data.interval = sec;
			saveData(data);
			return message.reply(`⏱️ | এখন থেকে প্রতি ${sec} সেকেন্ড পর পর কথা যাবে।`);
		}

		// ---------- রিসেট ----------
		if (sub === "reset") {
			saveData(buildDefaultData());
			return message.reply("♻️ | সব কথা ডিফল্টে ফিরে গেছে!");
		}

		// ---------- মুরগি শুরু ----------
		const mention = Object.keys(event.mentions)[0];
		if (!mention)
			return message.reply(getLang("noMention"));

		// আগের কোনো রান চলতে থাকলে বন্ধ করে নতুন শুরু
		(global.temp.murgiTimers[threadID] || []).forEach(clearTimeout);
		global.temp.murgiTimers[threadID] = [];

		const data = loadData();
		const name = event.mentions[mention];
		const arraytag = [{ id: mention, tag: name }];

		api.sendMessage(getLang("start"), threadID);

		data.messages.forEach((m, i) => {
			const delay = (i + 1) * data.interval * 1000;
			const timer = setTimeout(() => {
				if (m.tag)
					api.sendMessage({ body: m.text + " " + name, mentions: arraytag }, threadID);
				else
					api.sendMessage(m.text, threadID);
			}, delay);
			global.temp.murgiTimers[threadID].push(timer);
		});
	},

	// "rest" লিখলে থামবে (শুধু বটের অ্যাডমিন)
	onChat: async function ({ event, message, getLang, role }) {
		const body = (event.body || "").trim().toLowerCase();
		if (body !== "rest" || role < 2)
			return;

		const timers = global.temp.murgiTimers[event.threadID];
		if (!timers || timers.length == 0)
			return;

		timers.forEach(clearTimeout);
		delete global.temp.murgiTimers[event.threadID];
		message.reply(getLang("stopped"));
	}
};
