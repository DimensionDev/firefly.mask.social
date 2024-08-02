import { NextRequest } from 'next/server.js';

import { MalformedError } from '@/constants/error.js';
import { compose } from '@/helpers/compose.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { withTwitterRequestErrorHandler } from '@/helpers/withTwitterRequestErrorHandler.js';

export const POST = compose<(request: NextRequest) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request) => {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        if (!file) throw new MalformedError('file not found');

        const client = await createTwitterClientV2(request);
        const response = await client.v1.uploadMedia(Buffer.from(await file.arrayBuffer()), { mimeType: file.type });
        return createSuccessResponseJSON({ media_id: Number(response), media_id_string: response });
    },
);
