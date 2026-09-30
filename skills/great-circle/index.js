// Ported from dcousens/haversine-distance (MIT)
// https://github.com/dcousens/haversine-distance
// Copyright Daniel Cousens. Equatorial mean radius and haversine formula
// follow index.js of that repository. Unit scaling is applied after the
// meter result.

const atan2 = Math.atan2;
const cos = Math.cos;
const sin = Math.sin;
const sqrt = Math.sqrt;
const PI = Math.PI;

// equatorial mean radius of Earth (in meters)
const R = 6378137;

const UNITS = {
  m: 1,
  km: 0.001,
  mi: 1 / 1609.344,
  nmi: 1 / 1852,
  ft: 1 / 0.3048,
};

function squared(x) {
  return x * x;
}

function toRad(x) {
  return (x * PI) / 180.0;
}

function hav(x) {
  return squared(sin(x / 2));
}

function fail(error, message) {
  return { valid: false, error, message };
}

function parsePoint(point, label) {
  if (point == null || (typeof point !== "object" && !Array.isArray(point))) {
    return { error: fail("invalid-input", label + " must be a coordinate object or [longitude, latitude] array") };
  }

  let lat;
  let lon;
  if (Array.isArray(point)) {
    if (point.length < 2) {
      return { error: fail("invalid-input", label + " array must be [longitude, latitude]") };
    }
    lon = point[0];
    lat = point[1];
  } else {
    if (Object.prototype.hasOwnProperty.call(point, "latitude")) lat = point.latitude;
    else if (Object.prototype.hasOwnProperty.call(point, "lat")) lat = point.lat;
    if (Object.prototype.hasOwnProperty.call(point, "longitude")) lon = point.longitude;
    else if (Object.prototype.hasOwnProperty.call(point, "lng")) lon = point.lng;
    else if (Object.prototype.hasOwnProperty.call(point, "lon")) lon = point.lon;
  }

  if (typeof lat !== "number" || typeof lon !== "number" || !Number.isFinite(lat) || !Number.isFinite(lon)) {
    return { error: fail("invalid-input", label + " latitude and longitude must be finite numbers") };
  }
  if (lat < -90 || lat > 90) {
    return { error: fail("invalid-latitude", label + " latitude must be between -90 and 90") };
  }
  if (lon < -180 || lon > 180) {
    return { error: fail("invalid-longitude", label + " longitude must be between -180 and 180") };
  }
  return { lat, lon };
}

// hav(theta) = hav(bLat - aLat) + cos(aLat) * cos(bLat) * hav(bLon - aLon)
function haversineMeters(aLatDeg, aLngDeg, bLatDeg, bLngDeg) {
  const aLat = toRad(aLatDeg);
  const bLat = toRad(bLatDeg);
  const aLng = toRad(aLngDeg);
  const bLng = toRad(bLngDeg);
  const ht = hav(bLat - aLat) + cos(aLat) * cos(bLat) * hav(bLng - aLng);
  return 2 * R * atan2(sqrt(ht), sqrt(1 - ht));
}

export default async function run(input) {
  if (input == null || typeof input !== "object" || Array.isArray(input)) {
    return fail("invalid-input", "input must be an object with from and to");
  }
  if (!Object.prototype.hasOwnProperty.call(input, "from") || !Object.prototype.hasOwnProperty.call(input, "to")) {
    return fail("invalid-input", "from and to are required");
  }

  let unit = "m";
  if (input.unit !== undefined) {
    if (typeof input.unit !== "string") {
      return fail("invalid-unit", "unit must be a string");
    }
    unit = input.unit.trim().toLowerCase();
    if (!Object.prototype.hasOwnProperty.call(UNITS, unit)) {
      return fail("invalid-unit", "unit must be one of m, km, mi, nmi, ft");
    }
  }

  const a = parsePoint(input.from, "from");
  if (a.error) return a.error;
  const b = parsePoint(input.to, "to");
  if (b.error) return b.error;

  const meters = haversineMeters(a.lat, a.lon, b.lat, b.lon);
  if (!Number.isFinite(meters)) {
    return fail("computation-error", "haversine result was not finite");
  }

  return {
    valid: true,
    meters,
    roundedMeters: Math.round(meters),
    distance: meters * UNITS[unit],
    unit,
  };
}
