import { StatusCodes } from 'http-status-codes';
import { NextRequest } from 'next/server.js';
import { TwitterApi } from 'twitter-api-v2';

import { createErrorResponseJSON } from '@/helpers/createErrorResponseJSON.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';

export async function GET(request: NextRequest) {
    try {
        const Twitter = new TwitterApi();
        if (!request.body) throw new Error('Request body is null');
        const files = await request.json();
        const medias = await Promise.all(
            files.map(async (x: { file: ArrayBuffer; type: string }) => {
                return await Twitter.v1.uploadMedia(Buffer.from(x.file), { type: x.type });
            }),
        );
        return createSuccessResponseJSON(
            medias.map((x, i) => ({
                media_id: x,
            })),
            { status: StatusCodes.OK },
        );
    } catch (error) {
        return createErrorResponseJSON(error instanceof Error ? error.message : 'Internal Server Error', {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
}
