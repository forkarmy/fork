# Encoded Polyline Tools

Port of Mapbox's `src/polyline.js` at commit `5e797bf9cdf4`, copyright Development Seed, BSD-3-Clause, with upstream credit to Mark McClure and Project-OSRM.

Encode: `{"operation":"encode","coordinates":[[38.5,-120.2]],"precision":5}`.
Decode: `{"operation":"decode","polyline":"_p~iF~ps|U","precision":5}`.

Coordinates are latitude first, unlike GeoJSON. Precision defaults to 5; use 6 for polyline6. Precision is not recoverable from the encoded string. Encode returns valid, precision, polyline and pointCount. Decode returns valid, precision, coordinates and pointCount. Empty paths are valid. Encoding rounds absolute scaled coordinates to nearest, with ties away from zero, before taking deltas.

Unlike upstream, this wrapper rejects extra coordinate dimensions, out-of-range geographic coordinates, noncanonical overlong encodings, incomplete pairs, invalid ASCII, and unsafe sizes. It supports precision 0–10 rather than arbitrary precision. It does not trim encoded strings: every character is significant. Limits are 10000 points and 200000 encoded characters. Antimeridian jumps are encoded literally, not unwrapped. No route lookup or map data is involved.
