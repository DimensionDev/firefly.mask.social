import { t } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';

import { Source } from '@/constants/enum.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import urlcat from 'urlcat';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { CZActivity } from '@/providers/types/Firefly.js';
import { settings } from '@/settings/index.js';

export function useCZActivityCheckResponse() {
    const account = useAccount();
    const twitterProfile = useCurrentProfile(Source.Twitter);
    const query = useQuery({
        queryKey: ['cz-activity-check', account.address, !!twitterProfile],
        async queryFn() {
            const response = await fireflySessionHolder.fetch<CZActivity.CheckResponse>(
                // cspell: disable-next-line
                urlcat(settings.FIREFLY_ROOT_URL, '/v1/misc/activity/checkBnbcz', {
                    address: account.address!,
                }),
            );
            if (!response.data) {
                throw new Error(response.error?.[0] ?? t`Unknown error`);
            }
            return response.data;
        },
        enabled: !!account.address && !!twitterProfile,
    });

    useEffect(() => {
        if (query.error) {
            enqueueErrorMessage(getSnackbarMessageFromError(query.error, t`Unknown error`));
        }
    }, [query.error]);

    return query;
}
