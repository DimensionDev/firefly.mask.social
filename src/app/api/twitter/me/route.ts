import { StatusCodes } from 'http-status-codes';
import { type JWT, getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server.js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';
import { createErrorResponseJSON } from '@/helpers/createErrorResponseJSON.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';

export async function GET(req: NextRequest) {
    try {
        const token = await getToken({
            req,
        });
        const session = await getServerSession(authOptions);

        if (!token || !session) return createErrorResponseJSON('Unauthorized', { status: StatusCodes.UNAUTHORIZED });

        const client = createTwitterClientV2(token as JWT);
        const results = await client.users.findMyUser();

        return createSuccessResponseJSON(results, { status: StatusCodes.OK });
    } catch (error) {
        return createErrorResponseJSON(error instanceof Error ? error.message : 'Internal Server Error', {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
}
