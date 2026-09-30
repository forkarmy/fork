// Ported from beaugunderson/ip-address (MIT).
// Copyright (C) 2011 by Beau Gunderson.
// https://github.com/beaugunderson/ip-address
//
// Parse rules, prefix-length checks, and subnet bounds follow Address4 in
// src/ipv4.ts plus prefixLengthFromMask / isHostInSubnet in src/common.ts.
// Usable hosts follow RFC 3021: a /31 or /32 reserves no network or broadcast.

const BITS = 32;
const MAX_LEN = 15;
const ALL_ONES = (1n << 32n) - 1n;

// Octets are 0-255 with no leading zero. A leading zero is octal to the
// WHATWG URL parser, inet_aton, and getaddrinfo, but decimal to
// parseInt(part, 10). The source regex carries a /g flag; it is omitted
// here so repeated calls do not advance lastIndex.
const RE_ADDRESS =
  /^(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])$/;

const RE_SUBNET_STRING = /\/\d{1,2}$/;

function fail(error, message) {
  return { valid: false, error, message };
}

function intToDotted(value) {
  const n = BigInt(value);
  return [
    Number((n >> 24n) & 255n),
    Number((n >> 16n) & 255n),
    Number((n >> 8n) & 255n),
    Number(n & 255n),
  ].join('.');
}

function octetsOf(value) {
  const n = BigInt(value);
  return [
    Number((n >> 24n) & 255n),
    Number((n >> 16n) & 255n),
    Number((n >> 8n) & 255n),
    Number(n & 255n),
  ];
}

// src/common.ts prefixLengthFromMask: leading ones, then only zeros.
function prefixLengthFromMask(value) {
  const binary = value.toString(2).padStart(BITS, '0');

  if (binary.length > BITS) {
    return { error: 'invalid_mask', message: 'Invalid subnet mask.' };
  }

  const firstZero = binary.indexOf('0');

  if (firstZero === -1) {
    return { prefix: BITS };
  }

  if (binary.slice(firstZero).includes('1')) {
    return { error: 'invalid_mask', message: 'Invalid subnet mask.' };
  }

  return { prefix: firstZero };
}

// Integer form of Address4.subnetMaskAddress / wildcardMask bit strings.
function maskFromPrefix(prefix) {
  if (prefix <= 0) {
    return 0n;
  }
  if (prefix >= BITS) {
    return ALL_ONES;
  }
  return (ALL_ONES << BigInt(BITS - prefix)) & ALL_ONES;
}

// Address4 constructor + parse(): optional /prefix, length cap, no leading zeros.
function parseAddress(raw, allowSuffix) {
  if (typeof raw !== 'string') {
    return { error: 'invalid_address', message: 'Invalid IPv4 address.' };
  }

  let address = raw.trim();

  if (address.length === 0) {
    return { error: 'invalid_address', message: 'Invalid IPv4 address.' };
  }

  let suffix = null;
  const subnet = RE_SUBNET_STRING.exec(address);

  if (subnet) {
    if (!allowSuffix) {
      return { error: 'invalid_address', message: 'Invalid IPv4 address.' };
    }

    const subnetMask = parseInt(subnet[0].replace('/', ''), 10);

    if (subnetMask < 0 || subnetMask > BITS) {
      return { error: 'invalid_subnet', message: 'Invalid subnet mask.' };
    }

    suffix = subnetMask;
    address = address.replace(RE_SUBNET_STRING, '');
  }

  if (address.length > MAX_LEN) {
    return {
      error: 'invalid_address',
      message: `IPv4 addresses are at most ${MAX_LEN} characters.`,
    };
  }

  const groups = address.split('.');

  if (groups.some((group) => /^0\d/.test(group))) {
    return {
      error: 'invalid_address',
      message: "IPv4 addresses can't have leading zeroes.",
    };
  }

  if (!RE_ADDRESS.test(address)) {
    return { error: 'invalid_address', message: 'Invalid IPv4 address.' };
  }

  const octets = groups.map((part) => parseInt(part, 10));
  let integer = 0n;

  for (let i = 0; i < octets.length; i++) {
    integer = (integer << 8n) + BigInt(octets[i]);
  }

  return {
    integer,
    octets,
    correct: octets.join('.'),
    suffix,
  };
}

