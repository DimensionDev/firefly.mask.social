import { StatusCodes } from 'http-status-codes';

import { createErrorResponseJSON, createSuccessResponseJSON } from '@/helpers/createResponseJSON.js';

export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);

    const rootClass = searchParams.get('root_class');
    if (!rootClass) return createErrorResponseJSON('Missing parameter', { status: StatusCodes.BAD_REQUEST });

    return createSuccessResponseJSON(null, {
        headers: {
            'Set-Cookie': `firefly_root_class=${rootClass}; path=/; Max-Age=315360000; SameSite=Lax; Secure;`,
        },
    });
}
