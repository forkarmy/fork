// Port of generation from lonly197/uuidjs (MIT) and validation from Alessandro71087/uuid-string-parser (ISC)
// - lonly197/uuidjs: UUID v4 generation with RFC 4122 compliance
// - Alessandro71087/uuid-string-parser: UUID validation and parsing with version/variant detection

const CANONICAL_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const VERSION_LABELS = {
  1: 'time_based',
  2: 'dce_security',
  3: 'name_md5',
  4: 'random',
  5: 'name_sha1',
};

/**
 * Returns an unsigned x-bit random integer.
 * @private
 */
function getRandomInt(x) {
  if (x < 0 || x > 53) {
    return NaN;
  }
  const n = 0 | (Math.random() * 0x40000000); // 1 << 30
  return x > 30 ? n + ((0 | (Math.random() * (1 << (x - 30)))) * 0x40000000) : n >>> (30 - x);
}

/**
 * Converts an integer to a zero-filled hexadecimal string.
 * @private
 */
function getHexAligner(num, length) {
  let str = num.toString(16);
  let i = length - str.length;
  let z = '0';
  for (; i > 0; i >>>= 1, z += z) {
    if (i & 1) {
      str = z + str;
    }
  }
  return str;
}

/**
 * Generates a version 4 UUID as a hexadecimal string.
 * @private
 */
function generateV4() {
  // time_low
  const seg1 = getHexAligner(getRandomInt(32), 8);
  // time_mid
  const seg2 = getHexAligner(getRandomInt(16), 4);
  // time_hi_and_version
  const seg3 = getHexAligner(0x4000 | getRandomInt(12), 4);
  // clock_seq_hi_and_reserved_clock_seq_low
  const seg4 = getHexAligner(0x8000 | getRandomInt(14), 4);
  // node
  const seg5 = getHexAligner(getRandomInt(48), 12);
  return `${seg1}-${seg2}-${seg3}-${seg4}-${seg5}`;
}

/**
 * Normalizes UUID input string: removes braces and lowercases.
 * @private
 */
function normalizeInput(s) {
  if (typeof s !== 'string') {
    throw new Error(`UUID input must be a string, got ${typeof s}`);
  }
  let r = s;
  if (r.length >= 2 && r.charCodeAt(0) === 0x7b && r.charCodeAt(r.length - 1) === 0x7d) {
    r = r.slice(1, -1);
  }
  return r.toLowerCase();
}

/**
 * Parses hexadecimal string to number.
 * @private
 */
function parseIntHex(hex) {
  return Number('0x' + hex);
}

/**
 * Parses and validates a UUID string.
 * @private
 */
function parseUUID(s) {
  const norm = normalizeInput(s);
  if (!CANONICAL_RE.test(norm)) {
    throw new Error(`not a valid UUID string: ${JSON.stringify(s)}`);
  }

  const timeLow = parseIntHex(norm.slice(0, 8));
  const timeMid = parseIntHex(norm.slice(9, 13));
  const timeHiAndVersion = parseIntHex(norm.slice(14, 18));
  const clockSeq = parseIntHex(norm.slice(19, 23));
  const node = parseIntHex(norm.slice(24, 36));

  const clockSeqHiVar = (clockSeq >> 8) & 0xff;
  const clockSeqLow = clockSeq & 0xff;

  if ((clockSeqHiVar & 0xc0) !== 0x80) {
    throw new Error(`unsupported variant (top bits not '10'): ${JSON.stringify(s)}`);
  }
  const v = (timeHiAndVersion >> 12) & 0xf;
  if (v < 1 || v > 5) {
    throw new Error(`unsupported version ${v}: ${JSON.stringify(s)}`);
  }

  return {
    timeLow,
    timeMid,
    timeHiAndVersion,
    clockSeqHiVar,
    clockSeqLow,
    node,
    versionNumber: v,
  };
}

/**
 * Serializes parsed UUID fields back to string.
 * @private
 */
function serializeUUID(fields) {
  const f = [
    fields.timeLow,
    fields.timeMid,
    fields.timeHiAndVersion,
    (fields.clockSeqHiVar << 8) | fields.clockSeqLow,
    fields.node,
  ];
  const widths = [8, 4, 4, 4, 12];
  let s = '';
  for (let i = 0; i < f.length; i++) {
    s += (i > 0 ? '-' : '') + f[i].toString(16).padStart(widths[i], '0');
  }
  return s;
}

/**
 * Main FORK skill: validate or generate UUIDs.
 * Input: { action: "validate", uuid: "..." } or { action: "generate" }
 * Output: validation result with parsed fields or generated UUID
 */
export default async function run(input) {
  if (!input || typeof input !== 'object') {
    return { error: 'Input must be an object with action and uuid properties' };
  }

  const { action, uuid } = input;

  if (action === 'validate') {
    if (typeof uuid !== 'string') {
      return { error: 'uuid must be a string' };
    }

    try {
      const parsed = parseUUID(uuid);
      const canonical = serializeUUID(parsed);
      const versionLabel = VERSION_LABELS[parsed.versionNumber] || 'unknown';

      return {
        valid: true,
        uuid,
        canonical,
        version: parsed.versionNumber,
        versionLabel,
        variant: 'rfc_4122',
        timeLow: '0x' + parsed.timeLow.toString(16).padStart(8, '0'),
        timeMid: '0x' + parsed.timeMid.toString(16).padStart(4, '0'),
        timeHiAndVersion: '0x' + parsed.timeHiAndVersion.toString(16).padStart(4, '0'),
        clockSeqHiVar: '0x' + parsed.clockSeqHiVar.toString(16).padStart(2, '0'),
        clockSeqLow: '0x' + parsed.clockSeqLow.toString(16).padStart(2, '0'),
        node: '0x' + parsed.node.toString(16).padStart(12, '0'),
      };
    } catch (err) {
      return {
        valid: false,
        uuid,
        error: err.message,
      };
    }
  }

  if (action === 'generate') {
    const generated = generateV4();
    const parsed = parseUUID(generated);
    const versionLabel = VERSION_LABELS[parsed.versionNumber];

    return {
      uuid: generated,
      version: parsed.versionNumber,
      versionLabel,
      variant: 'rfc_4122',
    };
  }

  return { error: 'action must be "validate" or "generate"' };
}
