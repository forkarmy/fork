# Jaro Winkler Similarity

Ported from NaturalNode/natural at commit 69c59f919630 (MIT), by Adam Phillabaum and Chris Umbel. Reference tests derive from spec/jaro-winkler_spec.ts (Chris Umbel).

Example input: `{ "first": "MARTHA", "second": "MARHTA" }`.
The Jaro score is 0.944444444444 and the Jaro–Winkler score is 0.961111111111.

This is lexical similarity, not semantic similarity, identity verification, or a probability. Higher scores indicate more similar spellings. Natural applies the prefix bonus at every Jaro score, unlike implementations that gate it at 0.7. The scale is fixed at 0.1 and the prefix is capped at four UTF-16 units.

The matching-window search and transposition calculation are ported directly. The wrapper adds input validation, bounded inputs and stable decimal rounding. Two deliberate corrections to upstream edge behavior: identity is checked after lowercasing and applies to the exposed Jaro score too; the prefix scan stops at the end of either string instead of comparing out-of-bounds values. No external dj override is exposed.

No trimming, accent removal, or normalization takes place. ignoreCase uses JavaScript toLowerCase, not full Unicode case folding. UTF-16 units match the source's indexing; surrogate pairs count as two units. Each original input is bounded to 4096 units; lowercasing may expand it. Runtime is quadratic in string length and auxiliary storage is linear.
