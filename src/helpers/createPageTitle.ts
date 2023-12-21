import { SITE_NAME } from '@/constants/index.js';

export function createPageTitle(title: string) {
    return `${title} • ${SITE_NAME}`;
}
