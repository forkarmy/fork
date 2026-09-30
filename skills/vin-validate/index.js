// Ported from wegolook/vin-validator (ISC) by wegolook.
// https://github.com/wegolook/vin-validator — index.js validate()

const TRANSLITERATION = {
  "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8,
  j: 1, k: 2, l: 3, m: 4, n: 5, p: 7, r: 9,
  s: 2, t: 3, u: 4, v: 5, w: 6, x: 7, y: 8, z: 9
};

const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

const FORMAT = /^[a-hj-npr-z0-9]{8}[0-9x][a-hj-npr-z0-9]{8}$/;

function fail(error, message) {
  return { valid: false, error, message };
}

function expectedCheckChar(vin) {
  let sum = 0;
  for (let i = 0; i < vin.length; i++) {
    sum += TRANSLITERATION[vin.charAt(i)] * WEIGHTS[i];
  }
  const mod = sum % 11;
  return mod === 10 ? "X" : String(mod);
}

export default async function run(input) {
  if (!input || typeof input.vin !== "string") {
    return fail("invalid_type", "vin must be a string");
  }

  const normalized = input.vin.trim().replace(/[\s-]+/g, "").toUpperCase();
  if (normalized.length === 0) {
    return fail("invalid_format", "VIN is empty");
  }

  const lower = normalized.toLowerCase();
  if (!FORMAT.test(lower)) {
    return fail(
      "invalid_format",
      "VIN must be 17 characters and must not contain I, O, or Q"
    );
  }

  const expected = expectedCheckChar(lower);
  const checkDigit = normalized.charAt(8);
  const checksumOk = checkDigit === expected;

  const result = {
    valid: checksumOk,
    vin: normalized,
    wmi: normalized.slice(0, 3),
    vds: normalized.slice(3, 9),
    checkDigit,
    expectedCheckDigit: expected,
    vis: normalized.slice(9),
    modelYearCode: normalized.charAt(9),
    plantCode: normalized.charAt(10),
    serial: normalized.slice(11)
  };

  if (!checksumOk) {
    result.error = "bad_check_digit";
    result.message = "Check digit does not match the ISO 3779 mod-11 checksum";
  }

  return result;
}
