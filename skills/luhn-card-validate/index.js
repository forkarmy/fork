// Ported from braintree/card-validator (MIT), src/luhn-10.js and src/card-number.ts.
// Luhn implementation Copyright (c) 2009 Nicholas C. Zakas (MIT).
// Brand patterns follow braintree/credit-card-type (MIT).

const TYPES = [
  { type: "visa", niceType: "Visa", patterns: [4], lengths: [16, 18, 19] },
  { type: "mastercard", niceType: "Mastercard", patterns: [[51, 55], [2221, 2229], [223, 229], [23, 26], [270, 271], 2720], lengths: [16] },
  { type: "american-express", niceType: "American Express", patterns: [34, 37], lengths: [15] },
  { type: "diners-club", niceType: "Diners Club", patterns: [[300, 305], 36, 38, 39], lengths: [14, 16, 19] },
  { type: "discover", niceType: "Discover", patterns: [6011, [644, 649], 65], lengths: [16, 19] },
  { type: "jcb", niceType: "JCB", patterns: [2131, 1800, [3528, 3589]], lengths: [16, 17, 18, 19] },
  { type: "unionpay", niceType: "UnionPay", patterns: [620, [62100, 62182], [62184, 62187], [62185, 62197], [62200, 62205], [622010, 622999], 622018, [62207, 62209], [623, 626], 6270, 6272, 6276, [627700, 627779], [627781, 627799], [6282, 6289], 6291, 6292, 810, [8110, 8131], [8132, 8151], [8152, 8163], [8164, 8171]], lengths: [14, 15, 16, 17, 18, 19] },
  { type: "maestro", niceType: "Maestro", patterns: [493698, [500000, 504174], [504176, 506698], [506779, 508999], [56, 59], 63, 67, 6], lengths: [12, 13, 14, 15, 16, 17, 18, 19] },
];

function matchLen(num, p) {
  if (Array.isArray(p)) {
    const len = String(p[0]).length;
    const v = parseInt(num.slice(0, len), 10);
    const lo = parseInt(String(p[0]).slice(0, num.length), 10);
    const hi = parseInt(String(p[1]).slice(0, num.length), 10);
    if (num.length < len) return (v >= lo && v <= hi) ? num.length : -1;
    return (v >= p[0] && v <= p[1]) ? len : -1;
  }
  const s = String(p);
  if (num.length < s.length) return s.startsWith(num) ? num.length : -1;
  return num.startsWith(s) ? s.length : -1;
}

function detect(num) {
  if (!num) return null;
  let best = null, bestLen = -1;
  for (const t of TYPES) {
    for (const p of t.patterns) {
      const l = matchLen(num, p);
      if (l > bestLen) { bestLen = l; best = t; }
    }
  }
  return best;
}

function luhnSum(id) {
  let sum = 0, alt = false;
  for (let i = id.length - 1; i >= 0; i--) {
    let n = id.charCodeAt(i) - 48;
    if (alt) { n *= 2; if (n > 9) n = (n % 10) + 1; }
    alt = !alt;
    sum += n;
  }
  return sum;
}

export default async function run(input) {
  const raw = input && (typeof input.number === "string" || typeof input.number === "number") ? String(input.number) : null;
  if (raw === null) return { valid: false, error: "missing_number", message: "Provide number as a string." };
  const num = raw.replace(/-|\s/g, "");
  if (!/^\d+$/.test(num)) return { valid: false, error: "invalid_characters", message: "Only digits, spaces and dashes are allowed." };
  const luhnValid = luhnSum(num) % 10 === 0;
  const body = num.slice(0, -1);
  const expectedCheckDigit = (10 - (luhnSum(body + "0") % 10)) % 10;
  const t = detect(num);
  const lengthValid = t ? t.lengths.includes(num.length) : null;
  return {
    valid: luhnValid,
    number: num,
    length: num.length,
    checkDigit: Number(num[num.length - 1]),
    expectedCheckDigit,
    brand: t ? t.type : null,
    brandName: t ? t.niceType : null,
    lengthValidForBrand: lengthValid,
    validCard: !!(t && luhnValid && lengthValid),
  };
}
