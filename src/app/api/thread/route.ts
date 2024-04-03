import { kv } from '@vercel/kv';
import { StatusCodes } from 'http-status-codes';

import { KeyType } from '@/constants/enum.js';
import { createResponseJSON } from '@/helpers/createResponseJSON.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
import { getLensThreadByPostId } from '@/services/getLensThreadByPostId.js';

const getThreadByPostId = memoizeWithRedis(getLensThreadByPostId, {
    key: KeyType.GetLensThreadByPostId,
    resolver: (postId) => postId,
});

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });

    const thread = await getThreadByPostId(id);

    return createSuccessResponseJSON(thread);
}

export async function PUT(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });

    const lock = await kv.get(KeyType.RefreshLensThreadLock);
    if (lock) {
        return createResponseJSON('The cleanup is in progress.', { status: StatusCodes.LOCKED });
    }

    // Lock for 60 seconds
    await kv.set(KeyType.RefreshLensThreadLock, 'locked', { ex: 60, nx: true });

    // refresh data
    await getThreadByPostId.cache.delete(id);
    await getThreadByPostId(id);

    await kv.set(KeyType.RefreshLensThreadLock, '', { ex: 1 });

    return createSuccessResponseJSON(null);
}
