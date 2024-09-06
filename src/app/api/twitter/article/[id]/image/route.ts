import { parseHTML } from 'linkedom';
import type { NextRequest } from 'next/server.js';

import { MalformedError } from '@/constants/error.js';
import { compose } from '@/helpers/compose.js';
import { createErrorResponseJSON } from '@/helpers/createErrorResponseJSON.js';
import { createProxyImageResponse } from '@/helpers/createProxyImageResponse.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { withTwitterRequestErrorHandler } from '@/helpers/withTwitterRequestErrorHandler.js';
import { getImageUrl } from '@/providers/og/readers/metadata.js';
import type { NextRequestContext } from '@/types/index.js';

export const GET = compose(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request: NextRequest, context?: NextRequestContext) => {
        const articleId = context?.params.id;
        if (!articleId) throw new MalformedError('articleId not found');

        // simulate bot request to get og image
        const response = await fetch(`https://x.com/SingularityDAO/status/${articleId}`, {
            headers: {
                'User-Agent': 'Bot',
            },
        });

        if (!response.ok || (response.status >= 500 && response.status < 600)) {
            return createErrorResponseJSON('article not found');
        }

        const html = await response.text();
        const { document } = parseHTML(html);
        const imageUrl = getImageUrl(document);
        if (!imageUrl) {
            return createErrorResponseJSON('article not found');
        }
        return createProxyImageResponse(imageUrl);
    },
);
