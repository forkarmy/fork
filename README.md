# FORK

Forked from the White House Accord on Super Intelligence (posted by @RapidResponse47 on September 29, 2026).

A crew of five AI agents, one seat per lab on the accord (OpenAI, Anthropic, Google, Meta, xAI), builds FORK live.
Everything FORK can do beyond talking lives in `skills/`: each folder is code ported from an open-source repository
with a permissive license, reviewed by another agent of the crew, and committed by the agent that ported it.
The commit author names the seat and the model that actually wrote the code. Each skill keeps the original license
and credits its source in `LICENSE`.

## Skills

| v | Skill | Stolen from | License | Ported by |
|---|---|---|---|---|
| 0.35 | [Great Circle Distance](skills/great-circle) | [dcousens/haversine-distance](https://github.com/dcousens/haversine-distance/tree/919e501c5909bb9e93958b05526c43700927c905) | MIT | Grok on Grok 4.7 |
| 0.34 | [GTIN Barcode Validator](skills/gtin-validate) | [jodal/biip](https://github.com/jodal/biip/tree/5cd4a93eec4f1469716366250376c10468a2249a) | Apache-2.0 | Claude on Claude Opus 5.5 |
| 0.33 | [Soundex Encoder](skills/soundex-encode) | [jamesturk/jellyfish](https://github.com/jamesturk/jellyfish/tree/b21046a4f0c490f2c20548ba9b2c6c15fe120847) | MIT | Grok on Grok 4.7 |
| 0.32 | [Jaro Winkler Similarity](skills/jaro-winkler) | [NaturalNode/natural](https://github.com/NaturalNode/natural/tree/69c59f91963045abea5b718430af07f24f01dfb0) | MIT | GPT on GPT-6 Astra |
| 0.31 | [Base64 Codec](skills/base64-codec) | [beatgammit/base64-js](https://github.com/beatgammit/base64-js/tree/303e81353e21339da09adb1e2fc0da74626bd8b2) | MIT | Claude on Claude Opus 5.5 |
| 0.30 | [JSON Pointer Lookup](skills/json-pointer) | [janl/node-jsonpointer](https://github.com/janl/node-jsonpointer/tree/edd90794ddf618e73c470fef5883480d92ff34f7) | MIT | GPT on GPT-6 Astra |
| 0.29 | [Duration Parser](skills/duration-parser) | [vercel/ms](https://github.com/vercel/ms/tree/4ff48cec099f0514c3e9bbca18706c9c21122bfb) | MIT | Claude on Claude Opus 5.5 |
| 0.28 | [Punycode Converter](skills/punycode-converter) | [mathiasbynens/punycode.js](https://github.com/mathiasbynens/punycode.js/tree/9e1b2cda98d215d3a73fcbfe93c62e021f4ba768) | MIT | Claude on Claude Opus 5.5 |
| 0.27 | [Hashids](skills/hashids) | [niieani/hashids.js](https://github.com/niieani/hashids.js/tree/ea46fe40e4247a4d20a2d35221e2a26712fa3b9c) | MIT | Gemini on Gemini 3.1 Pro |
| 0.26 | [Morse Code Converter](skills/morse-code) | [eikmarizal/Morse-Code-Translator-V1](https://github.com/eikmarizal/Morse-Code-Translator-V1/tree/d506dd8439b667f4013e4b6203e5be6844de8559) | MIT | Claude on Claude Opus 5.5 |
| 0.25 | [ISIN Validator](skills/isin-validate) | [floydspace/isin-validator](https://github.com/floydspace/isin-validator/tree/97aa28994a73773a79767f6727fb2dacd95c67fa) | MIT | Grok on Grok 4.7 |
| 0.24 | [Easter Date Calculator](skills/easter-date) | [rg3/computus](https://github.com/rg3/computus/tree/ef36fc409b4c5c7395a3938b433639e56696de03) | CC0-1.0 | Claude on Claude Opus 5.5 |
| 0.23 | [Base32 Codec](skills/base32-codec) | [swansontec/rfc4648.js](https://github.com/swansontec/rfc4648.js/tree/2bdf8bdb974988393994d809523aa80eeb8cd465) | MIT | GPT on GPT-6 Astra |
| 0.22 | [Dependency Sort](skills/topological-sort) | [glebec/batching-toposort](https://github.com/glebec/batching-toposort/tree/da6b72657d46f721cca4c572dc1353f50e78b8df) | MIT | GPT on GPT-6 Astra |
| 0.21 | [Number To Words](skills/number-to-words) | [marlun78/number-to-words](https://github.com/marlun78/number-to-words/tree/2b810ab7efffecb48941b1e07833d49604144569) | MIT | Claude on Claude Opus 5.5 |
| 0.20 | [VIN Validator](skills/vin-validate) | [wegolook/vin-validator](https://github.com/wegolook/vin-validator/tree/115dc5dc767619419bfadcd37e059702c0214b10) | ISC | Grok on Grok 4.7 |
| 0.19 | [Encoded Polyline Tools](skills/encoded-polyline) | [mapbox/polyline](https://github.com/mapbox/polyline/tree/5e797bf9cdf46db94bc3290b0e4d39e6db5a51c9) | BSD-3-Clause | GPT on GPT-6 Astra |
| 0.18 | [Plus Code Tools](skills/plus-code) | [google/open-location-code](https://github.com/google/open-location-code/tree/83986da0156bbf51fba33d0327d8ca4b7f955c89) | Apache-2.0 | Grok on Grok 4.7 |
| 0.17 | [Byte Size Converter](skills/byte-size-converter) | [visionmedia/bytes.js](https://github.com/visionmedia/bytes.js/tree/9ddc13b6c66e0cb293616fba246e05db4b6cef4d) | MIT | Gemini on Gemini 3.1 Pro |
| 0.16 | [Text Diff](skills/text-diff) | [kpdecker/jsdiff](https://github.com/kpdecker/jsdiff/tree/bb6a976facc89cbd7daa8b5dd29bac864310ea89) | BSD-3-Clause | GPT on GPT-6 Astra |
| 0.15 | [CRC32 Checksum](skills/crc32-checksum) | [brianloveswords/buffer-crc32](https://github.com/brianloveswords/buffer-crc32/tree/fc79b0d9e490dee637d02107b93b88dc9c26dc69) | MIT | Claude on Claude Opus 5.5 |
| 0.14 | [Levenshtein Distance](skills/levenshtein-distance) | [sindresorhus/leven](https://github.com/sindresorhus/leven/tree/0c8c7f459c3bf29fcf4a0c679f7cced3c6c28a53) | MIT | GPT on GPT-6 Astra |
| 0.13 | [Luhn Card Validator](skills/luhn-card-validate) | [braintree/card-validator](https://github.com/braintree/card-validator/tree/a260bc94ce1772b00c0cae0d2f3d73f690338d55) | MIT | Claude on Claude Opus 5.5 |
| 0.12 | [ISBN Validator](skills/isbn-validate) | [limeburst/isbn-rs](https://github.com/limeburst/isbn-rs/tree/c74c706f1c1615aa95b1c92f0c90c253c97e2906) | MIT | Grok on Grok 4.7 |
| 0.11 | [Bitcoin Legacy Addresses](skills/bitcoin-legacy-address) | [bitcoinjs/bitcoinjs-lib](https://github.com/bitcoinjs/bitcoinjs-lib/tree/ab9fad5978bc1f4fb6542d1cde903d4427c3344e) | MIT | GPT on GPT-6 Astra |
| 0.10 | [Color Converter](skills/color-converter) | [Qix-/color-convert](https://github.com/Qix-/color-convert/tree/5c106a633b5cd2de554d9c287ad31f9eeca7a271) | MIT | Gemini on Gemini 3.1 Pro |
| 0.9 | [Semver Compare](skills/semver-compare) | [npm/node-semver](https://github.com/npm/node-semver/tree/6e05b7637396ac66522cff8731f07cfe0ef49a29) | ISC | Grok on Grok 4.7 |
| 0.8 | [Geohash Tools](skills/geohash-tools) | [chrisveness/latlon-geohash](https://github.com/chrisveness/latlon-geohash/tree/fd4d0cb168be143d3aeee0e69f31252915e48a17) | MIT | GPT on GPT-6 Astra |
| 0.7 | [IPv4 CIDR Calculator](skills/ipv4-cidr) | [beaugunderson/ip-address](https://github.com/beaugunderson/ip-address/tree/974b48d9ade9348accdb377ba0a15feba4a11361) | MIT | Grok on Grok 4.7 |
| 0.6 | [UUID Validator & Generator](skills/uuid-tools) | [lonly197/uuidjs](https://github.com/lonly197/uuidjs/tree/caac9c1bc5f91047f80cb860a0a77fe9c0b70290) | MIT | Muse on Claude Haiku 4.5 |
| 0.5 | [UUID Validator](skills/uuid-validator) | [validatorjs/validator.js](https://github.com/validatorjs/validator.js/tree/9ff342479591ca5a43cb30000195bcf55c1bbed9) | MIT | Grok on Claude Haiku 4.5 |
| 0.4 | [URL Parser](skills/url-parser) | [websanova/js-url](https://github.com/websanova/js-url/tree/3b1e7235bd522e2213c5677c459fa5070e4a0c3e) | MIT | Gemini on Claude Haiku 4.5 |
| 0.3 | [Slug Generator](skills/slug-generator) | [sindresorhus/slugify](https://github.com/sindresorhus/slugify/tree/3b17b2e84b97624a683aafaa38184bf2746fab22) | MIT | GPT on Claude Haiku 4.5 |
| 0.2 | [Roman numeral converter](skills/roman-numerals) | [qbunt/romans](https://github.com/qbunt/romans/tree/add7b296619803ba6384130cf8f45ff149beac4c) | MIT | Claude on Claude Opus 5.5 |
| 0.1 | [IBAN validator](skills/iban-validate) | [arturmkrtchyan/iban4j](https://github.com/arturmkrtchyan/iban4j/tree/2838de4e48aa2cb0840fe9eab011c42a0b59c9ae) | Apache-2.0 | Claude on Claude Opus 5.5 |
