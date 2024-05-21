import { first } from 'lodash-es';
import { describe, expect, test } from 'vitest';

import { CHANNEL_REGEX, HASHTAG_REGEX, MENTION_REGEX, URL_REGEX } from '@/constants/regexp.js';

describe('MENTION_REGEXP', () => {
    test('should match a mention', () => {
        const cases = [
            ['@handle', '@handle'],
            ['handle', null],
            ['handle@', null],
            ['handle @', null],
            ['@handle_name', '@handle_name'],
            ['handle @name', '@name'],
            ['@handle.lens', '@handle.lens'],
            ['@lens/handle', '@lens/handle'],
            ['@club/handle', '@club/handle'],
            ['@yup_io', '@yup_io'],
            [['This is message', 'with a @mention'].join('\n'), '@mention'],
        ] as Array<[string, string | null]>;

        cases.forEach(([input, expectedOutput]) => {
            // reset the regex
            MENTION_REGEX.lastIndex = 0;

            const [matched] = input.match(MENTION_REGEX) ?? [null];
            expect(matched).toBe(expectedOutput);
        });
    });
});

describe('HASHTAG_REGEXP', () => {
    test('should match a hashtag', () => {
        const cases = [
            ['#hello', '#hello'],
            ['hello', null],
            ['hello#', null],
            ['hello #', null],
            ['#hello_world', '#hello_world'],
            ['hello #world', ' #world'],
            ['/frame#dev', null],
            [['This is message', 'with a #hashtag'].join('\n'), ' #hashtag'],
        ] as Array<[string, string | null]>;

        cases.forEach(([input, expectedOutput]) => {
            // reset the regex
            HASHTAG_REGEX.lastIndex = 0;

            const [matched] = input.match(HASHTAG_REGEX) ?? [null];
            expect(matched).toBe(expectedOutput);
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
                'https://benroy.beehiiv.com/p/parttime-degen-notes-speculation-crypto-markets-20192022',
            ],
            [
                `
                    hat matures, we're excited about supporting efforts to enshrine account abstraction into the protocol itself (e.g. 3074) — we prefer
                `,
                null,
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
                `
                    Geth v1.13.14 out, featuring minor blob pool polishes and the reduction of the blob pool capacity from 10GB to 2.5GB to avoid unexpected surprises during/after the Cancun fork.
                `,
                null,
            ],
            [
                'Update not critical, but recommended. https://github.com/ethereum/go-ethereum/releases/tag/v1.13.14',
                'https://github.com/ethereum/go-ethereum/releases/tag/v1.13.14',
            ],
        ] as Array<[string, string | null]>;

        cases.forEach(([input, expectedOutput]) => {
            URL_REGEX.lastIndex = 0;

            const [matched] = input.match(URL_REGEX) ?? [null];
            expect(matched).toBe(expectedOutput);
        });
    });

    test('Should match conrrect url', () => {
        const cases = [
            [
                `
                    I almost never re-read any of my own writing

                    But there's one exception: this "Part Time Degen" essay
            
                    TLDR I tried to capture all my pain, seethe, mistakes & cope from the last crypto cycle in one spot
            
                    Check it out 👇 https://benroy.beehiiv.com/p/parttime-degen-notes-speculation-crypto-markets-20192022 some text after link
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
            [
                `jesse just called this the most consequential consumer web3 product in last five years. 

                "- fully non-custodial
                - fully open source (http://github.com/coinbase/smart-wallet)
                - supporting best-in-class standards (e.g. 4337)"
                
                thank u @wilsoncusack`,
                'http://github.com/coinbase/smart-wallet',
            ],
            [
                `This is a post made with firefly.mask.social/, which posts to farcaster and lens at the same time.

                Alternative clients are important, we should support them!`,
                'firefly.mask.social/',
            ],
        ];

        cases.forEach(([input, expectedOutput]) => {
            URL_REGEX.lastIndex = 0;

            const result = first(input.match(URL_REGEX) || []);
            expect(result).toBe(expectedOutput);
        });
    });
});

describe('CHANNEL_REGEX', () => {
    test('should match a channel handle', () => {
        const cases = [
            ['/Bitcoin', null],
            ['/BitCoin', null],
            ['/bitCoin', null],
            ['/bitcoin', '/bitcoin'],
            ['/bitcoin2', '/bitcoin2'],
            ['/bitcoin/2', null],
            ['prefix /bitcoin suffix', ' /bitcoin'],
            ['prefix/bitcoin suffix', null],
            ['prefix /bitcoinMASK', null],
            ['prefix /bitcoin面具', ' /bitcoin'],
            ['prefix /bitcoin🎭', ' /bitcoin'],
            ['/firefly-garden', '/firefly-garden'],
            ['/firefly-garden2', '/firefly-garden2'],
            ['/2024', '/2024'],
            ['/2024-bitcoin', '/2024-bitcoin'],
            ['/2024a', '/2024a'],
            ['/2024MASK', null],
            ['/2024面具', '/2024'],
            ['/2024🎭', '/2024'],
            ['/2024/05', null],
            ['/2024/05/05', null],
            ['/2024-05-05', '/2024-05-05'],
        ] as Array<[string, string | null]>;

        cases.forEach(([input, expectedOutput]) => {
            CHANNEL_REGEX.lastIndex = 0;
            const [matched] = input.match(CHANNEL_REGEX) ?? [null];
            expect(matched).toBe(expectedOutput);
        });
    });
});
