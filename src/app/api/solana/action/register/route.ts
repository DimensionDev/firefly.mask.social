import { compose } from '@masknet/shared-base';

import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import type { ActionsRegistryConfig } from '@/providers/blinks/type.js';

export const GET = compose(withRequestErrorHandler(), async () => {
    const config = await fetchJSON<ActionsRegistryConfig>('https://actions-registry.dialectapi.to/all', {
        next: {
            revalidate: 60,
        },
    });
    return createSuccessResponseJSON(config);
});
