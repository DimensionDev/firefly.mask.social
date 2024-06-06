import urlcat from 'urlcat';

import { FRAME_SERVER_URL } from '@/constants/index.js';

export function getPollFrameUrl(pollId: string) {
    return urlcat(FRAME_SERVER_URL, `/polls/${pollId}`);
}
