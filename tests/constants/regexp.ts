import { first } from 'lodash-es';
import { describe, expect, test } from 'vitest';

import { HASHTAG_REGEX, MENTION_REGEX, URL_REGEX } from '@/constants/regex.js';

describe('MENTION_REGEXP', () => {
    test('should match a mention', () => {
        const cases = [
            ['@handle', true],
            ['handle', false],
            ['handle@', false],
            ['handle @', false],
            ['@handle_name', true],
            ['handle @name', true],
            ['@handle.lens', true],
            ['@lens/handle', true],
            ['@club/handle', true],
            [['This is message', 'with a @mention'].join('\n'), true],
        ] as Array<[string, boolean]>;

        cases.forEach(([input, expectedOutput]) => {
            // reset the regex
            MENTION_REGEX.lastIndex = 0;

            const result = MENTION_REGEX.test(input);
            expect(result).toBe(expectedOutput);
        });
    });
});

describe('HASHTAG_REGEXP', () => {
    test('should match a hashtag', () => {
        const cases = [
            ['#hello', true],
            ['hello', false],
            ['hello#', false],
            ['hello #', false],
            ['#hello_world', true],
            ['hello #world', true],
            [['This is message', 'with a #hashtag'].join('\n'), true],
        ] as Array<[string, boolean]>;

        cases.forEach(([input, expectedOutput]) => {
            // reset the regex
            HASHTAG_REGEX.lastIndex = 0;

            const result = HASHTAG_REGEX.test(input);
            expect(result).toBe(expectedOutput);
        });
    });
});

describe('URL_REGEX', () => {
    test('should match a url', () => {
        const cases = [
            [
                `
                    I almost never re-read any of my own writing

                    But there's one exception: this "Part Time Degen" essay
            
                    TLDR I tried to capture all my pain, seethe, mistakes & cope from the last crypto cycle in one spot
            
                    Check it out 👇 https://benroy.beehiiv.com/p/parttime-degen-notes-speculation-crypto-markets-20192022
                `,
                true,
            ],
            [
                `
                    hat matures, we're excited about supporting efforts to enshrine account abstraction into the protocol itself (e.g. 3074) — we prefer
                `,
                false,
            ],
            [
                `
                    {
                        "p": "XRC20",
                        "op": "deploy",
                        "tick": "𝐅",
                        "max": "21000000",
                        "lim": "2000"
                    }
                    app.twitscription.xyz/tokens?v=2&mint=𝐅
                    🌔🍰📂😇🚑
                    https://frames.twitscription.xyz                
                `,
                true,
            ],
            [
                `
                    Geth v1.13.14 out, featuring minor blob pool polishes and the reduction of the blob pool capacity from 10GB to 2.5GB to avoid unexpected surprises during/after the Cancun fork.
                `,
                false,
            ],
            [
                `Update not critical, but recommended. https://github.com/ethereum/go-ethereum/releases/tag/v1.13.14`,
                true,
            ],
        ] as Array<[string, boolean]>;

        cases.forEach(([input, expectedOutput]) => {
            URL_REGEX.lastIndex = 0;

            const result = URL_REGEX.test(input);
            expect(result).toBe(expectedOutput);
        });
    });

    test('Should match conrrect url', () => {
        const cases = [
            [
                `
                    I almost never re-read any of my own writing

                    But there's one exception: this "Part Time Degen" essay
            
                    TLDR I tried to capture all my pain, seethe, mistakes & cope from the last crypto cycle in one spot
            
                    Check it out 👇 https://benroy.beehiiv.com/p/parttime-degen-notes-speculation-crypto-markets-20192022
                `,
                'https://benroy.beehiiv.com/p/parttime-degen-notes-speculation-crypto-markets-20192022',
            ],
            [
                `
                    {
                        "p": "XRC20",
                        "op": "deploy",
                        "tick": "𝐅",
                        "max": "21000000",
                        "lim": "2000"
                    }
                    app.twitscription.xyz/tokens?v=2&mint=𝐅
                    🌔🍰📂😇🚑
                    https://frames.twitscription.xyz                
                `,
                'app.twitscription.xyz/tokens?v=2&mint=𝐅',
            ],
            [
                `Update not critical, but recommended. https://github.com/ethereum/go-ethereum/releases/tag/v1.13.14`,
                'https://github.com/ethereum/go-ethereum/releases/tag/v1.13.14',
            ],
        ];

        cases.forEach(([input, expectedOutput]) => {
            URL_REGEX.lastIndex = 0;

            const result = first(input.match(URL_REGEX) || []);
            expect(result).toBe(expectedOutput);
        });
    });
});
