// American Soundex, ported from jamesturk/jellyfish (MIT) src/soundex.rs.
// Author: James Turk and contributors.

const MAX_CHARS = 4096;

function replacement(ch) {
  switch (ch) {
    case "B":
    case "F":
    case "P":
    case "V":
      return "1";
    case "C":
    case "G":
    case "J":
    case "K":
    case "Q":
    case "S":
    case "X":
    case "Z":
      return "2";
    case "D":
    case "T":
      return "3";
    case "L":
      return "4";
    case "M":
    case "N":
      return "5";
    case "R":
      return "6";
    default:
      return "*";
  }
}

function soundex(s) {
  if (s.length === 0) {
    return "";
  }
  const v = Array.from(s.toUpperCase().normalize("NFKD"));
  const result = [v[0]];
  let last = replacement(v[0]);
  for (let i = 1; i < v.length; i++) {
    const letter = v[i];
    const sub = replacement(letter);
    if (sub !== "*") {
      if (sub !== last) {
        result.push(sub);
        if (result.length === 4) {
          break;
        }
      }
      last = sub;
    } else if (letter !== "H" && letter !== "W") {
      last = "*";
    }
  }
  while (result.length < 4) {
    result.push("0");
  }
  return result.join("");
}

export default async function run(input) {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    return { valid: false, error: "invalid-input", message: "input must be an object" };
  }
  if (typeof input.text !== "string") {
    return { valid: false, error: "invalid-input", message: "text must be a string" };
  }
  if (input.text.length > MAX_CHARS) {
    return {
      valid: false,
      error: "too-long",
      message: "text exceeds 4096 characters",
    };
  }
  const code = soundex(input.text);
  return { valid: true, soundex: code, length: code.length };
}
