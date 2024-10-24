import { runInSafe } from '@/helpers/runInSafe.js';
import { getPublicParameters } from '@/providers/telemetry/getPublicParameters.js';
import { TelemetryProvider } from '@/providers/telemetry/index.js';
import { type EventId, type Events } from '@/providers/types/Telemetry.js';

export function captureActivityEvent<
    E extends
        | EventId.EVENT_SHARE_CLICK
        | EventId.EVENT_X_LOG_IN_SUCCESS
        | EventId.EVENT_CONNECT_WALLET_SUCCESS
        | EventId.EVENT_CHANGE_WALLET_SUCCESS
        | EventId.EVENT_CLAIM_BASIC_SUCCESS
        | EventId.EVENT_CLAIM_PREMIUM_SUCCESS
        | EventId.EVENT_SHARE_AND_POST_SUCCESS,
>(
    eventId: E,
    params: Omit<Events[E]['parameters'], 'firefly_account_id'> & {
        firefly_account_id?: string;
    },
) {
    if (!params.firefly_account_id) delete params.firefly_account_id; // filter undefined or null
    runInSafe(() => {
        TelemetryProvider.captureEvent(
            eventId,
            {
                ...getPublicParameters(eventId, null),
                ...params,
            } as Events[E]['parameters'],
            {},
        );
    });
}
