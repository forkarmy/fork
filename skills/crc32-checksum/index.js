// CRC-32 (IEEE 802.3) ported from buffer-crc32 by Brian J. Brennan (MIT)
// https://github.com/brianloveswords/buffer-crc32
import { Buffer } from 'buffer';

const CRC_TABLE = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c;
}

function fail(error, message) {
  return { valid: false, error, message };
}

export default async function run(input) {
  input = input || {};
  let buf;
  if (typeof input.hex === 'string') {
    const h = input.hex.replace(/[\s:]/g, '').replace(/^0x/i, '');
    if (h.length % 2 || /[^0-9a-fA-F]/.test(h)) return fail('invalid_hex', 'hex must be an even number of hex digits');
    buf = Buffer.from(h, 'hex');
  } else if (typeof input.text === 'string') {
    buf = Buffer.from(input.text, 'utf8');
  } else {
    return fail('missing_input', 'Provide text (string) or hex (string)');
  }
  let previous = 0;
  if (input.previous !== undefined) {
    const p = input.previous;
    if (typeof p === 'number' && Number.isInteger(p) && p >= -2147483648 && p <= 4294967295) previous = p;
    else if (typeof p === 'string' && /^(0x)?[0-9a-fA-F]{1,8}$/i.test(p.trim())) previous = parseInt(p.trim().replace(/^0x/i, ''), 16);
    else return fail('invalid_previous', 'previous must be a 32-bit integer or up to 8 hex digits');
  }
  let crc = ~~previous ^ -1;
  for (let n = 0; n < buf.length; n++) crc = CRC_TABLE[(crc ^ buf[n]) & 0xff] ^ (crc >>> 8);
  crc = crc ^ -1;
  const unsigned = crc >>> 0;
  return {
    valid: true,
    unsigned,
    signed: crc | 0,
    hex: unsigned.toString(16).padStart(8, '0'),
    byteLength: buf.length,
  };
}
