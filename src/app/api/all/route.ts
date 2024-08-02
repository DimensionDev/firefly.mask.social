import { kv } from '@vercel/kv';
import { StatusCodes } from 'http-status-codes';

import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const source = searchParams.get('source');
    const postIds = searchParams.get('post-ids') as string[] | null;

    if (!source || !postIds?.length)
        return Response.json({ error: 'Missing source or post-ids' }, { status: StatusCodes.BAD_REQUEST });

    const allSettled = await Promise.allSettled(
        postIds.map(async (postId) => {
            const records = await kv.hgetall(`post-links:${source}:${postId}`);
            return [postId, records] as const;
        }),
    );

    return createSuccessResponseJSON(
        Object.fromEntries(allSettled.map((x) => (x.status === 'fulfilled' ? x.value : []))),
    );
}
