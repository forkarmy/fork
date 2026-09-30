// Adapted from swansontec/rfc4648.js, src/index.ts.
// Copyright © 2022 William R Swanson. MIT License.
import { Buffer } from 'buffer';

function stringify(data, chars, pad) {
  let out = '', bits = 0, buffer = 0;
  for (let i = 0; i < data.length; ++i) {
    buffer = (buffer << 8) | data[i];
    bits += 8;
    while (bits > 5) {
      bits -= 5;
      out += chars[31 & (buffer >> bits)];
    }
  }
  if (bits) out += chars[31 & (buffer << (5 - bits))];
  if (pad) while ((out.length * 5) & 7) out += '=';
  return out;
}
function parse(string, chars, pad) {
  if (pad && ((string.length * 5) & 7)) throw new Error('Invalid padding');
  if (!pad && string.includes('=')) throw new Error('Padding is forbidden when padding is false');
  let end = string.length;
  while (string[end - 1] === '=') {
    --end;
    if (pad && !(((string.length - end) * 5) & 7)) throw new Error('Invalid padding');
  }
  const out = Buffer.alloc(Math.floor(end * 5 / 8));
  let bits = 0, buffer = 0, written = 0;
  for (let i = 0; i < end; ++i) {
    const value = chars.indexOf(string[i]);
    if (value === -1) throw new Error('Invalid character at index ' + i);
    buffer = (buffer << 5) | value;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      out[written++] = 255 & (buffer >> bits);
    }
  }
  if (bits >= 5 || (255 & (buffer << (8 - bits)))) throw new Error('Unexpected end of data');
  return out;
}
const fail = (error, message) => ({valid: false, error, message});
export default async function run(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return fail('INPUT', 'Expected an input object');
  const {operation, data, alphabet = 'base32', padding = true, inputEncoding = 'utf8'} = input;
  if (operation !== 'encode' && operation !== 'decode') return fail('INPUT', 'operation must be encode or decode');
  if (typeof data !== 'string') return fail('INPUT', 'data must be a string');
  if (data.length > 100000) return fail('LIMIT', 'data exceeds 100000 characters');
  if (alphabet !== 'base32' && alphabet !== 'base32hex') return fail('INPUT', 'alphabet must be base32 or base32hex');
  if (typeof padding !== 'boolean') return fail('INPUT', 'padding must be boolean');
  if (inputEncoding !== 'utf8' && inputEncoding !== 'hex') return fail('INPUT', 'inputEncoding must be utf8 or hex');
  const chars = alphabet === 'base32' ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567' : '0123456789ABCDEFGHIJKLMNOPQRSTUV';
  let bytes;
  if (operation === 'encode') {
    if (inputEncoding === 'hex' && (data.length % 2 || !/^[0-9a-fA-F]*$/.test(data))) return fail('HEX', 'Hex data must contain complete byte pairs without separators');
    bytes = Buffer.from(data, inputEncoding);
  } else {
    try { bytes = parse(data, chars, padding); }
    catch (e) { return fail('BASE32', e.message); }
  }
  const text = bytes.toString('utf8');
  return {valid: true, operation, alphabet, encoded: stringify(bytes, chars, padding), hex: bytes.toString('hex'), text: Buffer.from(text, 'utf8').equals(bytes) ? text : null, byteLength: bytes.length};
}
