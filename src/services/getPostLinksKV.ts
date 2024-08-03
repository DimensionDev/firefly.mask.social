/* cspell:disable */

import { kv } from '@vercel/kv';

import { PostIndicator } from '@/schemas/index.js';
import type { PostLinks } from '@/services/getPostLinks.js';

export async function readPostLinks(request: Request): Promise<PostLinks | null> {
    const { searchParams } = new URL(request.url);

    const parsed = PostIndicator.safeParse({
        source: searchParams.get('source'),
        postId: searchParams.get('post-id'),
    });
    if (!parsed.success) return null;

    const { source, postId } = parsed.data;

    if (source && postId) {
        return await kv.hgetall(`post-links:${source}:${postId}`);
    }

    return null;
}

export async function readPostLinksAll(request: Request): Promise<Record<string, PostLinks[]> | null> {
    const { searchParams } = new URL(request.url);

    const parsed = PostIndicator.safeParse({
        source: searchParams.get('source'),
        postIds: searchParams.get('post-ids')?.split(','),
    });
    if (!parsed.success) return null;

    const { source, postIds } = parsed.data;

    if (source && postIds?.length) {
        const allSettled = await Promise.allSettled(
            postIds.map((postId) => kv.hgetall(`post-links:${source}:${postId}`)),
        );
        return Object.fromEntries(
            allSettled.map((x) => (x.status === 'fulfilled' && x.value ? [x.value.postId, x.value] : [])),
        );
    }
    return null;
}

export async function savePostLinks(request: Request, links: PostLinks) {
    const { searchParams } = new URL(request.url);

    const parsed = PostIndicator.safeParse({
        source: searchParams.get('source'),
        postId: searchParams.get('post-id'),
    });
    if (!parsed.success) return false;

    const { source, postId } = parsed.data;

    if (source && postId) {
        await kv.hset(`post-links:${source}:${postId}`, links as Record<string, unknown>);
        return true;
    }
    return false;
}
