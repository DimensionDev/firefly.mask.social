import { NextRequest } from 'next/server.js';
import { z } from 'zod';

import { compose } from '@/helpers/compose.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { withTwitterRequestErrorHandler } from '@/helpers/withTwitterRequestErrorHandler.js';
import type { NextRequestContext } from '@/types/index.js';

const BodySchema = z.object({
    ids: z.array(z.string()).min(1),
});

export const POST = compose<(request: NextRequest, context?: NextRequestContext) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request) => {
        const parsedBody = BodySchema.safeParse(await request.json());
        if (!parsedBody.success) throw new Error(parsedBody.error.message);
        const { ids } = parsedBody.data;

        const client = await createTwitterClientV2(request);
        const { data, errors } = await client.v2.users(ids, {
            'user.fields': [
                'description',
                'username',
                'name',
                'profile_image_url',
                'public_metrics',
                'connection_status',
            ],
        });

        if (errors && errors.length > 0) {
            throw errors;
        }
        return createSuccessResponseJSON(data);
    },
);
