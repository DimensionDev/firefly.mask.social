import { StatusCodes } from 'http-status-codes';
import { NextRequest } from 'next/server.js';

import { createErrorResponseJSON } from '@/helpers/createErrorResponseJSON.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';
import { getTwitterErrorMessage } from '@/helpers/getTwitterErrorMessage.js';

export async function GET(request: NextRequest) {
    try {
        const client = await createTwitterClientV2(request);
        const { data } = await client.v2.me();
        console.error('[twitter]: me/', data);
        return createSuccessResponseJSON(data);
    } catch (error) {
        console.error('[twitter]: error me/', error);
        return createErrorResponseJSON(getTwitterErrorMessage(error), {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
}
