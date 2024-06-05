import { FRAME_SERVER_URL } from '@/constants/index.js';

export const getPollFrameUrl = (pollId: string) => `${FRAME_SERVER_URL}/polls/${pollId}`;
