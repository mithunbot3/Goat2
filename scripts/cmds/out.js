module.exports = {
	config: {
		name: "out",
		version: "1.1",
		author: "Mithun",
		countDown: 5,
		role: 2,
		description: {
			vi: "Bot rời khỏi nhóm",
			en: "Bot leave group"
		},
		category: "owner",
		guide: {
			vi: "   {pn}: Bot rời khỏi nhóm",
			en: "   {pn}: Bot leave group"
		}
	},

	langs: {
		vi: {
			byeMessage: "আমাকে তৈরি করা হয়েছে মজা করার জন্য আর কারো মনে যদি কষ্ট দিয়ে থাকি তাহলে হ্মমা করে দিয়েন নিজের ভাইয়ের মতো মিঠুন বস কাউকে কষ্ট দেওয়ার জন্য আমাকে বানায় নি সবাই ভালো থাকবেন সুস্থ থাকবেন বাই বাই🙂👋"
		},
		en: {
			byeMessage: "আমাকে তৈরি করা হয়েছে মজা করার জন্য আর কারো মনে যদি কষ্ট দিয়ে থাকি তাহলে হ্মমা করে দিয়েন নিজের ভাইয়ের মতো মিঠুন বস কাউকে কষ্ট দেওয়ার জন্য আমাকে বানায় নি সবাই ভালো থাকবেন সুস্থ থাকবেন বাই বাই🙂👋"
		}
	},

	onStart: async function ({ api, event, message, getLang }) {
		const { threadID } = event;

		await message.reply(getLang("byeMessage"));
		api.removeUserFromGroup(api.getCurrentUserID(), threadID);
	}
};
