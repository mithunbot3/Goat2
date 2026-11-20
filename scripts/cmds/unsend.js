// সব রাগের ইমোজি
const ANGRY_EMOJIS = ["😡", "😠", "🤬", "😾", "👿", "💢", "😤"];

// ইমোজির ভেরিয়েশন সিলেক্টর (\uFE0F) বাদ দিয়ে মেলায়, যাতে সব ডিভাইসে কাজ করে
const clean = (str) => (str || "").replace(/\uFE0F/g, "").trim();
const isAngry = (str) => ANGRY_EMOJIS.map(clean).includes(clean(str));

module.exports = {
	config: {
		name: "unsend",
		aliases: ["un"],
		version: "1.6",
		author: "Mithun",
		countDown: 5,
		role: 0,
		description: {
			vi: "Gỡ tin nhắn của bot",
			en: "Unsend bot's message"
		},
		category: "box chat",
		guide: {
			vi: "reply tin nhắn muốn gỡ của bot và gọi lệnh {pn}",
			en: "reply the bot's message with: {pn}, un, unsend, or any angry emoji (😡 😠 🤬 😾 👿 💢 😤), or react to the bot's message with an angry emoji"
		}
	},

	langs: {
		vi: {
			syntaxError: "Vui lòng reply tin nhắn muốn gỡ của bot"
		},
		en: {
			syntaxError: "Please reply the message you want to unsend"
		}
	},

	// /unsend বা /un (বটের মেসেজে রিপ্লাই করে)
	onStart: async function ({ message, event, api, getLang }) {
		if (!event.messageReply || event.messageReply.senderID != api.getCurrentUserID())
			return message.reply(getLang("syntaxError"));
		message.unsend(event.messageReply.messageID);
	},

	// প্রিফিক্স ছাড়া রিপ্লাই: un, unsend অথবা যেকোনো রাগের ইমোজি
	onChat: async function ({ message, event, api }) {
		const body = clean(event.body).toLowerCase();

		if (!(body === "un" || body === "unsend" || isAngry(body)))
			return;
		if (!event.messageReply || event.messageReply.senderID != api.getCurrentUserID())
			return;

		message.unsend(event.messageReply.messageID);
	},

	// বটের মেসেজে রাগের ইমোজি রিয়্যাক্ট
	onAnyEvent: async function ({ api, event, message }) {
		if (event.type !== "message_reaction")
			return;
		if (!isAngry(event.reaction))
			return;

		// যার মেসেজে রিয়্যাক্ট হয়েছে সে বট হতে হবে
		if (event.senderID != api.getCurrentUserID())
			return;

		// বট নিজে রিয়্যাক্ট করলে কিছু করবে না
		if (event.userID == api.getCurrentUserID())
			return;

		message.unsend(event.messageID);
	}
};
