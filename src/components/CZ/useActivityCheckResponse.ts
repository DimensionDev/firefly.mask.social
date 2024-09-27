import { t } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { useContext, useEffect } from 'react';
import urlcat from 'urlcat';

import { Source } from '@/constants/enum.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { CheckResponse } from '@/providers/types/CZ.js';
import { settings } from '@/settings/index.js';
import { ActivityContext } from '@/components/CZ/ActivityContext.js';

export function useActivityCheckResponse() {
    const { address } = useContext(ActivityContext);
    const twitterProfile = useCurrentProfile(Source.Twitter);
    const query = useQuery({
        queryKey: ['cz-activity-check', address, !!twitterProfile],
        async queryFn() {
            const response = await fireflySessionHolder.fetch<CheckResponse>(
                // cspell: disable-next-line
                urlcat(settings.FIREFLY_ROOT_URL, '/v1/misc/activity/checkBnbcz', {
                    address: address!,
                }),
            );
            if (!response.data) {
                throw new Error(response.error?.[0] ?? t`Unknown error`);
            }
            return response.data;
        },
        enabled: !!address && !!twitterProfile,
    });

    useEffect(() => {
        if (query.error) {
            enqueueErrorMessage(getSnackbarMessageFromError(query.error, t`Unknown error`));
        }
    }, [query.error]);

    return query;
}
