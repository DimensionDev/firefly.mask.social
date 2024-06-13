import urlcat from 'urlcat';

import { type SocialSource } from '@/constants/enum.js';
import { FRAME_SERVER_URL } from '@/constants/index.js';
import { getCurrentProfile } from '@/helpers/getCurrentProfile.js';
import { getMeaningfulThemeMode } from '@/helpers/getMeaningfulThemeMode.js';

interface GetPollFrameUrlOptions {
    pollId: string;
    source: SocialSource;
}

export function getPollFrameUrl({ pollId, source }: GetPollFrameUrlOptions) {
    const profile = getCurrentProfile(source);

    return urlcat(FRAME_SERVER_URL, `/polls/${pollId}`, {
        source: source.toLowerCase(),
        profileId: profile?.profileId ?? null,
        theme: getMeaningfulThemeMode(),
        date: Date.now(), // force refresh poll frame
    });
}
