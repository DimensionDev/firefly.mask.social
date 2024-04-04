import type { NextRequest } from 'next/server.js';
import { getServerSession } from 'next-auth';
import { getToken, type JWT } from 'next-auth/jwt';
import { Client } from 'twitter-api-sdk';

import { authOptions } from '@/app/api/auth/[...nextauth]/options.js';

export async function createTwitterClientV2(request: NextRequest) {
    const token: JWT = await getToken({
        req: request,
    });
    const session = await getServerSession(authOptions);

    if (!token || !session) throw new Error('Unauthorized');
    if (!token.twitter.accessToken) throw new Error('No Twitter token found');

    return new Client(token.twitter.accessToken);
}
