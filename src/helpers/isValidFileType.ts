import { ALLOWED_MEDIA_MIMES } from '@/constants/index.js';

export function isValidFileType(type: string) {
    return ALLOWED_MEDIA_MIMES.includes(type as (typeof ALLOWED_MEDIA_MIMES)[number]);
}
