import { StatusCodes } from 'http-status-codes';
import type { NextRequest } from 'next/server.js';
import { z } from 'zod';

import { compose } from '@/helpers/compose.js';
import { createErrorResponseJSON, createSuccessResponseJSON } from '@/helpers/createResponseJSON.js';
import { fetchOrb } from '@/helpers/fetchOrb.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import type { FetchClubsResponse } from '@/providers/types/Orb.js';

const BodySchema = z.object({
    club_handle: z.string().optional(),
    id: z.string().optional(),
    limit: z.number().max(50).optional(),
    profile_id: z.string().optional(),
    query: z.string().optional(),
    skip: z.number().max(50).optional(),
});

export const POST = compose(withRequestErrorHandler(), async (request: NextRequest) => {
    const parsed = BodySchema.safeParse(await request.json());
    if (!parsed.success) return createErrorResponseJSON(parsed.error.message, { status: StatusCodes.BAD_REQUEST });

    const response = await fetchOrb<FetchClubsResponse>('/fetch-clubs', {
        method: 'POST',
        body: JSON.stringify(parsed.data),
    });

    if (!response.success)
        return createErrorResponseJSON((response.error || response.msg) ?? 'Orb club server error', {
            status: StatusCodes.BAD_GATEWAY,
        });

    return createSuccessResponseJSON(response.data);
});
