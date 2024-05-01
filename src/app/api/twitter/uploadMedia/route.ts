import { StatusCodes } from 'http-status-codes';
import { NextRequest } from 'next/server.js';

import { createErrorResponseJSON } from '@/helpers/createErrorResponseJSON.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';

export async function POST(request: NextRequest) {
    try {
        const client = await createTwitterClientV2(request);
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const buffer = Buffer.from(await file.arrayBuffer());
        const res = await client.v1.uploadMedia(buffer, { mimeType: file.type });
        return createSuccessResponseJSON({ media_id: Number(res), media_id_string: res }, { status: StatusCodes.OK });
    } catch (error) {
        return createErrorResponseJSON(error instanceof Error ? `${error}` : 'Internal Server Error', {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
}
