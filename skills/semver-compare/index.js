// Ported from npm/node-semver (ISC), primarily classes/semver.js,
// internal/identifiers.js, functions/compare.js, functions/cmp.js,
// and the prerelease rule in classes/range.js testSet.

const MAX_LENGTH = 256
const MAX_SAFE_INTEGER = 9007199254740991

const LETTERDASH = '[a-zA-Z0-9-]'

function makeRegex(loose) {
  const numeric = loose ? '\\d+' : '0|[1-9]\\d*'
  const nonNumeric = `\\d*[a-zA-Z-]${LETTERDASH}*`
  const preId = `(?:${nonNumeric}|${numeric})`
  const pre = `(?:-(${preId}(?:\\.${preId})*))`
  const buildId = `${LETTERDASH}+`
  const build = `(?:\\+(${buildId}(?:\\.${buildId})*))`
  const main = `(${numeric})\\.(${numeric})\\.(${numeric})`
  return {
    full: new RegExp(`^v?${main}${pre}?${build}?$`),
    comparator: new RegExp(`^((?:<|>)?=?)\\s*(v?${main}${pre}?${build}?)?$`),
  }
}

const STRICT = makeRegex(false)
const LOOSE = makeRegex(true)

function compareIdentifiers(a, b) {
  const numeric = /^[0-9]+$/
  if (typeof a === 'number' && typeof b === 'number') {
    return a === b ? 0 : a < b ? -1 : 1
  }
  const anum = numeric.test(a)
  const bnum = numeric.test(b)
  if (anum && bnum) {
    a = +a
    b = +b
  }
  if (a === b) return 0
  if (anum && !bnum) return -1
  if (bnum && !anum) return 1
  return a < b ? -1 : 1
}

function invalid(error, message) {
  return { valid: false, error, message }
}

function parseVersion(raw, loose) {
  if (typeof raw !== 'string') {
    return { error: invalid('invalid_version', 'Version must be a string') }
  }
  const trimmed = raw.trim()
  if (trimmed.length > MAX_LENGTH) {
    return { error: invalid('invalid_version', `version is longer than ${MAX_LENGTH} characters`) }
  }
  const re = loose ? LOOSE.full : STRICT.full
  const m = trimmed.match(re)
  if (!m) {
    return { error: invalid('invalid_version', `Invalid Version: ${raw}`) }
  }
  const major = +m[1]
  const minor = +m[2]
  const patch = +m[3]
  if (major > MAX_SAFE_INTEGER || minor > MAX_SAFE_INTEGER || patch > MAX_SAFE_INTEGER) {
    return { error: invalid('invalid_version', 'Invalid version component') }
  }
  let prerelease = []
  if (m[4]) {
    prerelease = m[4].split('.').map((id) => {
      if (/^[0-9]+$/.test(id)) {
        const num = +id
        if (num >= 0 && num < MAX_SAFE_INTEGER) return num
      }
      return id
    })
  }
  const build = m[5] ? m[5].split('.') : []
  let version = `${major}.${minor}.${patch}`
  if (prerelease.length) version += `-${prerelease.join('.')}`
  return {
    parsed: { major, minor, patch, prerelease, build, version, raw: trimmed },
  }
}

function compareMain(a, b) {
  if (a.major !== b.major) return a.major < b.major ? -1 : 1
  if (a.minor !== b.minor) return a.minor < b.minor ? -1 : 1
  if (a.patch !== b.patch) return a.patch < b.patch ? -1 : 1
  return 0
}

function comparePre(a, b) {
  if (a.prerelease.length && !b.prerelease.length) return -1
  if (!a.prerelease.length && b.prerelease.length) return 1
  if (!a.prerelease.length && !b.prerelease.length) return 0
  const n = Math.max(a.prerelease.length, b.prerelease.length)
  for (let i = 0; i < n; i++) {
    const x = a.prerelease[i]
    const y = b.prerelease[i]
    if (x === undefined && y === undefined) return 0
    if (y === undefined) return 1
    if (x === undefined) return -1
    if (x === y) continue
    return compareIdentifiers(x, y)
  }
  return 0
}

