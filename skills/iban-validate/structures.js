// BBAN structures per country, ported from iban4j (Apache-2.0, Copyright 2013 Artur Mkrtchyan)
// src/main/java/org/iban4j/bban/BbanStructure.java
//
// Each entry token: <field letter><length><char class>
//   field: b=bank_code, s=branch_code, a=account_number, k=national_check_digit,
//          t=account_type, o=owner_account_number, i=identification_number, e=bank_code_ext
//   char class: n=digits, a=upper case letters, c=digits or upper case letters

export const FIELD_NAMES = {
  b: 'bank_code',
  s: 'branch_code',
  a: 'account_number',
  k: 'national_check_digit',
  t: 'account_type',
  o: 'owner_account_number',
  i: 'identification_number',
  e: 'bank_code_ext',
};

const FRENCH = 'b5n s5n a11c k2n';
const UK = 'b4a s6n a8n';
const FINLAND = 'b6n a7n k1n';

const RAW = {
  AL: 'b3n s4n k1n a16c',
  AD: 'b4n s4n a12c',
  AO: 'b4n s4n a11n k2n',
  AT: 'b5n a11n',
  AZ: 'b4a a20c',
  BH: 'b4a a14c',
  BE: 'b3n a7n k2n',
  BA: 'b3n s3n a8n k2n',
  BR: 'b8n s5n a10n t1a o1c',
  BG: 'b4a s4n t2n a8c',
  BY: 'b4c s4n a16c',
  CR: 'b4n a14n',
  DE: 'b8n a10n',
  HR: 'b7n a10n',
  CY: 'b3n s5n a16c',
  CZ: 'b4n a16n',
  DJ: 'b5n s5n a11n k2n',
  DK: 'b4n a10n',
  DO: 'b4c a20n',
  EE: 'b2n a13n k1n',
  EG: 'b4n s4n a17n',
  FO: 'b4n a9n k1n',
  FI: FINLAND, AX: FINLAND,
  FR: FRENCH, GF: FRENCH, GP: FRENCH, MQ: FRENCH, RE: FRENCH, PF: FRENCH, TF: FRENCH,
  YT: FRENCH, NC: FRENCH, BL: FRENCH, MF: FRENCH, PM: FRENCH, WF: FRENCH,
  GA: 'b5n s5n a13c',
  GE: 'b2a a16n',
  GI: 'b4a a15c',
  GL: 'b4n a10n',
  GR: 'b3n s4n a16c',
  GT: 'b4c a20c',
  HU: 'b3n s4n a16n k1n',
  IS: 'b2n s2n t2n a6n i10n',
  IE: 'b4a s6n a8n',
  IL: 'b3n s3n a13n',
  IR: 'b3n a19n',
  IT: 'k1a b5n s5n a12c',
  JO: 'b4a s4n a18c',
  KZ: 'b3n a13c',
  KW: 'b4a a22c',
  LC: 'b4a a24c',
  LV: 'b4a a13c',
  LB: 'b4n a20c',
  LI: 'b5n a12c',
  LT: 'b5n a11n',
  LU: 'b3n a13c',
  LY: 'b3n s3n a15n',
  MA: 'b3n s5n a16n',
  MC: 'b5n s5n a11c k2n',
  MD: 'b2c a18c',
  ME: 'b3n a13n k2n',
  MK: 'b3n a10c k2n',
  MR: 'b5n s5n a11n k2n',
  MT: 'b4a s5n a18c',
  MU: 'b6c s2n a18c',
  MZ: 'b4n s4n a11n k2n',
  NL: 'b4a a10n',
  NO: 'b4n a6n k1n',
  PK: 'b4c a16n',
  PS: 'b4a a21c',
  PL: 'b3n s4n k1n a16n',
  PT: 'b4n s4n a11n k2n',
  RO: 'b4a a16c',
  QA: 'b4a a21c',
  SC: 'b4a e2n s2n a16n t3a',
  SD: 'b2n a12n',
  SM: 'k1a b5n s5n a12c',
  SN: 'b5c s5n a12n k2n',
  ST: 'b4n s4n a13n',
  SA: 'b2n a18c',
  RS: 'b3n a13n k2n',
  RU: 'b9n s5n a15c',
  SK: 'b4n a16n',
  SI: 'b2n s3n a8n k2n',
  SV: 'b4a a20n',
  ES: 'b4n s4n k2n a10n',
  SE: 'b3n a16n k1n',
  CH: 'b5n a12c',
  TN: 'b2n s3n a13n k2n',
  TR: 'b5n k1c a16c',
  UA: 'b6n a19n',
  GB: UK, IM: UK, GG: UK, JE: UK,
  AE: 'b3n a16c',
  VA: 'b3n a15n',
  VG: 'b4a a16n',
  TL: 'b3n a14n k2n',
  XK: 'b2n s2n a10n k2n',
  IQ: 'b4a s3n a12n',
  CV: 'b4n s4n a13c',
  OM: 'b3n a16c',
  BI: 'b5n s5n a13n',
};

function parse(spec) {
  return spec.split(' ').map((tok) => ({
    field: FIELD_NAMES[tok[0]],
    length: parseInt(tok.slice(1, -1), 10),
    charClass: tok[tok.length - 1],
  }));
}

export const STRUCTURES = {};
for (const code of Object.keys(RAW)) {
  const entries = parse(RAW[code]);
  STRUCTURES[code] = {
    entries,
    bbanLength: entries.reduce((sum, e) => sum + e.length, 0),
  };
}
