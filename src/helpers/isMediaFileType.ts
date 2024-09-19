import { ALLOWED_IMAGES_MIMES, ALLOWED_MEDIA_MIMES, ALLOWED_VIDEO_MIMES } from '@/constants/index.js';

type AllowedVideoMime = (typeof ALLOWED_VIDEO_MIMES)[number];
type AllowedImageMime = (typeof ALLOWED_IMAGES_MIMES)[number];
type AllowedMediaMime = (typeof ALLOWED_MEDIA_MIMES)[number];

export function isVideoFileType(type: string): type is AllowedVideoMime {
    return ALLOWED_VIDEO_MIMES.includes(type as unknown as AllowedVideoMime);
}

export function isImageFileType(type: string): type is AllowedImageMime {
    return ALLOWED_IMAGES_MIMES.includes(type as AllowedImageMime);
}

export function isMediaFileType(type: string): type is AllowedMediaMime {
    return ALLOWED_MEDIA_MIMES.includes(type as AllowedMediaMime);
}
