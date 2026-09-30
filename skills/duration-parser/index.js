// Ported from vercel/ms (MIT) by Vercel, Inc. and Guillermo Rauch. src/index.ts
const s = 1000, m = s * 60, h = m * 60, d = h * 24, w = d * 7, y = d * 365.25, mo = y / 12;
const UNITS = [
  [/^(years?|yrs?|y)$/, y], [/^(months?|mo)$/, mo], [/^(weeks?|w)$/, w], [/^(days?|d)$/, d],
  [/^(hours?|hrs?|h)$/, h], [/^(minutes?|mins?|m)$/, m], [/^(seconds?|secs?|s)$/, s],
  [/^(milliseconds?|msecs?|ms)$/, 1],
];

function parse(str) {
  const match = /^(-?\d*\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|months?|mo|years?|yrs?|y)?$/i.exec(str);
  if (!match) return null;
  const n = parseFloat(match[1]);
  const unit = (match[2] || 'ms').toLowerCase();
  for (const [re, f] of UNITS) if (re.test(unit)) return n * f;
  return null;
}

const STEPS = [[y, 'y', 'year'], [mo, 'mo', 'month'], [w, 'w', 'week'], [d, 'd', 'day'], [h, 'h', 'hour'], [m, 'm', 'minute'], [s, 's', 'second']];

function fmtShort(ms) {
  const a = Math.abs(ms);
  for (const [n, u] of STEPS) if (a >= n) return `${Math.round(ms / n)}${u}`;
  return `${ms}ms`;
}
function fmtLong(ms) {
  const a = Math.abs(ms);
  for (const [n, , name] of STEPS) if (a >= n) return `${Math.round(ms / n)} ${name}${a >= n * 1.5 ? 's' : ''}`;
  return `${ms} ms`;
}

export default async function run(input) {
  const v = input && input.value;
  if (typeof v === 'string') {
    const t = v.trim();
    if (t.length === 0 || t.length > 100) return { valid: false, error: 'INVALID_LENGTH', message: 'String must have length 1 to 100.' };
    const ms = parse(t);
    if (ms === null) return { valid: false, error: 'UNPARSEABLE', message: `Cannot parse duration: ${JSON.stringify(v)}` };
    return { valid: true, operation: 'parse', input: v, milliseconds: ms, short: fmtShort(ms), long: fmtLong(ms) };
  }
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) return { valid: false, error: 'NOT_FINITE', message: 'Number must be finite.' };
    return { valid: true, operation: 'format', milliseconds: v, short: fmtShort(v), long: fmtLong(v) };
  }
  return { valid: false, error: 'INVALID_INPUT', message: 'value must be a string or number.' };
}
