const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

const CREDIT = "Siam Bot help create by Mithun";

function getAvatarUrl(uid) {
	return "https://graph.facebook.com/" + uid + "/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";
}

async function downloadBuffer(url) {
	const res = await axios.get(url, {
		responseType: "arraybuffer",
		timeout: 15000,
		headers: { "User-Agent": "Mozilla/5.0" }
	});
	return Buffer.from(res.data, "binary");
}

function fitText(ctx, text, maxWidth) {
	let t = text;
	if (ctx.measureText(t).width <= maxWidth)
		return t;
	while (t.length > 1 && ctx.measureText(t + "...").width > maxWidth)
		t = t.slice(0, -1);
	return t + "...";
}

async function makeWelcomeCard(uid, name, memberNo, groupName) {
	const W = 900;
	const H = 500;
	const canvas = createCanvas(W, H);
	const ctx = canvas.getContext("2d");

	// background
	const bg = ctx.createLinearGradient(0, 0, W, H);
	bg.addColorStop(0, "#0f0c29");
	bg.addColorStop(0.5, "#302b63");
	bg.addColorStop(1, "#24243e");
	ctx.fillStyle = bg;
	ctx.fillRect(0, 0, W, H);

	// decorative circles
	ctx.save();
	ctx.globalAlpha = 0.08;
	ctx.fillStyle = "#38b6ff";
	ctx.beginPath(); ctx.arc(80, 90, 120, 0, Math.PI * 2); ctx.fill();
	ctx.beginPath(); ctx.arc(830, 420, 150, 0, Math.PI * 2); ctx.fill();
	ctx.restore();

	// border
	ctx.strokeStyle = "rgba(255,255,255,0.25)";
	ctx.lineWidth = 3;
	ctx.strokeRect(15, 15, W - 30, H - 30);

	// avatar
	const AV_CX = W / 2;
	const AV_CY = 175;
	const AV_R = 95;

	let avatar = null;
	try {
		avatar = await loadImage(await downloadBuffer(getAvatarUrl(uid)));
	}
	catch (_) { }

	// glow ring
	ctx.save();
	ctx.shadowColor = "#38b6ff";
	ctx.shadowBlur = 35;
	ctx.beginPath();
	ctx.arc(AV_CX, AV_CY, AV_R + 4, 0, Math.PI * 2);
	ctx.strokeStyle = "rgba(56,182,255,0.9)";
	ctx.lineWidth = 6;
	ctx.stroke();
	ctx.restore();

	// clipped avatar
	ctx.save();
	ctx.beginPath();
	ctx.arc(AV_CX, AV_CY, AV_R, 0, Math.PI * 2);
	ctx.closePath();
	ctx.clip();
	if (avatar) {
		ctx.drawImage(avatar, AV_CX - AV_R, AV_CY - AV_R, AV_R * 2, AV_R * 2);
	}
	else {
		ctx.fillStyle = "#444";
		ctx.fillRect(AV_CX - AV_R, AV_CY - AV_R, AV_R * 2, AV_R * 2);
	}
	ctx.restore();

	// white ring
	ctx.beginPath();
	ctx.arc(AV_CX, AV_CY, AV_R, 0, Math.PI * 2);
	ctx.lineWidth = 3;
	ctx.strokeStyle = "#ffffff";
	ctx.stroke();

	ctx.textAlign = "center";

	// WELCOME
	ctx.fillStyle = "#ffffff";
	ctx.font = "bold 64px sans-serif";
	ctx.fillText("WELCOME", W / 2, 345);

	// name
	ctx.fillStyle = "#38b6ff";
	ctx.font = "bold 40px sans-serif";
	ctx.fillText(fitText(ctx, name, W - 120), W / 2, 400);

	// group + member number
	ctx.fillStyle = "rgba(255,255,255,0.85)";
	ctx.font = "26px sans-serif";
	ctx.fillText(fitText(ctx, groupName, 560) + "  |  Member #" + memberNo, W / 2, 440);

	// credit
	ctx.fillStyle = "rgba(255,255,255,0.55)";
	ctx.font = "18px sans-serif";
	ctx.fillText(CREDIT, W / 2, 475);

	return canvas.toBuffer("image/png");
}

module.exports = {
	config: {
		name: "memberswlc",
		version: "2.1",
		author: "MiThun",
		category: "events"
	},

	onStart: async ({ threadsData, message, event, api }) => {
		if (event.logMessageType == "log:subscribe")
			return async function () {
				const { threadID } = event;
				const { nickNameBot } = global.GoatBot.config;
				const dataAddedParticipants = event.logMessageData.addedParticipants;

				// বট নিজে অ্যাড হলে
				if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
					if (nickNameBot)
						api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
					return;
				}

				// একসাথে যারা জয়েন করে তাদের জমা করা
				if (!global.temp.welcomeEvent[threadID])
					global.temp.welcomeEvent[threadID] = {
						joinTimeout: null,
						dataAddedParticipants: []
					};

				global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
				clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

				global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
					const threadData = await threadsData.get(threadID);
					const added = global.temp.welcomeEvent[threadID].dataAddedParticipants;
					delete global.temp.welcomeEvent[threadID];

					if (threadData.settings.sendWelcomeMessage == false)
						return;

					const dataBanned = threadData.data.banned_ban || [];
					const list = added
						.filter(user => !dataBanned.some(item => item.id == user.userFbId))
						.slice(0, 3); // স্প্যাম এড়াতে সর্বোচ্চ ৩টা কার্ড

					if (list.length == 0)
						return;

					let participantCount = 0;
					let groupName = threadData.threadName || "this group";
					try {
						const threadInfo = await api.getThreadInfo(threadID);
						participantCount = threadInfo.participantIDs.length;
						groupName = threadInfo.threadName || groupName;
					}
					catch (_) { }

					const tmpDir = path.join(__dirname, "tmp");
					fs.ensureDirSync(tmpDir);

					for (let i = 0; i < list.length; i++) {
						const user = list[i];
						const memberNo = participantCount ? participantCount - (list.length - 1 - i) : "?";
						const tmpPath = path.join(tmpDir, `welcome_${Date.now()}_${i}.png`);

						try {
							const buf = await makeWelcomeCard(user.userFbId, user.fullName, memberNo, groupName);
							fs.writeFileSync(tmpPath, buf);
							await message.send({ attachment: fs.createReadStream(tmpPath) });
						}
						catch (err) {
							console.error("Welcome card error:", err.message);
						}
						finally {
							try { fs.unlinkSync(tmpPath); } catch (_) { }
						}
					}
				}, 1500);
			};
	}
};
