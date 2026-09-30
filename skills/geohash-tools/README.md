# Geohash Tools

Encode: `{ "operation": "encode", "latitude": 57.648, "longitude": 10.410, "precision": 6 }` gives geohash `u4pruy`.

Decode: `{ "operation": "decode", "geohash": "u4pruy" }` gives center `{ "lat": 57.648, "lon": 10.41 }`, exact degree bounds, and eight neighbors keyed `n`, `ne`, `e`, `se`, `s`, `sw`, `w`, `nw`.

Both operations return the same shape: `valid`, `geohash`, `precision`, `center`, `bounds` (with `sw` and `ne` coordinates), and `neighbors`. Invalid input returns `{valid:false,error:"INVALID_INPUT",message:...}`.

Precision defaults to 9 for encoding and is limited to 1–12 characters. Latitude/longitude must be finite numbers in [-90,90] and [-180,180]. Midpoint ties choose the northern/eastern half. Longitude +180 stays at the eastern edge rather than normalizing to -180. Decode trims surrounding whitespace and accepts uppercase, but does not accept internal spaces or non-geohash base32 letters.

The center follows the source library: each axis is rounded to floor(2 - log10(cell span in degrees)) decimal places. For a one-character cell `s`, the exact midpoint is (22.5,22.5), but the returned rounded center is (23,23). Compute `(bounds.sw.lat + bounds.ne.lat)/2` and its longitude equivalent for an exact midpoint.

Neighbors preserve the source's rectangular grid wrap, including across the antimeridian and across the top/bottom rows. Polar wrapping is a grid convention, not a geographically continuous journey over a pole.

Ported from Chris Veness's MIT-licensed `chrisveness/latlon-geohash`, `latlon-geohash.js` (2014–2019). Source test vectors cover Jutland, Curitiba, prefix-crossing neighbors, and a 12-character geohash.org/PostGIS reference. This adapter adds strict validation and a fixed default precision instead of the source's inferred precision.
