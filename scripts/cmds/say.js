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

const MAX_CHARS = 1000;  // সর্বোচ্চ কত অক্ষর বলবে
const CHUNK = 190;       // Google TTS এক রিকোয়েস্টে ~200 অক্ষর নেয়

// লেখার স্ক্রিপ্ট দেখে ভাষা আন্দাজ (ভাষা না দিলে)
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

// বড় লেখা শব্দের সীমানায় ভাগ করা
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

module.exports.config = {
  name: "say",
  version: "2.0",
  hasPermssion: 0,
  credits: "Mithun",
  description: "Text to speech (auto language detect, long text support)",
  commandCategory: "fun",
  usages: "say [lang] <text>\nsay bn আমি তোমাকে ভালোবাসি\nsay ja こんにちは\nreply করে: say  /  say bn\nভাষার লিস্ট: say list",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, senderID, messageID, type, messageReply } = event;
  const filePath = resolve(__dirname, "cache", `say_${threadID}_${senderID}_${Date.now()}.mp3`);
  const cleanup = () => { try { unlinkSync(filePath); } catch (e) {} };

  try {
    // ---------- ভাষার লিস্ট ----------
    if (args[0]?.toLowerCase() === "list") {
      const list = Object.entries(LANGS)
        .filter(([k]) => k !== "in")
        .map(([k, v]) => `• ${k} → ${v}`)
        .join("\n");
      return api.sendMessage(
        `🗣️ SAY LANGUAGES\n━━━━━━━━━━━\n${list}\n━━━━━━━━━━━\nউদাহরণ: say bn আমি ভালো আছি\nভাষা না দিলে নিজে থেকেই ধরে নেবে।`,
        threadID, messageID
      );
    }

    // ---------- ভাষা ও টেক্সট আলাদা করা ----------
    const isReply = type === "message_reply" && messageReply?.body;
    let lang = null;
    let text;

    const first = args[0];
    const firstIsLang = first && Object.prototype.hasOwnProperty.call(LANGS, first.toLowerCase() === "zh-cn" ? "zh-CN" : first.toLowerCase());

    if (isReply) {
      // রিপ্লাই করলে: say / say bn
      if (firstIsLang) lang = first.toLowerCase() === "zh-cn" ? "zh-CN" : first.toLowerCase();
      text = messageReply.body;
    } else if (firstIsLang && args.length > 1) {
      // শব্দ না কেটে শুধু পুরো আলাদা ভাষা-কোড থাকলেই ভাষা ধরবে
      lang = first.toLowerCase() === "zh-cn" ? "zh-CN" : first.toLowerCase();
      text = args.slice(1).join(" ");
    } else {
      text = args.join(" ");
    }

    text = (text || "").replace(/\s+/g, " ").trim();

    if (!text) {
      return api.sendMessage(
        "❌ কিছু লিখে দাও বলার জন্য।\nউদাহরণ: say bn আমি ভালো আছি\nভাষার লিস্ট: say list",
        threadID, messageID
      );
    }

    if (!lang) lang = detectLang(text);
    if (lang === "in") lang = "id";

    let note = "";
    if (text.length > MAX_CHARS) {
      text = text.slice(0, MAX_CHARS);
      note = `⚠️ লেখা বড় হওয়ায় প্রথম ${MAX_CHARS} অক্ষর বলা হলো।`;
    }

    // ---------- অডিও তৈরি ----------
    api.setMessageReaction("⏳", messageID, () => {}, true);

    const chunks = splitText(text);
    const buffers = [];
    for (const c of chunks) buffers.push(await fetchTTS(c, lang));

    ensureDirSync(resolve(__dirname, "cache"));
    writeFileSync(filePath, Buffer.concat(buffers));

    return api.sendMessage(
      { body: note || undefined, attachment: createReadStream(filePath) },
      threadID,
      (err) => {
        if (err) console.error("say.js send error:", err);
        api.setMessageReaction(err ? "❌" : "✅", messageID, () => {}, true);
        cleanup();
      },
      messageID
    );
  } catch (error) {
    console.error("Error occurred during TTS:", error.message);
    cleanup();
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("⚠️ TTS বানাতে সমস্যা হয়েছে, আবার চেষ্টা করো।", threadID, messageID);
  }
};
