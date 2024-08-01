import { ALLOWED_VIDEO_MIMES } from '@/constants/index.js';

export function isVideoFileType(mime: string) {
    return ALLOWED_VIDEO_MIMES.includes(mime);
}
