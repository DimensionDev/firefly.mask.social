import { compose } from '@/helpers/compose.js';

import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import type { ActionsRegistryResponse } from '@/providers/types/Blink.js';

export const GET = compose(withRequestErrorHandler(), async () => {
    const config = await fetchJSON<ActionsRegistryResponse>('https://actions-registry.dialectapi.to/all', {
        next: {
            revalidate: 60,
        },
    });
    return createSuccessResponseJSON(config);
});
