import { StatusCodes } from 'http-status-codes';
import { NextRequest } from 'next/server.js';

import { createErrorResponseJSON } from '@/helpers/createErrorResponseJSON.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';

export async function GET(request: NextRequest) {
    try {
        const client = await createTwitterClientV2(request);
        const { data } = await client.v2.me();

        return createSuccessResponseJSON(data, { status: StatusCodes.OK });
    } catch (error) {
        return createErrorResponseJSON(error instanceof Error ? error.message : 'Internal Server Error', {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
}
