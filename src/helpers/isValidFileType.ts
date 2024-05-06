import { ALLOWED_IMAGES_MIMES } from '@/constants/index.js';

export function isValidFileType(type: string) {
    return ALLOWED_IMAGES_MIMES.includes(type as (typeof ALLOWED_IMAGES_MIMES)[number]);
}
