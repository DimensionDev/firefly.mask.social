import { describe, expect, test } from 'vitest';

import { isTopLevelDomain } from '@/helpers/isTopLevelDomain.js';

describe('isTopLevelDomain', () => {
    test('should correctly check TLD domain', () => {
        const cases = [
            ['https://paragraph.xyz/@nfa/wildcard-reflections', true],
            ['https://frames.cooprecords.xyz/generate/v2/NOTION/TVDREAMS', true],
            ['https://goodbread.nyc', true],
            ['https://unlonely.app/channels/cameron', true],
            ['https://hypersub.withfabric.xyz/collection/terminally-onchain-5457470x7uo0', true],
            ['https://frame.weponder.io/api/polls/4622', true],
            [
                'https://moshi.cam/pics/0xed3ff4549f7c74e3e70aae6858a8cd58882c28fc/54/2jQniD0F9ItlUjwbhjGytUKiRcg?bg=dark',
                true,
            ],
            ['nottoobad.eth', false],
            ['nottoobad.eth/1/posts', true],
        ] as Array<[string, boolean]>;

        cases.forEach(([input, expected]) => {
            const result = isTopLevelDomain(input);

            expect(result).toBe(expected);
        });
    });
});
