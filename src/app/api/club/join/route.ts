import { StatusCodes } from 'http-status-codes';
import type { NextRequest } from 'next/server.js';
import { z } from 'zod';

import { compose } from '@/helpers/compose.js';
import { createErrorResponseJSON, createSuccessResponseJSON } from '@/helpers/createResponseJSON.js';
import { fetchOrb } from '@/helpers/fetchOrb.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import type { JoinClubResponse } from '@/providers/types/Orb.js';

const BodySchema = z.object({
    id: z.string(),
});

export const POST = compose(withRequestErrorHandler(), async (request: NextRequest) => {
    const parsed = BodySchema.safeParse(await request.json());
    if (!parsed.success) return createErrorResponseJSON(parsed.error.message, { status: StatusCodes.BAD_REQUEST });

    const lensToken = request.headers.get('X-Lens-Identity-Token');
    if (!lensToken) return createErrorResponseJSON('Unauthorized on Lens', { status: StatusCodes.UNAUTHORIZED });

    const response = await fetchOrb<JoinClubResponse>('/join-club', {
        method: 'POST',
        body: JSON.stringify(parsed.data),
        headers: {
            'X-Identity-Token': lensToken,
        },
        signal: request.signal,
    });

    if (!response.success)
        return createErrorResponseJSON((response.error || response.msg) ?? 'Orb club server error', {
            status: StatusCodes.BAD_GATEWAY,
        });

    return createSuccessResponseJSON(response.data);
});
