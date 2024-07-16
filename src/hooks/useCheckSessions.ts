import { t } from '@lingui/macro';
import { useCallback } from 'react';

import { Source } from '@/constants/enum.js';
import { checkFarcasterInvalidSignerKey } from '@/helpers/checkers.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import { farcasterSessionHolder } from '@/providers/farcaster/SessionHolder.js';
import { validateFarcasterSession } from '@/services/validateFarcasterSignerKey.js';

export function useCheckSessions() {
    const { availableSources } = useCompositePost();

    return useCallback<() => Promise<true>>(async () => {
        try {
            if (availableSources.includes(Source.Farcaster)) {
                await validateFarcasterSession(farcasterSessionHolder.sessionRequired);
            }
        } catch (error) {
            enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to validate farcaster session.`), {
                error,
            });
            checkFarcasterInvalidSignerKey(error);
            throw error;
        }

        return true;
    }, [availableSources]);
}
