/* cspell:disable */

import { FireflyPlatform } from '@/constants/enum.js';
import { CHAR_TAG, type MentionChars } from '@/helpers/chars.js';
import type { Profile } from '@/providers/types/Firefly.js';

export const FIREFLY_TWITTER_PROFILE: Profile = {
    platform_id: '1583361564479889408',
    platform: FireflyPlatform.Twitter,
    handle: 'thefireflyapp',
    name: 'thefireflyapp',
    hit: true,
    score: 0,
};

export const FIREFLY_FARCASTER_PROFILE: Profile = {
    platform_id: '16823',
    platform: FireflyPlatform.Farcaster,
    handle: 'fireflyapp',
    name: 'Firefly App',
    hit: true,
    score: 0,
};

export const FIREFLY_LENS_PROFILE: Profile = {
    platform_id: '0x01b000',
    platform: FireflyPlatform.Lens,
    handle: 'fireflyapp',
    name: 'fireflyapp',
    hit: true,
    score: 0,
};

export const FIREFLY_MENTION = {
    tag: CHAR_TAG.MENTION,
    visible: true,
    content: `@thefireflyapp`,
    profiles: [FIREFLY_TWITTER_PROFILE, FIREFLY_FARCASTER_PROFILE, FIREFLY_LENS_PROFILE],
} satisfies MentionChars;

export const BRIAN_TWITTER_PROFILE: Profile = {
    platform_id: '14379660',
    platform: FireflyPlatform.Twitter,
    handle: 'brian_armstrong',
    name: 'brian_armstrong',
    hit: true,
    score: 0.062500186,
};

export const BRIAN_FARCASTER_PROFILE: Profile = {
    platform_id: '20',
    platform: FireflyPlatform.Farcaster,
    handle: 'barmstrong',
    name: 'Brian Armstrong',
    hit: false,
    score: 0,
};

export const BRIAN_LENS_PROFILE: Profile = {
    platform_id: '0x01d86b',
    platform: FireflyPlatform.Lens,
    handle: 'brian',
    name: 'brian',
    hit: false,
    score: 0,
};

export const BARMSTRONG_MENTION = {
    tag: CHAR_TAG.MENTION,
    visible: true,
    content: '@brian_armstrong',
    profiles: [BRIAN_LENS_PROFILE, BRIAN_FARCASTER_PROFILE, BRIAN_TWITTER_PROFILE],
} satisfies MentionChars;

export const PUDGY_PENGUINS_TWITTER_PROFILE: Profile = {
    platform_id: '1415078650039443456',
    platform: FireflyPlatform.Twitter,
    handle: 'pudgypenguins',
    name: 'pudgypenguins',
    hit: true,
    score: 0.07142878,
};

export const PUDGY_PENGUINS_MENTION = {
    tag: CHAR_TAG.MENTION,
    visible: true,
    content: '@pudgypenguins',
    profiles: [PUDGY_PENGUINS_TWITTER_PROFILE],
} satisfies MentionChars;