function compareParsed(a, b) {
  if (a.version === b.version) return 0
  return compareMain(a, b) || comparePre(a, b)
}

function cmpOp(a, op, b) {
  const c = compareParsed(a, b)
  switch (op) {
    case '':
    case '=':
    case '==':
      return c === 0
    case '!=':
      return c !== 0
    case '>':
      return c > 0
    case '>=':
      return c >= 0
    case '<':
      return c < 0
    case '<=':
      return c <= 0
    default:
      return null
  }
}

function parseComparator(token, loose) {
  const trimmed = token.trim()
  if (trimmed === '') return { any: true, operator: '', semver: null }
  const re = loose ? LOOSE.comparator : STRICT.comparator
  const m = trimmed.match(re)
  if (!m || m[2] === undefined) {
    return { error: invalid('invalid_range', `Invalid comparator: ${token}`) }
  }
  let operator = m[1] || ''
  if (operator === '=') operator = ''
  const parsed = parseVersion(m[2], loose)
  if (parsed.error) {
    return { error: invalid('invalid_range', `Invalid comparator: ${token}`) }
  }
  return { any: false, operator, semver: parsed.parsed }
}

function testSet(set, version, includePrerelease) {
  for (const comp of set) {
    if (comp.any) continue
    const ok = cmpOp(version, comp.operator, comp.semver)
    if (ok === null || !ok) return false
  }
  if (version.prerelease.length && !includePrerelease) {
    for (const comp of set) {
      if (comp.any || !comp.semver.prerelease.length) continue
      const allowed = comp.semver
      if (
        allowed.major === version.major &&
        allowed.minor === version.minor &&
        allowed.patch === version.patch
      ) {
        return true
      }
    }
    return false
  }
  return true
}

function satisfies(version, range, loose, includePrerelease) {
  if (typeof range !== 'string' || range.trim() === '') {
    return { error: invalid('invalid_range', 'Range must be a non-empty string') }
  }
  if (/[~^*xX]| - /.test(range)) {
    return {
      error: invalid(
        'invalid_range',
        'Caret, tilde, x-ranges, and hyphen ranges are not supported'
      ),
    }
  }
  const orParts = range.split('||')
  const sets = []
  for (const part of orParts) {
    const tokens = part.trim().split(/\s+/).filter(Boolean)
    if (tokens.length === 0) {
      sets.push([{ any: true, operator: '', semver: null }])
      continue
    }
    const set = []
    for (const token of tokens) {
      const comp = parseComparator(token, loose)
      if (comp.error) return comp
      set.push(comp)
    }
    sets.push(set)
  }
  for (const set of sets) {
    if (testSet(set, version, includePrerelease)) return { satisfies: true }
  }
  return { satisfies: false }
}

export default async function run(input) {
  if (!input || typeof input !== 'object') {
    return invalid('invalid_input', 'Input must be an object')
  }
  const loose = !!input.loose
  const includePrerelease = !!input.includePrerelease
  const parsed = parseVersion(input.version, loose)
  if (parsed.error) return parsed.error

  const result = {
    valid: true,
    version: parsed.parsed.version,
    major: parsed.parsed.major,
    minor: parsed.parsed.minor,
    patch: parsed.parsed.patch,
    prerelease: parsed.parsed.prerelease,
    build: parsed.parsed.build,
  }

  if (input.other !== undefined) {
    const other = parseVersion(input.other, loose)
    if (other.error) {
      return invalid('invalid_other', other.error.message)
    }
    const cmp = compareParsed(parsed.parsed, other.parsed)
    result.compare = {
      other: other.parsed.version,
      result: cmp,
      relation: cmp === 0 ? 'eq' : cmp > 0 ? 'gt' : 'lt',
    }
  }

  if (input.range !== undefined) {
    const sat = satisfies(parsed.parsed, input.range, loose, includePrerelease)
    if (sat.error) return sat.error
    result.satisfies = sat.satisfies
  }

  return result
}
