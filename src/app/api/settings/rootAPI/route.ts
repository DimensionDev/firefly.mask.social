import { StatusCodes } from 'http-status-codes';

import { createErrorResponseJSON, createSuccessResponseJSON } from '@/helpers/createResponseJSON.js';

export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);

    const url = searchParams.get('url');

    if (!url) return createErrorResponseJSON('Missing url', { status: StatusCodes.BAD_REQUEST });
    return createSuccessResponseJSON(null, {
        headers: {
            'Set-Cookie': `firefly_root_api=${url}; path=/; Max-Age=315360000; SameSite=Lax; Secure}`,
        },
    });
}
