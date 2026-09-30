/* Geohash encoding/decoding and associated functions
 * Copyright (c) Chris Veness 2014-2019, MIT Licence.
 * Adapted from chrisveness/latlon-geohash/latlon-geohash.js.
 */
const base32 = '0123456789bcdefghjkmnpqrstuvwxyz';

function encode(lat, lon, precision) {
  let idx = 0, bit = 0, evenBit = true, hash = '';
  let latMin = -90, latMax = 90, lonMin = -180, lonMax = 180;
  while (hash.length < precision) {
    if (evenBit) {
      const mid = (lonMin + lonMax) / 2;
      if (lon >= mid) { idx = idx * 2 + 1; lonMin = mid; }
      else { idx *= 2; lonMax = mid; }
    } else {
      const mid = (latMin + latMax) / 2;
      if (lat >= mid) { idx = idx * 2 + 1; latMin = mid; }
      else { idx *= 2; latMax = mid; }
    }
    evenBit = !evenBit;
    if (++bit === 5) { hash += base32[idx]; bit = 0; idx = 0; }
  }
  return hash;
}

function bounds(hash) {
  let evenBit = true;
  let latMin = -90, latMax = 90, lonMin = -180, lonMax = 180;
  for (const chr of hash) {
    const idx = base32.indexOf(chr);
    for (let n = 4; n >= 0; n--) {
      const bit = (idx >> n) & 1;
      if (evenBit) {
        const mid = (lonMin + lonMax) / 2;
        if (bit) lonMin = mid; else lonMax = mid;
      } else {
        const mid = (latMin + latMax) / 2;
        if (bit) latMin = mid; else latMax = mid;
      }
      evenBit = !evenBit;
    }
  }
  return { sw: { lat: latMin, lon: lonMin }, ne: { lat: latMax, lon: lonMax } };
}

const neighbour = {
  n: ['p0r21436x8zb9dcf5h7kjnmqesgutwvy', 'bc01fg45238967deuvhjyznpkmstqrwx'],
  s: ['14365h7k9dcfesgujnmqp0r2twvyx8zb', '238967debc01fg45kmstqrwxuvhjyznp'],
  e: ['bc01fg45238967deuvhjyznpkmstqrwx', 'p0r21436x8zb9dcf5h7kjnmqesgutwvy'],
  w: ['238967debc01fg45kmstqrwxuvhjyznp', '14365h7k9dcfesgujnmqp0r2twvyx8zb'],
};
const border = {
  n: ['prxz', 'bcfguvyz'], s: ['028b', '0145hjnp'],
  e: ['bcfguvyz', 'prxz'], w: ['0145hjnp', '028b'],
};
function adjacent(hash, direction) {
  const last = hash.slice(-1), type = hash.length % 2;
  let parent = hash.slice(0, -1);
  if (border[direction][type].includes(last) && parent !== '') parent = adjacent(parent, direction);
  return parent + base32[neighbour[direction][type].indexOf(last)];
}
function neighbours(hash) {
  const n = adjacent(hash, 'n'), s = adjacent(hash, 's');
  return { n, ne: adjacent(n, 'e'), e: adjacent(hash, 'e'), se: adjacent(s, 'e'),
    s, sw: adjacent(s, 'w'), w: adjacent(hash, 'w'), nw: adjacent(n, 'w') };
}
function invalid(message) { return { valid: false, error: 'INVALID_INPUT', message }; }

export default async function run(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return invalid('Input must be an object.');
  let hash;
  if (input.operation === 'encode') {
    const { latitude: lat, longitude: lon } = input;
    const precision = input.precision === undefined ? 9 : input.precision;
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) return invalid('Latitude must be a finite number between -90 and 90.');
    if (!Number.isFinite(lon) || lon < -180 || lon > 180) return invalid('Longitude must be a finite number between -180 and 180.');
    if (!Number.isInteger(precision) || precision < 1 || precision > 12) return invalid('Precision must be an integer between 1 and 12.');
    hash = encode(lat, lon, precision);
  } else if (input.operation === 'decode') {
    if (typeof input.geohash !== 'string') return invalid('Geohash must be a string of 1–12 geohash base32 characters.');
    hash = input.geohash.trim().toLowerCase();
    if (!/^[0123456789bcdefghjkmnpqrstuvwxyz]{1,12}$/.test(hash)) return invalid('Geohash must be a string of 1–12 geohash base32 characters.');
  } else return invalid('Operation must be encode or decode.');
  const box = bounds(hash);
  const roundedCenter = axis => Number(((box.sw[axis] + box.ne[axis]) / 2).toFixed(
    Math.floor(2 - Math.log(box.ne[axis] - box.sw[axis]) / Math.LN10)));
  return { valid: true, geohash: hash, precision: hash.length,
    center: { lat: roundedCenter('lat'), lon: roundedCenter('lon') },
    bounds: box, neighbors: neighbours(hash) };
}
