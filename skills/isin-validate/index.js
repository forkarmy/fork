// Ported from floydspace/isin-validator (MIT) by Michael Wittig.
// Check-digit and pseudo-country logic from src/index.ts.

const PSEUDO = new Set(["XS", "XA", "XB", "XC", "XD", "XF", "QS", "QT", "QW", "EU", "XK"]);

const ISO_ALPHA2 = new Set(
  "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW".split(" ")
);

function calcCrossSum(i) {
  let qs = 0;
  do {
    qs += i % 10;
    i = Math.floor(i / 10);
  } while (i > 0);
  return qs;
}

function expandDigits(s) {
  const nums = [];
  for (let i = 0; i < s.length; i += 1) {
    const c = s.charCodeAt(i);
    if (c >= 48 && c <= 57) {
      nums.push(c - 48);
    } else if (c >= 65 && c <= 90) {
      const v = c - 55;
      nums.push(Math.floor(v / 10));
      nums.push(v % 10);
    } else {
      return null;
    }
  }
  return nums;
}

function calculateCheckDigit(body) {
  const nums = expandDigits(body);
  if (!nums) return null;
  let crossSum = 0;
  const len = nums.length;
  for (let i = 0; i < len; i += 1) {
    const fromLeftEven = (len - 1 - i) % 2 === 0;
    const weight = fromLeftEven ? 2 : 1;
    crossSum += calcCrossSum(nums[i] * weight);
  }
  const diff = 10 - (crossSum % 10);
  return diff === 10 ? 0 : diff;
}

function fail(error, message, extra) {
  return Object.assign({ valid: false, error, message }, extra || {});
}

export default async function run(input) {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    return fail("INVALID_INPUT", "input must be an object");
  }
  if (typeof input.isin !== "string") {
    return fail("INVALID_INPUT", "isin must be a string");
  }
  if (input.isin.length > 64) {
    return fail("INVALID_LENGTH", "isin is too long");
  }
  const checkCountryCode = input.checkCountryCode !== false;
  const checkCheckDigit = input.checkCheckDigit !== false;

  const raw = input.isin.trim().toUpperCase().replace(/[\s-]/g, "");
  if (raw.length !== 12) {
    return fail("INVALID_LENGTH", "ISIN must be 12 characters long", { isin: raw });
  }
  if (!/^[A-Z0-9]+$/.test(raw)) {
    return fail("INVALID_CHAR", "ISIN contains not only [A-Z0-9]", { isin: raw });
  }

  const countryCode = raw.slice(0, 2);
  if (!/^[A-Z]+$/.test(countryCode)) {
    return fail("INVALID_COUNTRY", "Country code contains not only [A-Z]", { isin: raw, countryCode });
  }
  if (checkCountryCode && !ISO_ALPHA2.has(countryCode) && !PSEUDO.has(countryCode)) {
    return fail("INVALID_COUNTRY", "Country code is wrong", { isin: raw, countryCode });
  }

  const nsin = raw.slice(2, 11);
  const checkChar = raw[11];
  if (!/^[0-9]$/.test(checkChar)) {
    return fail("INVALID_CHECK_DIGIT", "Check digit contains not only [0-9]", {
      isin: raw,
      countryCode,
      nsin,
      checkDigit: checkChar,
    });
  }

  const expected = calculateCheckDigit(countryCode + nsin);
  const expectedStr = String(expected);
  if (checkCheckDigit && checkChar !== expectedStr) {
    return fail("INVALID_CHECK_DIGIT", "Check digit is wrong", {
      isin: raw,
      countryCode,
      nsin,
      checkDigit: checkChar,
      expectedCheckDigit: expectedStr,
    });
  }

  return {
    valid: true,
    isin: raw,
    countryCode,
    nsin,
    checkDigit: checkChar,
    expectedCheckDigit: expectedStr,
  };
}
