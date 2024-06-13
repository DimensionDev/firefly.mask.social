import urlcat from 'urlcat';

import { type SocialSource } from '@/constants/enum.js';
import { FRAME_SERVER_URL } from '@/constants/index.js';
import { getCurrentProfile } from '@/helpers/getCurrentProfile.js';
import { getLocaleFromCookies } from '@/helpers/getLocaleFromCookies.js';
import { getMeaningfulThemeMode } from '@/helpers/getMeaningfulThemeMode.js';

export const getPollFrameSearchParams = (source: SocialSource) => {
    const profile = getCurrentProfile(source);
    return {
        source: source.toLowerCase(),
        profileId: profile?.profileId ?? null,
        theme: getMeaningfulThemeMode(),
        locale: getLocaleFromCookies(),
        date: Date.now(), // force refresh poll frame
    }
};

export function getPollFrameUrl(pollId: string) {
    return urlcat(FRAME_SERVER_URL, `/polls/${pollId}`);
}
