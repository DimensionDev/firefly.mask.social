import { StatusCodes } from 'http-status-codes';
import type { InlineErrorV2 } from 'twitter-api-v2';

import { createErrorResponseJSON } from '@/helpers/createErrorResponseJSON.js';

export function createTwitterErrorResponseJSON(errors: InlineErrorV2[] | undefined) {
    if (Array.isArray(errors)) {
        const forbiddenError = errors.find(({ title }) => title === 'Forbidden');
        if (forbiddenError) return createErrorResponseJSON(forbiddenError.detail, { status: StatusCodes.FORBIDDEN });
        return createErrorResponseJSON(errors.map(({ title, detail }) => `${title}: ${detail}`).join('\n'), {
            status: StatusCodes.GATEWAY_TIMEOUT,
        });
    }
    return createErrorResponseJSON('Unknown error.', { status: StatusCodes.INTERNAL_SERVER_ERROR });
}
