import { isServer } from '@tanstack/react-query';
import { cookies as NextCookies, headers } from 'next/headers.js';
import type { NextRequest } from 'next/server.js';

import {
    createTwitterSessionPayloadFromCookie,
    createTwitterSessionPayloadFromJWT,
} from '@/helpers/createTwitterSessionPayload.js';
import { TwitterSession } from '@/providers/twitter/Session.js';
import { twitterSessionHolder } from '@/providers/twitter/SessionHolder.js';

export async function setupTwitterSession() {
    if (!isServer) return;

    const cookies = await NextCookies();

    const req = {
        headers: Object.fromEntries(await headers()),
        cookies: Object.fromEntries(cookies.getAll().map((c) => [c.name, c.value])),
    } as unknown as NextRequest;

    const payload = (await createTwitterSessionPayloadFromJWT(req)) ?? (await createTwitterSessionPayloadFromCookie());
    if (!payload) {
        if (twitterSessionHolder.session) twitterSessionHolder.removeSession();
        return;
    }

    twitterSessionHolder.resumeSession(TwitterSession.from(payload.clientId, payload));
}
