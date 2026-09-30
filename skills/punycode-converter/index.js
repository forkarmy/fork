// Ported from punycode.js by Mathias Bynens (MIT) — https://github.com/mathiasbynens/punycode.js
const maxInt = 2147483647, base = 36, tMin = 1, tMax = 26, skew = 38, damp = 700, initialBias = 72, initialN = 128, delimiter = '-';
const regexPunycode = /^xn--/;
const regexNonASCII = /[^\0-\x7F]/;
const regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g;
const errors = {
  overflow: 'Overflow: input needs wider integers to handle',
  'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
  'invalid-input': 'Invalid input'
};
const floor = Math.floor;
class PunyError extends Error { constructor(t) { super(errors[t]); this.code = t; } }
function error(t) { throw new PunyError(t); }

function mapDomain(domain, cb) {
  const parts = domain.split('@');
  let result = '';
  if (parts.length > 1) { result = parts[0] + '@'; domain = parts[1]; }
  domain = domain.replace(regexSeparators, '.');
  return result + domain.split('.').map(cb).join('.');
}
function ucs2decode(s) {
  const out = []; let c = 0; const len = s.length;
  while (c < len) {
    const v = s.charCodeAt(c++);
    if (v >= 0xD800 && v <= 0xDBFF && c < len) {
      const x = s.charCodeAt(c++);
      if ((x & 0xFC00) == 0xDC00) out.push(((v & 0x3FF) << 10) + (x & 0x3FF) + 0x10000);
      else { out.push(v); c--; }
    } else out.push(v);
  }
  return out;
}
function basicToDigit(cp) {
  if (cp >= 0x30 && cp < 0x3A) return 26 + (cp - 0x30);
  if (cp >= 0x41 && cp < 0x5B) return cp - 0x41;
  if (cp >= 0x61 && cp < 0x7B) return cp - 0x61;
  return base;
}
function digitToBasic(d) { return d + 22 + 75 * (d < 26); }
function adapt(delta, numPoints, first) {
  let k = 0;
  delta = first ? floor(delta / damp) : delta >> 1;
  delta += floor(delta / numPoints);
  for (; delta > (base - tMin) * tMax >> 1; k += base) delta = floor(delta / (base - tMin));
  return floor(k + (base - tMin + 1) * delta / (delta + skew));
}
function decode(input) {
  const output = []; const L = input.length;
  let i = 0, n = initialN, bias = initialBias;
  let basic = input.lastIndexOf(delimiter); if (basic < 0) basic = 0;
  for (let j = 0; j < basic; ++j) {
    if (input.charCodeAt(j) >= 0x80) error('not-basic');
    output.push(input.charCodeAt(j));
  }
  for (let index = basic > 0 ? basic + 1 : 0; index < L;) {
    const oldi = i;
    for (let w = 1, k = base; ; k += base) {
      if (index >= L) error('invalid-input');
      const digit = basicToDigit(input.charCodeAt(index++));
      if (digit >= base) error('invalid-input');
      if (digit > floor((maxInt - i) / w)) error('overflow');
      i += digit * w;
      const t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
      if (digit < t) break;
      if (w > floor(maxInt / (base - t))) error('overflow');
      w *= base - t;
    }
    const out = output.length + 1;
    bias = adapt(i - oldi, out, oldi == 0);
    if (floor(i / out) > maxInt - n) error('overflow');
    n += floor(i / out); i %= out;
    if (n > 0x10FFFF) error('overflow');
    output.splice(i++, 0, n);
  }
  return String.fromCodePoint(...output);
}
function encode(str) {
  const output = []; const input = ucs2decode(str); const L = input.length;
  let n = initialN, delta = 0, bias = initialBias;
  for (const v of input) if (v < 0x80) output.push(String.fromCharCode(v));
  const basicLength = output.length; let h = basicLength;
  if (basicLength) output.push(delimiter);
  while (h < L) {
    let m = maxInt;
    for (const v of input) if (v >= n && v < m) m = v;
    if (m - n > floor((maxInt - delta) / (h + 1))) error('overflow');
    delta += (m - n) * (h + 1); n = m;
    for (const v of input) {
      if (v < n && ++delta > maxInt) error('overflow');
      if (v === n) {
        let q = delta;
        for (let k = base; ; k += base) {
          const t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
          if (q < t) break;
          output.push(String.fromCharCode(digitToBasic(t + (q - t) % (base - t))));
          q = floor((q - t) / (base - t));
        }
        output.push(String.fromCharCode(digitToBasic(q)));
        bias = adapt(delta, h + 1, h === basicLength);
        delta = 0; ++h;
      }
    }
    ++delta; ++n;
  }
  return output.join('');
}
const toUnicode = s => mapDomain(s, x => regexPunycode.test(x) ? decode(x.slice(4).toLowerCase()) : x);
const toASCII = s => mapDomain(s, x => regexNonASCII.test(x) ? 'xn--' + encode(x) : x);

export default async function run(input) {
  const { input: text, operation = 'toASCII' } = input || {};
  if (typeof text !== 'string') return { valid: false, error: 'INVALID_INPUT', message: 'input must be a string' };
  if (text.length > 100000) return { valid: false, error: 'TOO_LONG', message: 'input exceeds 100000 characters' };
  const ops = { toASCII, toUnicode, encode, decode };
  if (!ops[operation]) return { valid: false, error: 'INVALID_OPERATION', message: 'operation must be toASCII, toUnicode, encode or decode' };
  try {
    return { valid: true, operation, input: text, output: ops[operation](text) };
  } catch (e) {
    if (e instanceof PunyError) return { valid: false, error: e.code, message: e.message };
    return { valid: false, error: 'invalid-input', message: String(e.message) };
  }
}
