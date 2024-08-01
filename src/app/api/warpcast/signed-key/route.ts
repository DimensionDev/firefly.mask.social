import { NextRequest } from 'next/server.js';
import { z } from 'zod';

import { createErrorResponseJSON } from '@/helpers/createErrorResponseJSON.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { waitForSignedKeyRequest } from '@/helpers/waitForSignedKeyRequest.js';

const Schema = z.object({
    token: z.string(),
});

export const maxDuration = 300;

export async function GET(request: NextRequest) {
    try {
        const { token } = Schema.parse({
            token: request.nextUrl.searchParams.get('token'),
        });
        const result = await waitForSignedKeyRequest(request.signal)(token);
        return createSuccessResponseJSON(result);
    } catch (error) {
        if (error instanceof Error) return createErrorResponseJSON(error.message);
        return createErrorResponseJSON('Unknown error');
    }
}
