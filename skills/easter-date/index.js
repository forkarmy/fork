// Ported from rg3/computus (computus.py) by Ricardo Garcia, CC0-1.0.
// Anonymous Gregorian algorithm ("A New York correspondent", Nature 1876).
const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => `${String(d.getUTCFullYear()).padStart(4, '0')}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

export default async function run(input) {
  let y = input && input.year;
  if (typeof y === 'string' && /^\s*\d+\s*$/.test(y)) y = Number(y);
  if (!Number.isInteger(y) || y < 1583 || y > 9999) {
    return { valid: false, error: 'INVALID_YEAR', message: 'year must be an integer 1583-9999 (Gregorian calendar)' };
  }
  const A = y % 19, B = Math.floor(y / 100), C = y % 100;
  const D = Math.floor(B / 4), E = B % 4;
  const F = Math.floor((B + 8) / 25), G = Math.floor((B - F + 1) / 3);
  const H = (19 * A + B - D - G + 15) % 30;
  const I = Math.floor(C / 4), K = C % 4;
  const L = (32 + 2 * E + 2 * I - H - K) % 7;
  const M = Math.floor((A + 11 * H + 22 * L) / 451);
  const N = H + L - 7 * M + 114;
  const month = Math.floor(N / 31), day = 1 + (N % 31);
  const e = Date.UTC(y, month - 1, day);
  const off = (n) => { const d = new Date(e + n * 86400000); d.setUTCFullYear(d.getUTCFullYear()); return iso(d); };
  const easterD = new Date(e); easterD.setUTCFullYear(y);
  return {
    valid: true, year: y, calendar: 'gregorian', month, day,
    easter: iso(new Date(Date.UTC(2000, month - 1, day))).replace(/^2000/, String(y).padStart(4, '0')),
    related: {
      ashWednesday: off(-46), palmSunday: off(-7), maundyThursday: off(-3),
      goodFriday: off(-2), easterMonday: off(1), ascension: off(39), pentecost: off(49)
    }
  };
}
