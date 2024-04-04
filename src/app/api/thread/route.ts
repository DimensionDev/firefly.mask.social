import { getThreadByPostId, refreshThreadByPostId } from '@/actions/refreshThreadByPostIdOnce.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';

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

    try {
        await refreshThreadByPostId(id);
    } catch (error) {
        return Response.json(
            { error: error instanceof Error ? error.message : 'Failed to revalidate thread.' },
            { status: 400 },
        );
    }

    return createSuccessResponseJSON(null);
}
