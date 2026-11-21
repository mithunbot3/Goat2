const { createReadStream, writeFileSync, unlinkSync, ensureDirSync } = require("fs-extra");
const { resolve } = require("path");
const axios = require("axios");

const LANGS = {
  en: "English", bn: "বাংলা", hi: "Hindi", ar: "Arabic", ur: "Urdu",
  ja: "Japanese", ko: "Korean", ru: "Russian", vi: "Vietnamese",
  tl: "Filipino", id: "Indonesian", in: "Indonesian", ne: "Nepali",
  es: "Spanish", fr: "French", de: "German", it: "Italian",
  pt: "Portuguese", tr: "Turkish", th: "Thai", "zh-CN": "Chinese"
};

const MAX_CHARS = 1000;
const CHUNK = 190;

function detectLang(text) {
  if (/[\u0980-\u09FF]/.test(text)) return "bn";
  if (/[\u3040-\u30FF]/.test(text)) return "ja";
  if (/[\uAC00-\uD7AF]/.test(text)) return "ko";
  if (/[\u0400-\u04FF]/.test(text)) return "ru";
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  if (/[\u0600-\u06FF]/.test(text)) return "ar";
  if (/[\u0E00-\u0E7F]/.test(text)) return "th";
  if (/[\u4E00-\u9FFF]/.test(text)) return "zh-CN";
  return "en";
}

function splitText(text) {
  const parts = [];
  let cur = "";
  for (const word of text.split(/\s+/)) {
    if (word.length > CHUNK) {
      if (cur) { parts.push(cur); cur = ""; }
      for (let i = 0; i < word.length; i += CHUNK) parts.push(word.slice(i, i + CHUNK));
      continue;
    }
    if ((cur + " " + word).trim().length > CHUNK) {
      parts.push(cur);
      cur = word;
    } else {
      cur = (cur + " " + word).trim();
    }
  }
  if (cur) parts.push(cur);
  return parts;
}

async function fetchTTS(text, lang) {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
  const res = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 15000,
    headers: { "User-Agent": "Mozilla/5.0" }
  });
  return Buffer.from(res.data);
}

module.exports = {
  config: {
    name: "say",
    version: "3.0",
    author: "Mithun",
    countDown: 5,
    role: 0,
    description: { en: "Text to speech (auto language detect, long text support)" },
    category: "fun",
    guide: {
      en: "{pn} [lang] <text>\n{pn} bn আমি ভালো আছি\n{pn} ja こんにちは\nরিপ্লাই করে: {pn} / {pn} bn\nভাষার লিস্ট: {pn} list"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const { threadID, senderID, messageID, type, messageReply } = event;
    const filePath = resolve(__dirname, "cache", `say_${threadID}_${senderID}_${Date.now()}.mp3`);
    const cleanup = () => { try { unlinkSync(filePath); } catch (e) {} };

    try {
      if (args[0]?.toLowerCase() === "list") {
        const list = Object.entries(LANGS)
          .filter(([k]) => k !== "in")
          .map(([k, v]) => `• ${k} → ${v}`)
          .join("\n");
        return message.reply(
          `🗣️ SAY LANGUAGES\n━━━━━━━━━━━\n${list}\n━━━━━━━━━━━\nউদাহরণ: say bn আমি ভালো আছি\nভাষা না দিলে নিজে থেকেই ধরে নেবে।`
        );
      }

      const normalize = (s) => (s.toLowerCase() === "zh-cn" ? "zh-CN" : s.toLowerCase());
      const isReply = type === "message_reply" && messageReply?.body;
      const first = args[0];
      const firstIsLang = first && Object.prototype.hasOwnProperty.call(LANGS, normalize(first));

      let lang = null;
      let text;

      if (isReply) {
        if (firstIsLang) lang = normalize(first);
        text = messageReply.body;
      } else if (firstIsLang && args.length > 1) {
        lang = normalize(first);
        text = args.slice(1).join(" ");
      } else {
        text = args.join(" ");
      }

      text = (text || "").replace(/\s+/g, " ").trim();

      if (!text) {
        return message.reply("❌ কিছু লিখে দাও বলার জন্য।\nউদাহরণ: say bn আমি ভালো আছি\nভাষার লিস্ট: say list");
      }

      if (!lang) lang = detectLang(text);
      if (lang === "in") lang = "id";

      let note = "";
      if (text.length > MAX_CHARS) {
        text = text.slice(0, MAX_CHARS);
        note = `⚠️ লেখা বড় হওয়ায় প্রথম ${MAX_CHARS} অক্ষর বলা হলো।`;
      }

      api.setMessageReaction("⏳", messageID, () => {}, true);

      const buffers = [];
      for (const c of splitText(text)) buffers.push(await fetchTTS(c, lang));

      ensureDirSync(resolve(__dirname, "cache"));
      writeFileSync(filePath, Buffer.concat(buffers));

      return message.reply(
        { body: note || undefined, attachment: createReadStream(filePath) },
        (err) => {
          if (err) console.error("say.js send error:", err);
          api.setMessageReaction(err ? "❌" : "✅", messageID, () => {}, true);
          cleanup();
        }
      );
    } catch (error) {
      console.error("Error occurred during TTS:", error.message);
      cleanup();
      api.setMessageReaction("❌", messageID, () => {}, true);
      return message.reply("⚠️ TTS বানাতে সমস্যা হয়েছে, আবার চেষ্টা করো।");
    }
  }
};
