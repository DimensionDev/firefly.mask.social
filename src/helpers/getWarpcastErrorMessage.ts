import { first } from 'lodash-es';

import type { ErrorResponse } from '@/providers/types/Warpcast.js';

export function getWarpcastErrorMessage(response: ErrorResponse) {
    if (Array.isArray(response.errors)) return first(response.errors)?.message;
    return;
}
