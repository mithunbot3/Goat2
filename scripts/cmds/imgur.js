const axios = require("axios");

module.exports = {
	config: {
		name: "imgur",
		version: "1.1",
		author: "Rahat.mithun",
		countDown: 0,
		role: 0,
		description: {
			vi: "Tải ảnh/video/GIF lên Imgur và lấy link trực tiếp",
			en: "Upload image/video/GIF to Imgur and get direct links"
		},
		category: "other",
		guide: {
			vi: "   Reply ảnh/video rồi gọi {pn}",
			en: "   Reply to an image/video/GIF and use {pn}"
		}
	},

	langs: {
		vi: {
			noReply: "Vui lòng reply ảnh hoặc video với lệnh imgur...!✅",
			noLink: "❌ Không nhận được link",
			failed: "❌ Tải lên thất bại",
			multiple: "✅ Link Imgur của các tệp đã tải lên:\n\n%1"
		},
		en: {
			noReply: "Please reply to the image or video with the command imgur...!✅",
			noLink: "❌ No link received",
			failed: "❌ Failed to upload",
			multiple: "✅ Uploaded files Imgur links:\n\n%1"
		}
	},

	onStart: async function ({ api, event, message, getLang }) {
		const reply = event.messageReply;
		if (!reply || !reply.attachments || reply.attachments.length === 0)
			return message.reply(getLang("noReply"));

		let base;
		try {
			const apis = await axios.get("https://raw.githubusercontent.com/shaonproject/Shaon/main/api.json");
			base = apis.data.imgur;
		}
		catch (e) {
			return message.reply(getLang("failed"));
		}

		const links = [];
		for (const attachment of reply.attachments) {
			try {
				const url = encodeURIComponent(attachment.url);
				const upload = await axios.get(`${base}/imgur?link=${url}`);
				links.push(upload.data?.uploaded?.image || getLang("noLink"));
			}
			catch (e) {
				links.push(getLang("failed"));
			}
		}

		const text = links.length === 1
			? links[0]
			: getLang("multiple", links.join("\n"));

		return message.reply(text);
	}
};
