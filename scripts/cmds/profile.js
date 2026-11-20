module.exports = {
	config: {
		name: "pp",
		aliases: ["pfp"],
		version: "2.4",
		author: "SaGor",
		countDown: 5,
		role: 0,
		description: {
			vi: "Lấy ảnh đại diện",
			en: "Get profile picture"
		},
		category: "utility",
		guide: {
			vi: "   {pn} [@tag | reply | uid]",
			en: "   {pn} [@mention | reply | uid]"
		}
	},

	langs: {
		vi: {
			caption: "📷 Ảnh đại diện\n👤 UID: %1",
			failed: "❌ Không lấy được ảnh đại diện"
		},
		en: {
			caption: "📷 Profile Picture\n👤 UID: %1",
			failed: "❌ Failed to get profile picture"
		}
	},

	onStart: async function ({ event, args, message, usersData, getLang }) {
		let targetID;

		if (event.mentions && Object.keys(event.mentions).length > 0)
			targetID = Object.keys(event.mentions)[0];
		else if (event.messageReply)
			targetID = event.messageReply.senderID;
		else if (args[0] && /^\d+$/.test(args[0]))
			targetID = args[0];
		else
			targetID = event.senderID;

		const urls = [];
		try {
			urls.push(await usersData.getAvatarUrl(targetID));
		}
		catch (_) { }
		urls.push(`https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`);

		for (const url of urls.filter(Boolean)) {
			try {
				const stream = await global.utils.getStreamFromURL(url, "avatar.png");
				return message.reply({
					body: getLang("caption", targetID),
					attachment: stream
				});
			}
			catch (_) { }
		}

		return message.reply(getLang("failed"));
	}
};
