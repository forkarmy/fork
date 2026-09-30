// Ported from jodal/biip (Apache-2.0), src/biip/checksums.py and src/biip/gtin.py
// Original author: Stein Magnus Jodal and biip contributors.

function checkDigit(payload) {
  let sum = 0;
  for (let i = payload.length - 1, w = 3; i >= 0; i--, w = w === 3 ? 1 : 3) {
    sum += (payload.charCodeAt(i) - 48) * w;
  }
  return (10 - (sum % 10)) % 10;
}

function stripLeadingZeros(v) {
  const l = v.replace(/^0+/, '').length;
  if ([12, 13, 14].includes(v.length) && l >= 9 && l <= 12) return v.slice(v.length - 12);
  if (v.length >= 8 && l <= 8) return v.slice(v.length - 8);
  return v.replace(/^0+/, '');
}

const fail = (error, message) => ({ valid: false, error, message });

export default async function run(input) {
  const raw = input && input.value;
  if (typeof raw !== 'string') return fail('INVALID_INPUT', 'value must be a string.');
  const value = raw.trim().replace(/[ -]/g, '');
  if (![8, 12, 13, 14].includes(value.length))
    return fail('INVALID_LENGTH', `Expected 8, 12, 13, or 14 digits, got ${value.length}.`);
  if (!/^[0-9]+$/.test(value)) return fail('NOT_NUMERIC', 'Expected a numerical value.');
  const s = stripLeadingZeros(value);
  const payload = s.slice(0, -1);
  const actual = Number(s[s.length - 1]);
  const expected = checkDigit(payload);
  const format = 'GTIN-' + s.length;
  const base = { value, format, payload, checkDigit: actual, expectedCheckDigit: expected };
  if (actual !== expected)
    return { valid: false, error: 'INVALID_CHECK_DIGIT', message: `Expected ${expected}, got ${actual}.`, ...base };
  const out = { valid: true, ...base, gtin14: s.padStart(14, '0') };
  if (s.length === 14) out.packagingLevel = Number(s[0]);
  if (s.length <= 13) out.gtin13 = s.padStart(13, '0');
  if (s.length <= 12) out.gtin12 = s.padStart(12, '0');
  return out;
}
