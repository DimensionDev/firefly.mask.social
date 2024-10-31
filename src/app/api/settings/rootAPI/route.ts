import { StatusCodes } from 'http-status-codes';

import { NODE_ENV } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { createErrorResponseJSON, createSuccessResponseJSON } from '@/helpers/createResponseJSON.js';

export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);

    const url = searchParams.get('url');

    if (!url) return createErrorResponseJSON('Missing url', { status: StatusCodes.BAD_REQUEST });
    return createSuccessResponseJSON(null, {
        headers: {
            'Set-Cookie': `firefly_root_api=${url}; path=/; Max-Age=315360000; SameSite=Lax;${env.shared.NODE_ENV === NODE_ENV.Development ? ' httpOnly;' : 'Secure'}`,
        },
    });
}
