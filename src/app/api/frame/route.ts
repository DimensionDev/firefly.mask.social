import { safeUnreachable } from '@masknet/kit';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { KeyType, STATUS } from '@/constants/enum.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { getFrameErrorMessage } from '@/helpers/getFrameErrorMessage.js';
import { getGatewayErrorMessage } from '@/helpers/getGatewayErrorMessage.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
import { parseJSON } from '@/helpers/parseJSON.js';
import { FrameProcessor } from '@/providers/frame/Processor.js';
import { HttpUrl } from '@/schemas/index.js';
import { savePostLinks } from '@/services/getPostLinksKV.js';
import { ActionType } from '@/types/frame.js';
import { env } from '@/constants/env.js';

const digestLinkRedis = memoizeWithRedis(FrameProcessor.digestDocumentUrl, {
    key: KeyType.DigestFrameLink,
    resolver: (link) => link,
});

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const link = searchParams.get('link');
    if (!link) return Response.json({ error: 'Missing link' }, { status: StatusCodes.BAD_REQUEST });

    const linkDigested = await digestLinkRedis(decodeURIComponent(link), request.signal);
    if (!linkDigested)
        return Response.json({ error: `Unable to digest frame link = ${link}` }, { status: StatusCodes.NOT_FOUND });

    try {
        await savePostLinks(request, {
            frame: linkDigested.frame,
        });
    } catch (error) {
        console.error(`[frame] Failed to save post links\n%s`, getGatewayErrorMessage(error));
    }

    return createSuccessResponseJSON(linkDigested);
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);

    const link = searchParams.get('link');
    if (!link) return Response.json({ error: 'Missing link' }, { status: StatusCodes.BAD_REQUEST });

    await digestLinkRedis.cache.delete(link);
    return createSuccessResponseJSON(null);
}

const FrameActionSchema = z.object({
    action: z.nativeEnum(ActionType),
    url: HttpUrl,
    postUrl: HttpUrl,
    target: z.union([HttpUrl, z.literal(null)]),
});

export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);

    const parsedFrameAction = FrameActionSchema.safeParse({
        action: searchParams.get('action'),
        url: searchParams.get('url'),
        target: searchParams.get('target'),
        postUrl: searchParams.get('post-url'),
    });
    if (!parsedFrameAction.success)
        return Response.json({ error: parsedFrameAction.error.message }, { status: StatusCodes.BAD_REQUEST });

    const { action, url, target, postUrl } = parsedFrameAction.data;

    const packet = await request.clone().text();
    const parsedPacket = parseJSON<{ untrustedData: { transactionId?: string } }>(packet);
    const response = await fetch(
        // if transactionId exists, then we post upon postUrl stead of target
        parsedPacket?.untrustedData.transactionId ? postUrl || target || url : target || postUrl || url,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: packet,

            // for post_redirect, we need to handle the redirect manually
            redirect: action === ActionType.PostRedirect ? 'manual' : 'follow',
        },
    );

    // workaround: if the server cannot handle the post_redirect action correctly, then redirecting to the frame url
    if (action === ActionType.PostRedirect && response.status >= 400) {
        return createSuccessResponseJSON({
            redirectUrl: url,
        });
    }

    if (response.status < 200 || response.status >= 400) {
        const text = await response.text();
        console.error(`[frame] response status: ${response.status}\n%s`, text);
        return Response.json({ error: getFrameErrorMessage(text) }, { status: StatusCodes.BAD_REQUEST });
    }

    try {
        switch (action) {
            case ActionType.Post:
                return createSuccessResponseJSON(
                    await FrameProcessor.digestDocument(url, await response.text(), request.signal),
                );
            case ActionType.PostRedirect:
                const locationUrl = response.headers.get('Location');
                if (response.status >= 300 && response.status < 400) {
                    if (locationUrl && HttpUrl.safeParse(locationUrl).success)
                        return createSuccessResponseJSON({
                            redirectUrl: locationUrl,
                        });
                }
                console.error(`Failed to redirect to ${locationUrl}\n%s`, await response.text());
                return Response.json(
                    {
                        error: 'The frame server cannot handle the post-redirect request correctly.',
                    },
                    {
                        status: StatusCodes.BAD_GATEWAY,
                    },
                );
            case ActionType.Link:
                return Response.json(
                    {
                        error: 'Not available',
                    },
                    {
                        status: StatusCodes.BAD_REQUEST,
                    },
                );
            case ActionType.Mint:
                return Response.json(
                    {
                        error: 'Not available',
                    },
                    {
                        status: StatusCodes.BAD_REQUEST,
                    },
                );
            case ActionType.Transaction: {
                if (parsedPacket?.untrustedData.transactionId) {
                    return createSuccessResponseJSON(
                        await FrameProcessor.digestDocument(url, await response.text(), request.signal),
                    );
                }
                const tx = await response.json();
                return createSuccessResponseJSON(tx);
            }
            default:
                safeUnreachable(action);
                return Response.json({ error: `Unknown action: ${action}` }, { status: StatusCodes.BAD_REQUEST });
        }
    } catch (error) {
        return Response.json({ error: getGatewayErrorMessage(error) }, { status: StatusCodes.BAD_GATEWAY });
    }
}
