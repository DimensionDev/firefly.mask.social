import { StatusCodes } from 'http-status-codes';

import { NODE_ENV } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { createErrorResponseJSON, createSuccessResponseJSON } from '@/helpers/createResponseJSON.js';

export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);

    const rootClass = searchParams.get('root_class');
    if (!rootClass) return createErrorResponseJSON('Missing paramater', { status: StatusCodes.BAD_REQUEST });

    return createSuccessResponseJSON(null, {
        headers: {
            'Set-Cookie': `firefly_root_class=${rootClass}; path=/; Max-Age=315360000; SameSite=Lax;${env.shared.NODE_ENV === NODE_ENV.Development ? ' httpOnly;' : 'Secure'}`,
        },
    });
}
