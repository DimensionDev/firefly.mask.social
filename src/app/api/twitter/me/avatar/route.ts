import type { NextRequest } from 'next/server.js';
import { z } from 'zod';

import { ContentTypeError } from '@/constants/error.js';
import { compose } from '@/helpers/compose.js';
import { createSuccessResponseJSON } from '@/helpers/createResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';
import { convertTwitterAvatar } from '@/helpers/formatTwitterProfile.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { withTwitterRequestErrorHandler } from '@/helpers/withTwitterRequestErrorHandler.js';
import { FileSchema } from '@/schemas/index.js';
import type { NextRequestContext } from '@/types/index.js';

const FormDataSchema = z.object({
    file: FileSchema,
});

export const PUT = compose<(request: NextRequest, context?: NextRequestContext) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request) => {
        const client = await createTwitterClientV2(request);
        const formData = await request.formData().catch((error) => {
            throw new ContentTypeError(error.message);
        });
        const { file } = FormDataSchema.parse({
            file: formData.get('file'),
        });
        const user = await client.v1.updateAccountProfileImage(Buffer.from(await file.arrayBuffer()));

        return createSuccessResponseJSON({
            pfp: convertTwitterAvatar(user.profile_image_url_https),
        });
    },
);
