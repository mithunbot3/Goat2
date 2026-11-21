const request = require("request");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "owner",
  version: "2.1.0",
  hasPermssion: 0,
  credits: "mithun",
  description: "Show owner photo",
  commandCategory: "Information",
  usages: "owner",
  cooldowns: 2
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  const img = "https://i.imgur.com/p64G39M.jpeg";

  const cacheDir = path.join(__dirname, "cache");
  const filePath = path.join(cacheDir, `owner_${Date.now()}.jpg`);
  fs.ensureDirSync(cacheDir);

  const cleanup = () => { try { fs.unlinkSync(filePath); } catch (e) {} };

  request(encodeURI(img))
    .on("error", cleanup)
    .pipe(fs.createWriteStream(filePath))
    .on("close", () => {
      api.sendMessage(
        { attachment: fs.createReadStream(filePath) },
        threadID,
        cleanup,
        messageID
      );
    });
};
