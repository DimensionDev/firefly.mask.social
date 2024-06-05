import urlcat from 'urlcat';

import { FRAME_SERVER_URL } from '@/constants/index.js';

export const getPollFrameUrl = (pollId: string) => urlcat(FRAME_SERVER_URL, `/polls/${pollId}`);
