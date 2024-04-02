import { StatusCodes } from 'http-status-codes';
import { NextRequest } from 'next/server.js';
import { getServerSession } from 'next-auth';
import { getToken, type JWT } from 'next-auth/jwt';

import { authOptions } from '@/app/api/auth/[...nextauth]/options.js';
import { createErrorResponseJSON } from '@/helpers/createErrorResponseJSON.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';

export async function GET(req: NextRequest) {
    try {
        const token = await getToken({
            req,
        });
        const session = await getServerSession(authOptions);

        if (!token || !session) return createErrorResponseJSON('Unauthorized', { status: StatusCodes.UNAUTHORIZED });

        const client = createTwitterClientV2(token as JWT);
        const { data } = await client.users.findMyUser();

        return createSuccessResponseJSON(data, { status: StatusCodes.OK });
    } catch (error) {
        return createErrorResponseJSON(error instanceof Error ? error.message : 'Internal Server Error', {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
}
