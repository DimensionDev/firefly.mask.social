import { useCallback } from 'react';

import { useActivityWalletProfiles } from '@/components/Activity/hooks/useActivityWalletProfiles.js';
import { captureActivityEvent } from '@/providers/telemetry/captureActivityEvent.js';
import { EventId, type Events } from '@/providers/types/Telemetry.js';

export function useCaptureActivityEvent() {
    const { data: profiles } = useActivityWalletProfiles();
    const fireflyAccountId = profiles?.fireflyAccountId;
    return useCallback(
        <
            E extends
                | EventId.EVENT_SHARE_CLICK
                | EventId.EVENT_X_LOG_IN_SUCCESS
                | EventId.EVENT_CONNECT_WALLET_SUCCESS
                | EventId.EVENT_CHANGE_WALLET_SUCCESS
                | EventId.EVENT_CLAIM_BASIC_SUCCESS
                | EventId.EVENT_CLAIM_PREMIUM_SUCCESS,
        >(
            eventId: E,
            params: Omit<Events[E]['parameters'], 'firefly_account_id' | 'activity'> & {
                firefly_account_id?: string;
            },
        ) => {
            return captureActivityEvent(eventId, {
                ...params,
                firefly_account_id: fireflyAccountId,
            });
        },
        [fireflyAccountId],
    );
}
