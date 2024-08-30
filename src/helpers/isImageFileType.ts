import { ALLOWED_IMAGES_MIMES } from '@/constants/index.js';

export function isImageFileType(mime: string) {
    return ALLOWED_IMAGES_MIMES.includes(mime);
}
