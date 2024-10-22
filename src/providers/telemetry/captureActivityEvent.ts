import { runInSafe } from '@/helpers/runInSafe.js';
import { TelemetryProvider } from '@/providers/telemetry/index.js';
import { type EventId, type Events, VersionFilter } from '@/providers/types/Telemetry.js';
import { useFireflyStateStore } from '@/store/useProfileStore.js';

export function captureActivityEvent<
    E extends
        | EventId.EVENT_SHARE_CLICK
        | EventId.EVENT_X_LOG_IN_SUCCESS
        | EventId.EVENT_CONNECT_WALLET_SUCCESS
        | EventId.EVENT_CHANGE_WALLET_SUCCESS
        | EventId.EVENT_CLAIM_BASIC_SUCCESS
        | EventId.EVENT_CLAIM_PREMIUM_SUCCESS
        | EventId.EVENT_SHARE_AND_POST_SUCCESS,
>(eventId: E, params: Events[E]['parameters']) {
    runInSafe(() => {
        const fireflyAccountId = useFireflyStateStore.getState().currentProfileSession?.profileId as string | null;
        TelemetryProvider.captureEvent(
            eventId,
            { ...params, firefly_account_id: fireflyAccountId },
            {
                version_filter: VersionFilter.Next,
            },
        );
    });
}
