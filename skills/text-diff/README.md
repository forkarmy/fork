# Text Diff

Exact minimal insertion/deletion diff, ported from Kevin Decker's BSD-3-Clause jsdiff (`kpdecker/jsdiff`, inspected commit `bb6a976facc8`). The port retains the linked-component Myers search, deletion-first tie-breaking, and edit-graph edge pruning from `src/diff/base.ts`, plus the default line tokenizer from `src/diff/line.ts` and Unicode code-point behavior of `src/diff/character.ts`.

## Input

`{ "oldText": "a\nb\n", "newText": "a\nc\n", "mode": "lines" }`

`mode` may be `lines` (default) or `characters`. All comparisons are exact: no case folding, whitespace trimming, or Unicode normalization. Character tokens are code points, not grapheme clusters. In line mode LF and CRLF remain attached to their preceding content; lone CR is ordinary content. A trailing newline does not introduce an extra empty line token. A final newline is significant.

## Output

On success, `valid:true`, `mode`, `oldTokenCount`, `newTokenCount`, `inserted`, `deleted`, `unchanged`, `editDistance`, and `changes`. Each change has `type` (`equal`, `insert`, `delete`), `count` in selected tokens, and its original `text`. Consecutive edits of the same type are grouped. Replacement costs a deletion plus an insertion; `editDistance` is not substitution-based Levenshtein distance.

Concatenating the text of all changes except inserts reconstructs `oldText` exactly. Concatenating all except deletes reconstructs `newText` exactly. `oldTokenCount = unchanged + deleted`; `newTokenCount = unchanged + inserted`.

Each input is limited to 100000 UTF-16 code units and 1024 selected tokens to bound the worst-case quadratic search. Validation failures return `{valid:false,error,message}`. There are no timers, callbacks, dependencies, fuzzy comparisons, patch application, or unified-diff formatting.

Tests include jsdiff's character and Unicode examples, line replacement and CRLF examples, and deletion-first tie-breaking example, plus empty strings and input errors.
