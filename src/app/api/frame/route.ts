import { safeUnreachable } from '@masknet/kit';
import { z } from 'zod';

import { KeyType } from '@/constants/enum.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
import { FrameProcessor } from '@/libs/frame/Processor.js';
import { ActionType } from '@/types/frame.js';

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
        action: searchParams.get('action'),
        url: searchParams.get('url'),
        postUrl: searchParams.get('post-url'),
    });
    if (!parsedFrameAction.success) return Response.json({ error: parsedFrameAction.error.message }, { status: 400 });

    const { action, url, postUrl } = parsedFrameAction.data;

    const packet = await request.clone().json();
    const response = await fetch(postUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(packet),
    });

    switch (action) {
        case ActionType.Post:
            if (!response.ok || response.status < 200 || response.status >= 300)
                return Response.json(
                    { error: 'The frame server cannot handle the post request correctly.' },
                    { status: 500 },
                );

            return createSuccessResponseJSON(
                await FrameProcessor.digestDocument(url, await response.text(), request.signal),
            );
        case ActionType.PostRedirect:
            if (response.ok && response.status >= 300 && response.status < 400) {
                const locationUrl = response.headers.get('Location');
                if (locationUrl && HttpUrlSchema.safeParse(locationUrl).success)
                    return createSuccessResponseJSON({
                        redirectUrl: locationUrl,
                    });
            }
            return createSuccessResponseJSON({
                redirectUrl: postUrl,
            });

        case ActionType.Link:
            return Response.json(
                {
                    error: 'Not available',
                },
                {
                    status: 400,
                },
            );
        default:
            safeUnreachable(action);
            return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
}
