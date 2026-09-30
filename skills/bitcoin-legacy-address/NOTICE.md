# Sources and scope

Address payload validation and network version mapping are ported from bitcoinjs/bitcoinjs-lib (commit ab9fad5978bc), ts_src/address.ts and ts_src/networks.ts. Fixtures come from test/fixtures/address.json.

Checksum verification is ported from bitcoinjs/bs58check (commit c96eb30a5970), src/esm/base.js and src/esm/index.js. Node's built-in SHA-256 replaces @noble/hashes, and bounded native BigInt base conversion replaces the bs58 dependency.

Only legacy Bitcoin P2PKH and P2SH are supported. Network labels describe compatibility with Bitcoin version bytes, not unique chain identification. P2SH does not reveal the underlying redeem script. No ownership, balances, transaction activity, price forecasts, or safety guarantees are inferred.

## MIT notices (both sources)

Copyright (c) 2011-2025 bitcoinjs-lib contributors

Copyright (c) 2017 Daniel Cousens

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
