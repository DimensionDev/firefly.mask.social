import { StatusCodes } from 'http-status-codes';

import { KeyType } from '@/constants/enum.js';
import { createErrorResponseJSON } from '@/helpers/createErrorResponseJSON.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { getGatewayErrorMessage } from '@/helpers/getGatewayErrorMessage.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
import { once } from '@/helpers/once.js';
import { getLensThreadByPostId } from '@/services/getLensThreadByPostId.js';

const getThreadByPostId = memoizeWithRedis(getLensThreadByPostId, {
    key: KeyType.GetLensThreadByPostId,
    resolver: (postId) => postId,
});

const refreshThreadByPostId = once(
    async (postId: string) => {
        await getThreadByPostId.cache.delete(postId);
        await getLensThreadByPostId(postId);
    },
    {
        resolver: (postId) => postId,
    },
);

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const id = searchParams.get('id');
    if (!id) return createErrorResponseJSON('Missing id', { status: StatusCodes.BAD_REQUEST });

    const thread = await getThreadByPostId(id);
    return createSuccessResponseJSON(thread);
}

export async function PUT(request: Request) {
    const { searchParams } = new URL(request.url);

    const id = searchParams.get('id');
    if (!id) return createErrorResponseJSON('Missing id', { status: StatusCodes.BAD_REQUEST });

    try {
        await refreshThreadByPostId(id);
        return createSuccessResponseJSON(null);
    } catch (error) {
        return createErrorResponseJSON(getGatewayErrorMessage(error, 'Failed to revalidate thread.'), {
            status: StatusCodes.BAD_GATEWAY,
        });
    }
}
