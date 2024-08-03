import { StatusCodes } from 'http-status-codes';

import { KeyType, STATUS } from '@/constants/enum.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { getGatewayErrorMessage } from '@/helpers/getGatewayErrorMessage.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
import { OpenGraphProcessor } from '@/providers/og/Processor.js';
import { savePostLinks } from '@/services/getPostLinksKV.js';
import { env } from '@/constants/env.js';

const digestLinkRedis = memoizeWithRedis(OpenGraphProcessor.digestDocumentUrl, {
    key: KeyType.DigestOpenGraphLink,
    resolver: (link) => link,
});

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const link = searchParams.get('link');
    if (!link) return Response.json({ error: 'Missing link' }, { status: StatusCodes.BAD_REQUEST });

    if (
        [
            /opensea.io\/assets\/(0x[\dA-Fa-f]{40})\/(\d+)/,
            /opensea.io\/assets\/(\w+)\/(0x[\dA-Fa-f]{40})\/(\d+)/,
            /rarible.com\/token\/(0x[\dA-Fa-f]{40}):(\d+)/,
            /zora.co\/collections\/(0x[\dA-Fa-f]{40})\/\d+$/,
        ].some((x) => x.test(decodeURIComponent(link)))
    ) {
        // For the time being, we do not support og information capture for links in opensea. The simplehash api will be used instead.
        return Response.json({ error: 'Unsupported' }, { status: StatusCodes.BAD_REQUEST });
    }

    const linkDigested = await digestLinkRedis(decodeURIComponent(link), request.signal);
    if (!linkDigested)
        return Response.json({ error: `Unable to digest oembed link = ${link}` }, { status: StatusCodes.BAD_GATEWAY });

    if (env.external.NEXT_PUBLIC_INSTANT_LINKS === STATUS.Enabled) {
        try {
            await savePostLinks(request, {
                oembed: linkDigested,
            });
        } catch (error) {
            console.error(`[oembed] Failed to save post links\n%s`, getGatewayErrorMessage(error));
        }
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
