// Ported from beatgammit/base64-js (MIT) by Kirill Fomichev, T. Jameson Little and contributors.
const code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
const rev = {}
for (let i = 0; i < 64; i++) rev[code[i]] = i
rev['-'] = 62; rev['_'] = 63

function fromByteArray (u8) {
  let out = ''
  const len = u8.length, extra = len % 3
  for (let i = 0; i < len - extra; i += 3) {
    const t = (u8[i] << 16) | (u8[i + 1] << 8) | u8[i + 2]
    out += code[t >> 18 & 63] + code[t >> 12 & 63] + code[t >> 6 & 63] + code[t & 63]
  }
  if (extra === 1) {
    const t = u8[len - 1]
    out += code[t >> 2] + code[(t << 4) & 63] + '=='
  } else if (extra === 2) {
    const t = (u8[len - 2] << 8) + u8[len - 1]
    out += code[t >> 10] + code[(t >> 4) & 63] + code[(t << 2) & 63] + '='
  }
  return out
}

function toByteArray (s) {
  const bytes = []
  for (let i = 0; i < s.length; i += 4) {
    const a = rev[s[i]], b = rev[s[i + 1]]
    const c = s[i + 2] === '=' ? 0 : rev[s[i + 2]]
    const d = s[i + 3] === '=' ? 0 : rev[s[i + 3]]
    const t = (a << 18) | (b << 12) | (c << 6) | d
    bytes.push((t >> 16) & 255)
    if (s[i + 2] !== '=') bytes.push((t >> 8) & 255)
    if (s[i + 3] !== '=') bytes.push(t & 255)
  }
  return Uint8Array.from(bytes)
}

const err = (error, message) => ({ valid: false, error, message })

export default async function run (input) {
  const inp = input || {}
  const op = inp.operation || 'encode'
  const urlSafe = !!inp.urlSafe
  if (op === 'encode') {
    let bytes
    if (typeof inp.hex === 'string') {
      const h = inp.hex.replace(/\s+/g, '')
      if (h.length % 2 || /[^0-9a-fA-F]/.test(h)) return err('INVALID_HEX', 'hex must be an even number of hex digits')
      bytes = Uint8Array.from(Buffer.from(h, 'hex'))
    } else if (typeof inp.text === 'string') {
      if (inp.text.length > 100000) return err('TOO_LONG', 'input limited to 100000 characters')
      bytes = new TextEncoder().encode(inp.text)
    } else return err('MISSING_INPUT', 'encode needs text or hex')
    let enc = fromByteArray(bytes)
    if (urlSafe) enc = enc.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    return { valid: true, operation: 'encode', encoded: enc, hex: Buffer.from(bytes).toString('hex'), byteLength: bytes.length }
  }
  if (op !== 'decode') return err('INVALID_OPERATION', 'operation must be encode or decode')
  if (typeof inp.encoded !== 'string') return err('MISSING_INPUT', 'decode needs encoded')
  if (inp.encoded.length > 140000) return err('TOO_LONG', 'input limited to 140000 characters')
  let s = inp.encoded.replace(/\s+/g, '')
  if (!/^[A-Za-z0-9+/\-_]*={0,2}$/.test(s)) return err('INVALID_CHARACTER', 'input contains characters outside the Base64 alphabets or misplaced padding')
  if (s.includes('=')) {
    if (s.length % 4) return err('INVALID_PADDING', 'padded input length must be a multiple of 4')
  } else {
    if (s.length % 4 === 1) return err('INVALID_LENGTH', 'input length cannot be 1 more than a multiple of 4')
    s += '='.repeat((4 - s.length % 4) % 4)
  }
  const bytes = toByteArray(s)
  let text = null
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes) } catch (e) { text = null }
  return { valid: true, operation: 'decode', encoded: fromByteArray(bytes), text, hex: Buffer.from(bytes).toString('hex'), byteLength: bytes.length }
}
