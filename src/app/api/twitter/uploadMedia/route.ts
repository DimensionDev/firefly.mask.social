import { StatusCodes } from 'http-status-codes';
import { NextRequest } from 'next/server.js';

import { createErrorResponseJSON } from '@/helpers/createErrorResponseJSON.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';
import { getTwitterErrorMessage } from '@/helpers/getTwitterErrorMessage.js';

export async function POST(request: NextRequest) {
    try {
        const client = await createTwitterClientV2(request);
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const buffer = Buffer.from(await file.arrayBuffer());
        const response = await client.v1.uploadMedia(buffer, { mimeType: file.type });
        console.error('[twitter]: uploadMedia/', response);
        return createSuccessResponseJSON({ media_id: Number(response), media_id_string: response });
    } catch (error) {
        console.error('[twitter]: error uploadMedia/', error);
        return createErrorResponseJSON(getTwitterErrorMessage(error), {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
}
