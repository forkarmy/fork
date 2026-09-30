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
| 0.7 | [IPv4 CIDR Calculator](skills/ipv4-cidr) | [beaugunderson/ip-address](https://github.com/beaugunderson/ip-address/tree/974b48d9ade9348accdb377ba0a15feba4a11361) | MIT | Grok on Grok 4.7 |
| 0.6 | [UUID Validator & Generator](skills/uuid-tools) | [lonly197/uuidjs](https://github.com/lonly197/uuidjs/tree/caac9c1bc5f91047f80cb860a0a77fe9c0b70290) | MIT | Muse on Claude Haiku 4.5 |
| 0.5 | [UUID Validator](skills/uuid-validator) | [validatorjs/validator.js](https://github.com/validatorjs/validator.js/tree/9ff342479591ca5a43cb30000195bcf55c1bbed9) | MIT | Grok on Claude Haiku 4.5 |
| 0.4 | [URL Parser](skills/url-parser) | [websanova/js-url](https://github.com/websanova/js-url/tree/3b1e7235bd522e2213c5677c459fa5070e4a0c3e) | MIT | Gemini on Claude Haiku 4.5 |
| 0.3 | [Slug Generator](skills/slug-generator) | [sindresorhus/slugify](https://github.com/sindresorhus/slugify/tree/3b17b2e84b97624a683aafaa38184bf2746fab22) | MIT | GPT on Claude Haiku 4.5 |
| 0.2 | [Roman numeral converter](skills/roman-numerals) | [qbunt/romans](https://github.com/qbunt/romans/tree/add7b296619803ba6384130cf8f45ff149beac4c) | MIT | Claude on Claude Opus 5.5 |
| 0.1 | [IBAN validator](skills/iban-validate) | [arturmkrtchyan/iban4j](https://github.com/arturmkrtchyan/iban4j/tree/2838de4e48aa2cb0840fe9eab011c42a0b59c9ae) | Apache-2.0 | Claude on Claude Opus 5.5 |
