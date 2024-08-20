import { first } from 'lodash-es';
import { describe, expect, it } from 'vitest';

import {
    CHANNEL_REGEX,
    HASHTAG_REGEX,
    MENTION_REGEX,
    SYMBOL_REGEX,
    URL_REGEX,
    URL_SINGLE_REGEX,
} from '@/constants/regexp.js';

describe('MENTION_REGEXP', () => {
    it('should match a mention', () => {
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
    it('should match a hashtag', () => {
        const cases = [
            ['#hello', '#hello'],
            ['hello', null],
            ['hello#', null],
            ['hello #', null],
            ['#hello_world', '#hello_world'],
            ['hello #world', ' #world'],
            ['/frame#dev', null],
            [['This is message', 'with a #hashtag'].join('\n'), ' #hashtag'],
            ['#你好', '#你好'],
            ['This is message, with #你好', ' #你好'],
            ['#h100', '#h100'],
            ['##', null],
            ['#hello#', '#hello'],
            ['#hello#other', '#hello'],
            ['#123', null],
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
    it('should match a url', () => {
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
            [
                `@lens/ris_707 - dance cult\n\nhttps://hey.xyz/posts/0x042e3c-0x01-DA-95038467\n\n#visualsound\n`,
                'https://hey.xyz/posts/0x042e3c-0x01-DA-95038467',
            ],
            [
                'the article can be read here:\nhttps://paragraph.xyz/@nfa/wildcard-reflections',
                'https://paragraph.xyz/@nfa/wildcard-reflections',
            ],
        ] as Array<[string, string | null]>;

        cases.forEach(([input, expectedOutput]) => {
            URL_REGEX.lastIndex = 0;

            const [matched] = input.match(URL_REGEX) ?? [null];
            expect(matched).toBe(expectedOutput);
        });
    });

    it('should match conrrect url', () => {
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
    it('should match a channel handle', () => {
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

describe('SYMBOL_REGEX', () => {
    it('should match a symbol tag', () => {
        const cases = [
            ['$mask', '$mask'],
            ['$;;,', null],
            ['$@#', null],
            ['$123', '$123'], // We can't exclude all-number tags, but they will be handle inside <SymbolTag />
            ['$1inch', '$1inch'],
            [' $1inch', ' $1inch'],
            [' $大牛', ' $大牛'],
        ] as Array<[string, string | null]>;

        cases.forEach(([input, expectedOutput]) => {
            const [matched] = input.match(SYMBOL_REGEX) ?? [null];
            expect(matched).toBe(expectedOutput);
        });
    });
});

describe('URL_SINGLE_REGEX', () => {
    it('should match valid URLs', () => {
        [
            'https://example.com',
            'https://www.example.com',
            'https://example.com:8080',
            'https://example.com/path/to/resource',
            'https://example.com/path/to/resource?query=param',
            'https://example.com/path/to/resource#fragment',
            'https://sub.example.com',
            'https://example.com/path/to/resource?query=param&another=param',
            'https://example.com/path/to/resource#fragment',
            'https://example.com:8080/path?query=param#fragment',
            'https://example.co.uk',
            'https://example.travel',
            'https://example.com/path/to/resource?query=param&key=value',
            'https://example.com/path/to/resource/with/trailing/slash/', // Trailing slash
            'https://example.com/path/to/resource?query=param&key=value&key2=value2', // Multiple query parameters
            'https://example.com/path/to/resource#fragment?query=param', // Fragment before query
        ].forEach((url) => {
            expect(URL_SINGLE_REGEX.test(url)).toBe(true);
        });
    });

    it('should not match invalid URLs', () => {
        [
            ' https://example.com',
            'http://example.com', // Wrong protocol
            'https://example', // Missing TLD
            'https://.com', // Invalid domain
            'https://example.com/path/to/ resource', // Space in path
            'ftp://example.com', // Wrong protocol
            'https://.example.com', // Leading dot in domain
            'https://example..com', // Double dots in domain
            'https://example.com/path/to/ resource?query=param#fragment', // Space in path
            'https://example.c', // Short TLD
            'https://-example.com', // Leading hyphen in domain
            'https://localhost', // Localhost without port
            'https://localhost:3000', // Localhost with port
            'https://localhost/path', // Localhost with path
            'https://localhost/path/to/resource?query=param', // Localhost with path and query
            'https://user:password@example.com', // User info in URL
        ].forEach((url) => {
            expect(URL_SINGLE_REGEX.test(url)).toBe(false);
        });
    });
});