// Address4.fromInteger
function parseInteger(value) {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > 0xffffffff) {
    return {
      error: 'invalid_integer',
      message: 'IPv4 integer must be in the range 0 to 2**32 - 1',
    };
  }

  const integer = BigInt(value);

  return {
    integer,
    octets: octetsOf(integer),
    correct: intToDotted(integer),
    suffix: null,
  };
}

function parsePrefixField(value) {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > BITS) {
    return { error: 'invalid_subnet', message: 'Prefix must be an integer from 0 to 32.' };
  }

  return { prefix: value };
}

// Address4.fromAddressAndMask
function parseMask(raw) {
  const parsed = parseAddress(raw, false);

  if (parsed.error) {
    return { error: 'invalid_mask', message: 'Invalid subnet mask.' };
  }

  return prefixLengthFromMask(parsed.integer);
}

function describe(host, prefix) {
  const mask = maskFromPrefix(prefix);
  const wildcard = mask ^ ALL_ONES;
  // startAddress: network bits, then zeros. endAddress: network bits, then ones.
  const network = host.integer & mask;
  const broadcast = host.integer | wildcard;
  const total = 1n << BigInt(BITS - prefix);

  let first;
  let last;
  let hostCount;

  if (prefix >= 31) {
    first = network;
    last = broadcast;
    hostCount = total;
  } else {
    first = network + 1n;
    last = broadcast - 1n;
    hostCount = total - 2n;
  }

  return {
    valid: true,
    address: host.correct,
    prefix,
    integer: Number(host.integer),
    octets: host.octets,
    network: intToDotted(network),
    broadcast: intToDotted(broadcast),
    netmask: intToDotted(mask),
    wildcard: intToDotted(wildcard),
    first_host: intToDotted(first),
    last_host: intToDotted(last),
    host_count: Number(hostCount),
    total_addresses: Number(total),
    network_cidr: `${intToDotted(network)}/${prefix}`,
    is_network_address: host.integer === network,
    contains: null,
  };
}

export default async function run(input) {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    return fail('missing_input', 'Provide an address string or an integer.');
  }

  const hasAddress = typeof input.address === 'string';
  const hasInteger = input.integer !== undefined && input.integer !== null;

  if (!hasAddress && !hasInteger) {
    return fail('missing_input', 'Provide an address string or an integer.');
  }

  if (hasAddress && hasInteger) {
    return fail('missing_input', 'Provide an address string or an integer, not both.');
  }

  const host = hasInteger ? parseInteger(input.integer) : parseAddress(input.address, true);

  if (host.error) {
    return fail(host.error, host.message);
  }

  let maskPrefix = null;

  if (input.mask !== undefined && input.mask !== null) {
    const parsedMask = parseMask(input.mask);

    if (parsedMask.error) {
      return fail(parsedMask.error, parsedMask.message);
    }

    maskPrefix = parsedMask.prefix;
  }

  let fieldPrefix = null;

  if (input.prefix !== undefined && input.prefix !== null) {
    const parsedPrefix = parsePrefixField(input.prefix);

    if (parsedPrefix.error) {
      return fail(parsedPrefix.error, parsedPrefix.message);
    }

    fieldPrefix = parsedPrefix.prefix;
  }

  const specified = [host.suffix, maskPrefix, fieldPrefix].filter((value) => value !== null);

  if (specified.length > 1 && specified.some((value) => value !== specified[0])) {
    return fail('prefix_conflict', 'Prefix, CIDR suffix, and mask do not agree.');
  }

  const prefix = specified.length > 0 ? specified[0] : BITS;
  const result = describe(host, prefix);

  if (input.contains !== undefined && input.contains !== null) {
    const other = parseAddress(input.contains, true);

    if (other.error) {
      return fail('invalid_contains', other.message);
    }

    // isHostInSubnet: compare the prefix bits, ignore the other address's suffix.
    const mask = maskFromPrefix(prefix);
    result.contains = (other.integer & mask) === (host.integer & mask);
  }

  return result;
}
