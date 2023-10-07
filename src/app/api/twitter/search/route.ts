import { StatusCodes } from 'http-status-codes';
import { getToken, JWT } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { createTwitterClient } from '@/helpers/createTwitterClient';
import { createErrorResponseJSON } from '@/helpers/createErrorResponseJSON';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON';

export async function GET(req: NextRequest) {
    try {
        const u = new URL(req.url);
        const q = u.searchParams.get('q');
        if (!q) return createErrorResponseJSON('Bad Request', { status: StatusCodes.BAD_REQUEST });

        const token = await getToken({
            req,
        });
        const session = await getServerSession(authOptions);

        if (!token || !session) {
            return createErrorResponseJSON('Unauthorized', { status: StatusCodes.UNAUTHORIZED });
        }

        const client = createTwitterClient(token as JWT);
        const results = await client.get('search/tweets', {
            q,
            count: 1,
        });

        return createSuccessResponseJSON(results, { status: StatusCodes.OK });
    } catch (error) {
        return createErrorResponseJSON(error instanceof Error ? error.message : 'Internal Server Error', {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
}
