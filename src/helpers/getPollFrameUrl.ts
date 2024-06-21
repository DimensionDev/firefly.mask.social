import urlcat from 'urlcat';

import { type SocialSource } from '@/constants/enum.js';
import { FRAME_SERVER_URL } from '@/constants/index.js';
import { getCurrentProfile } from '@/helpers/getCurrentProfile.js';
import { getLocaleFromCookies } from '@/helpers/getLocaleFromCookies.js';
import { getMeaningfulThemeMode } from '@/helpers/getMeaningfulThemeMode.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { parseURL } from '@/helpers/parseURL.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

const getPollFrameSearchParams = (source: SocialSource) => {
    const profile = getCurrentProfile(source);
    return {
        source: source.toLowerCase(),
        profileId: profile?.profileId ?? null,
        theme: getMeaningfulThemeMode(),
        locale: getLocaleFromCookies(),
        date: Date.now(), // force refresh poll frame
    };
};

export const composePollFrameUrl = (url: string, source: SocialSource) => {
    const parsed = parseURL(url);
    if (!parsed) return url;
    Object.entries(getPollFrameSearchParams(source)).forEach(([key, value]) => {
        if (value) parsed.searchParams.set(key, `${value}`);
    });
    return parsed.toString();
};

export function getPollFrameUrl(pollId: string, source?: SocialSource, author?: Profile) {
    const profile = author ? author : source ? getCurrentProfile(source) : null;

    return urlcat(FRAME_SERVER_URL, `/polls/${pollId}`, {
        author: profile ? getProfileUrl(profile) : null,
        source: source?.toLowerCase(),
    });
}
