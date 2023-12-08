import { first } from 'lodash-es'

import type { ErrorResponse } from '@/providers/types/Warpcast.js';

export function getWarpcastErrorMessage(response: ErrorResponse) {
    if (Array.isArray(response.erorrs)) return first(response.erorrs)?.message
    return
}
