import { KeyType } from '@/constants/enum.js';
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
