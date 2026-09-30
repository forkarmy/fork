/* Ported from bitcoinjs-lib, Copyright (c) 2011-2025 bitcoinjs-lib contributors,
 * and bs58check, Copyright (c) 2017 Daniel Cousens. MIT licensed.
 * Address length/version rules and double-SHA256 verification are preserved.
 * Base58 conversion uses bounded native BigInt arithmetic instead of bs58.
 */
import { createHash } from 'crypto';
import { Buffer } from 'buffer';

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const fail = (error, message) => ({ valid: false, error, message });
const sha256 = bytes => createHash('sha256').update(bytes).digest();

export default async function run(input) {
  if (!input || typeof input.address !== 'string')
    return fail('INVALID_INPUT', 'address must be a string.');
  if (input.address.length > 256)
    return fail('INVALID_LENGTH', 'Address input is too long.');
  const address = input.address.trim();
  if (!address) return fail('INVALID_INPUT', 'address must not be empty.');
  if (/^(bc1|tb1|bcrt1)/i.test(address))
    return fail('UNSUPPORTED_FORMAT', 'SegWit addresses are not supported by this legacy Base58Check decoder.');
  if (address.length > 64)
    return fail('INVALID_LENGTH', 'Legacy address input must be at most 64 characters.');
  let number = 0n;
  for (const char of address) {
    const digit = ALPHABET.indexOf(char);
    if (digit < 0) return fail('INVALID_CHARACTER', 'Address contains a character outside the Bitcoin Base58 alphabet.');
    number = number * 58n + BigInt(digit);
  }
  let zeros = 0;
  while (address[zeros] === '1') zeros++;
  const bytes = [];
  while (number > 0n) {
    bytes.push(Number(number & 255n));
    number >>= 8n;
  }
  const decoded = Buffer.from([...Array(zeros).fill(0), ...bytes.reverse()]);
  if (decoded.length < 4)
    return fail('INVALID_LENGTH', 'Decoded address is too short to contain a checksum.');
  const payload = decoded.subarray(0, -4);
  const checksum = decoded.subarray(-4);
  const expected = sha256(sha256(payload)).subarray(0, 4);
  let mismatch = 0;
  for (let i = 0; i < 4; i++) mismatch |= checksum[i] ^ expected[i];
  if (mismatch) return fail('INVALID_CHECKSUM', 'Base58Check checksum does not match.');
  if (payload.length !== 21)
    return fail('INVALID_LENGTH', 'Legacy Bitcoin addresses must contain a one-byte version and a 20-byte hash.');
  const version = payload[0];
  if (![0, 5, 111, 196].includes(version))
    return fail('UNSUPPORTED_VERSION', 'Version byte is not a supported Bitcoin legacy address version.');
  const mainnet = version === 0 || version === 5;
  return {
    valid: true,
    address,
    encoding: 'base58check',
    network: mainnet ? 'mainnet' : 'testnet-family',
    possibleNetworks: mainnet ? ['mainnet'] : ['testnet', 'signet', 'regtest'],
    type: version === 0 || version === 111 ? 'p2pkh' : 'p2sh',
    version,
    hash: payload.subarray(1).toString('hex')
  };
}
