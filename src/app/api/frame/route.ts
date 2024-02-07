import { getSSLHubRpcClient, Message } from '@farcaster/hub-nodejs';
import { safeUnreachable } from '@masknet/kit';
import { z } from 'zod';

import { KeyType } from '@/constants/enum.js';
import { HUBBLE_URL } from '@/constants/index.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
import { FrameProcessor } from '@/libs/frame/Processor.js';
import { ActionType } from '@/types/frame.js';

const hubClient = getSSLHubRpcClient(HUBBLE_URL);

const digestLinkRedis = memoizeWithRedis(FrameProcessor.digestDocumentUrl, {
    key: KeyType.DigestFrameLink,
    resolver: (link) => link,
});

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const link = searchParams.get('link');
    if (!link) return Response.json({ error: 'Missing link' }, { status: 400 });

    const linkDigested = await digestLinkRedis(decodeURIComponent(link), request.signal);
    if (!linkDigested) return Response.json({ error: 'Unable to digest link' }, { status: 500 });

    return createSuccessResponseJSON(linkDigested);
}

const HttpUrlSchema = z
    .string()
    .url()
    .regex(/^(https?:\/\/)/);

const FrameActionSchema = z.object({
    action: z.nativeEnum(ActionType),
    url: HttpUrlSchema,
    postUrl: HttpUrlSchema,
});

export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);

    const parsedFrameAction = FrameActionSchema.safeParse({
        url: searchParams.get('url'),
        postUrl: searchParams.get('post-url'),
        action: searchParams.get('action'),
    });
    if (!parsedFrameAction.success) return Response.json({ error: parsedFrameAction.error.message }, { status: 400 });

    const { action, url, postUrl } = parsedFrameAction.data;

    const packet = await request.clone().json();
    const message = Message.decode(Buffer.from(packet.trustedData.messageBytes, 'hex'));
    const validated = await hubClient.validateMessage(message);
    if (validated.isErr()) {
        console.log('DEBUG: validateMessage error');
        console.log(validated.error.message);
    }

    const response = await fetch(postUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(packet),
    });

    console.log('DEBUG: response');
    console.log({
        url,
        postUrl,
        action,
        packet,
        code: response.status,
        statusText: response.statusText,
        location: response.headers.get('Location'),
        data: await response.clone().text(),
    });

    switch (action) {
        case ActionType.Post:
            if (!response.ok || response.status !== 200)
                return Response.json(
                    { error: 'The frame server cannot handle the post request correctly.' },
                    { status: 500 },
                );

            return createSuccessResponseJSON(
                await FrameProcessor.digestDocument(url, await response.text(), request.signal),
            );
        case ActionType.PostRedirect:
            if (!response.ok || response.status !== 302)
                return Response.json(
                    { error: 'The frame server cannot handle the post_redirect request correctly.' },
                    { status: 500 },
                );

            const redirectUrl = response.headers.get('Location');
            if (!redirectUrl || !HttpUrlSchema.safeParse(redirectUrl).success)
                return Response.json({ error: 'The frame server does not return a Location header.' }, { status: 500 });

            return createSuccessResponseJSON({
                redirectUrl,
            });
        default:
            safeUnreachable(action);
            return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
}
