import { StatusCodes } from 'http-status-codes';
import { JWT, getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2';
import { createErrorResponseJSON } from '@/helpers/createErrorResponseJSON';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON';

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
