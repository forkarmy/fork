// Ported from limeburst/isbn-rs (MIT), src/lib.rs
// ISBN-10 / ISBN-13 checksum and conversion. Hyphenation ranges are not included.

function checkDigitChar10(d) {
  return d === 10 ? "X" : String(d);
}

function calculateCheckDigit10(digits) {
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }
  const sumM = sum % 11;
  return sumM === 0 ? 0 : 11 - sumM;
}

function calculateCheckDigit13(digits) {
  let sum = 0;
  for (let i = 0; i < 6; i++) {
    sum += digits[i * 2] + 3 * digits[i * 2 + 1];
  }
  const sumM = sum % 10;
  return sumM === 0 ? 0 : 10 - sumM;
}

function parseDigits(s) {
  const digits = [];
  let hasX = false;
  for (const c of s) {
    if (c === "-" || c === " ") continue;
    if (c === "X" || c === "x") {
      if (digits.length === 9) {
        hasX = true;
        digits.push(10);
      } else {
        return { error: "invalid_digit", message: "Encountered an invalid digit while parsing." };
      }
    } else if (c >= "0" && c <= "9") {
      if (hasX) {
        return { error: "invalid_digit", message: "Encountered an invalid digit while parsing." };
      }
      digits.push(c.charCodeAt(0) - 48);
      if (digits.length > 13) {
        return {
          error: "invalid_length",
          message: "The given string is too short or too long to be an ISBN.",
        };
      }
    } else {
      return { error: "invalid_digit", message: "Encountered an invalid digit while parsing." };
    }
  }
  return { digits };
}

function isbn10String(digits) {
  let s = "";
  for (let i = 0; i < 9; i++) s += String(digits[i]);
  s += checkDigitChar10(digits[9]);
  return s;
}

function isbn13String(digits) {
  let s = "";
  for (let i = 0; i < 13; i++) s += String(digits[i]);
  return s;
}

function fromIsbn10(digits) {
  const isbn13 = [9, 7, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < 9; i++) isbn13[3 + i] = digits[i];
  isbn13[12] = calculateCheckDigit13(isbn13);
  return {
    valid: true,
    format: "isbn10",
    isbn10: isbn10String(digits),
    isbn13: isbn13String(isbn13),
    check_digit: checkDigitChar10(digits[9]),
  };
}

function fromIsbn13(digits) {
  const prefix = digits[0] * 100 + digits[1] * 10 + digits[2];
  if (prefix !== 978 && prefix !== 979) {
    return {
      valid: false,
      error: "invalid_group",
      message: "ISBN-13 must start with GS1 prefix 978 or 979.",
    };
  }
  let isbn10 = null;
  if (prefix === 978) {
    const d10 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < 9; i++) d10[i] = digits[3 + i];
    d10[9] = calculateCheckDigit10(d10);
    isbn10 = isbn10String(d10);
  }
  return {
    valid: true,
    format: "isbn13",
    isbn10,
    isbn13: isbn13String(digits),
    check_digit: String(digits[12]),
  };
}

export default async function run(input) {
  if (!input || typeof input.isbn !== "string") {
    return {
      valid: false,
      error: "invalid_digit",
      message: "Encountered an invalid digit while parsing.",
    };
  }
  const parsed = parseDigits(input.isbn);
  if (parsed.error) return { valid: false, error: parsed.error, message: parsed.message };
  const digits = parsed.digits;
  if (digits.length === 10) {
    const check = calculateCheckDigit10(digits);
    if (check !== digits[9]) {
      return { valid: false, error: "invalid_checksum", message: "Failed to validate checksum." };
    }
    return fromIsbn10(digits);
  }
  if (digits.length === 13) {
    if (digits[12] > 9) {
      return { valid: false, error: "invalid_digit", message: "Encountered an invalid digit while parsing." };
    }
    const check = calculateCheckDigit13(digits);
    if (check !== digits[12]) {
      return { valid: false, error: "invalid_checksum", message: "Failed to validate checksum." };
    }
    return fromIsbn13(digits);
  }
  return {
    valid: false,
    error: "invalid_length",
    message: "The given string is too short or too long to be an ISBN.",
  };
}
