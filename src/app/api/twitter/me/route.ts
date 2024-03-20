import { StatusCodes } from 'http-status-codes';
import { NextRequest } from 'next/server.js';
import { getServerSession } from 'next-auth';
import { getToken, type JWT } from 'next-auth/jwt';
import { Client } from 'twitter-api-sdk';

import { authOptions } from '@/app/api/auth/[...nextauth]/options.js';
import { createErrorResponseJSON } from '@/helpers/createErrorResponseJSON.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';

function createTwitterClientV2(token: JWT) {
    if (!token.twitter.accessToken) throw new Error('No Twitter token found');
    return new Client(token.twitter.accessToken);
}

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
