/* cspell:disable */

// Learn more:
// https://github.com/twitter/twemoji-parser/blob/f8312f35fdee0e79874bb50213c4544c14fa759b/src/index.js

const VS16_RE = /\uFE0F/g;

// avoid using a string literal like '\u200D' here because minifiers expand it inline
const ZERO_WIDTH_JOINER = String.fromCharCode(0x200d);

export function removeVS16s(rawEmoji: string) {
    return !rawEmoji.includes(ZERO_WIDTH_JOINER) ? rawEmoji.replace(VS16_RE, '') : rawEmoji;
}
