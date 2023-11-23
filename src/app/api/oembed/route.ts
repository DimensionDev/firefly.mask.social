import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { digestLink } from '@/services/digestLink.js';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const link = searchParams.get('link');
    if (!link) {
        return Response.json({ error: 'Missing link' }, { status: 400 });
    }

    const response = await digestLink(link);
    return createSuccessResponseJSON(response);
}
