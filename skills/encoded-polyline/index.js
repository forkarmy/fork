// Copyright (c), Development Seed. All rights reserved.
// Ported from mapbox/polyline, BSD-3-Clause; includes work by Mark McClure
// and decoding adapted by upstream from Project-OSRM.
// See LICENSE. Wrapper validation and bounded precision are FORK additions.
const fail = (error, message) => ({valid:false, error, message});
const round = x => Math.floor(Math.abs(x) + 0.5) * (x >= 0 ? 1 : -1);
function encodeDelta(delta) {
  let value = delta * 2;
  if (value < 0) value = -value - 1;
  let out = '';
  while (value >= 32) {
    out += String.fromCharCode((value % 32) + 32 + 63);
    value = Math.floor(value / 32);
  }
  return out + String.fromCharCode(value + 63);
}
export default async function run(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return fail('INPUT', 'Input must be an object.');
  const precision = input.precision === undefined ? 5 : input.precision;
  if (!Number.isInteger(precision) || precision < 0 || precision > 10) return fail('PRECISION', 'Precision must be an integer from 0 to 10.');
  const factor = 10 ** precision;
  if (input.operation === 'encode') {
    const points = input.coordinates;
    if (!Array.isArray(points) || points.length > 10000) return fail('COORDINATES', 'Coordinates must be an array of at most 10000 pairs.');
    let lat = 0, lng = 0, polyline = '';
    for (const point of points) {
      if (!Array.isArray(point) || point.length !== 2 || !point.every(Number.isFinite) || Math.abs(point[0]) > 90 || Math.abs(point[1]) > 180) return fail('COORDINATES', 'Each coordinate must be a finite [latitude, longitude] pair within geographic bounds.');
      const nextLat = round(point[0] * factor), nextLng = round(point[1] * factor);
      polyline += encodeDelta(nextLat - lat) + encodeDelta(nextLng - lng);
      lat = nextLat; lng = nextLng;
    }
    return {valid:true, precision, polyline, pointCount:points.length};
  }
  if (input.operation !== 'decode') return fail('OPERATION', 'Operation must be encode or decode.');
  const text = input.polyline;
  if (typeof text !== 'string' || text.length > 200000) return fail('POLYLINE', 'Polyline must be a string of at most 200000 characters.');
  let index = 0;
  function readDelta() {
    let result = 0, shift = 1, count = 0;
    for (;;) {
      if (index >= text.length) throw new Error('Truncated coordinate value.');
      const byte = text.charCodeAt(index++) - 63;
      if (byte < 0 || byte > 63) throw new Error('Polyline characters must be ASCII 63 through 126.');
      const digit = byte % 32;
      result += digit * shift;
      count++;
      if (!Number.isSafeInteger(result) || count > 9) throw new Error('Coordinate value is too large.');
      if (byte < 32) {
        if (count > 1 && digit === 0) throw new Error('Noncanonical overlong coordinate value.');
        return result % 2 ? (-result - 1) / 2 : result / 2;
      }
      shift *= 32;
    }
  }
  let lat = 0, lng = 0;
  const coordinates = [];
  try {
    while (index < text.length) {
      if (coordinates.length >= 10000) return fail('LIMIT', 'Polyline exceeds 10000 points.');
      lat += readDelta(); lng += readDelta();
      if (Math.abs(lat) > 90 * factor || Math.abs(lng) > 180 * factor) return fail('BOUNDS', 'Decoded coordinate is outside geographic bounds.');
      coordinates.push([lat / factor, lng / factor]);
    }
  } catch (error) { return fail('POLYLINE', error.message); }
  return {valid:true, precision, coordinates, pointCount:coordinates.length};
}
