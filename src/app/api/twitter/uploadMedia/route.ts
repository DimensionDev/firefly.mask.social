import { StatusCodes } from 'http-status-codes';
import { NextRequest } from 'next/server.js';

import { createErrorResponseJSON } from '@/helpers/createErrorResponseJSON.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { TwitterApi } from 'twitter-api-v2';

export async function POST(request: NextRequest) {
    try {
      const client = new TwitterApi()
        const formData = await request.formData()
        const file = formData.get("file") as File;
        const buffer = Buffer.from(await file.arrayBuffer());
        const res = client.v1.uploadMedia(buffer,{type: file.type});
        return createSuccessResponseJSON({media_id: res}, { status: StatusCodes.OK });
    } catch (error) {
        return createErrorResponseJSON(error instanceof Error ? error.message : 'Internal Server Error', {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
}
