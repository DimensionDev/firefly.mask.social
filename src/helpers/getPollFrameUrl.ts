import urlcat from 'urlcat';

import { type SocialSource } from '@/constants/enum.js';
import { getCurrentProfile } from '@/helpers/getCurrentProfile.js';
import { getLocaleFromCookiesAsync } from '@/helpers/getFromCookies.js';
import { getMeaningfulThemeMode } from '@/helpers/getMeaningfulThemeMode.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { parseUrl } from '@/helpers/parseUrl.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { settings } from '@/settings/index.js';

const getPollFrameSearchParams = async (source: SocialSource) => {
    const profile = getCurrentProfile(source);
    return {
        source: source.toLowerCase(),
        profileId: profile?.profileId ?? null,
        theme: getMeaningfulThemeMode(),
        locale: await getLocaleFromCookiesAsync(),
        date: Date.now(), // force refresh poll frame
    };
};

export const composePollFrameUrl = async (url: string, source: SocialSource) => {
    const parsed = parseUrl(url);
    if (!parsed) return url;
    Object.entries(await getPollFrameSearchParams(source)).forEach(([key, value]) => {
        if (value) parsed.searchParams.set(key, `${value}`);
    });
    return parsed.toString();
};

export function getPollFrameUrl(pollId: string, source?: SocialSource, author?: Profile) {
    const profile = author ? author : source ? getCurrentProfile(source) : null;

    return urlcat(settings.FRAME_SERVER_URL, `/polls/${pollId}`, {
        author: profile ? getProfileUrl(profile) : null,
        handle: profile?.handle,
        source: source?.toLowerCase(),
    });
}
