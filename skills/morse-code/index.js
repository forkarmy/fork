// Ported from eikmarizal/Morse-Code-Translator-V1 (MIT), javascript/morse.js,
// originally by Luke Martin (https://github.com/lukedmartin/morse). Punctuation per ITU-R M.1677-1.
const ALPHA = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..",
  J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
  S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
  "1": ".----", "2": "..---", "3": "...--", "4": "....-", "5": ".....",
  "6": "-....", "7": "--...", "8": "---..", "9": "----.", "0": "-----",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--", "/": "-..-.",
  "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...", ";": "-.-.-.", "=": "-...-",
  "+": ".-.-.", "-": "-....-", "_": "..--.-", "\"": ".-..-.", "$": "...-..-", "@": ".--.-."
};
const MORSE = {};
for (const k in ALPHA) MORSE[ALPHA[k]] = k;

function fail(error, message) { return { valid: false, error, message }; }

export default async function run(input) {
  const { text, morse } = input || {};
  if (typeof text === "string" && morse === undefined) {
    if (text.length > 100000) return fail("TOO_LONG", "Input exceeds 100000 characters");
    const words = text.toUpperCase().trim().split(/\s+/).filter(Boolean);
    const out = [];
    for (const w of words) {
      const codes = [];
      for (const ch of w) {
        if (!ALPHA[ch]) return fail("UNSUPPORTED_CHARACTER", `Cannot encode character '${ch}'`);
        codes.push(ALPHA[ch]);
      }
      out.push(codes.join(" "));
    }
    return { valid: true, operation: "encode", text: words.join(" "), morse: out.join(" / ") };
  }
  if (typeof morse === "string" && text === undefined) {
    if (morse.length > 100000) return fail("TOO_LONG", "Input exceeds 100000 characters");
    const norm = morse.replace(/[•·]/g, ".").replace(/[–—_]/g, "-").trim();
    const words = norm.split(/\s*[\/|]\s*|\s{3,}/).filter(Boolean);
    const out = [];
    for (const w of words) {
      let s = "";
      for (const code of w.trim().split(/\s+/)) {
        if (!MORSE[code]) return fail("UNKNOWN_SEQUENCE", `Unknown Morse sequence '${code}'`);
        s += MORSE[code];
      }
      out.push(s);
    }
    const encoded = words.map(w => w.trim().split(/\s+/).join(" ")).join(" / ");
    return { valid: true, operation: "decode", text: out.join(" "), morse: encoded };
  }
  return fail("INVALID_INPUT", "Provide exactly one of text or morse as a string");
}
