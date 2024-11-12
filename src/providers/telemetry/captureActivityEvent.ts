import { parseURL } from '@masknet/shared-base';

import { bom } from '@/helpers/bom.js';
import { ReferralAccountPlatform } from '@/helpers/resolveActivityUrl.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { getPublicParameters } from '@/providers/telemetry/getPublicParameters.js';
import { TelemetryProvider } from '@/providers/telemetry/index.js';
import { EventId, type Events } from '@/providers/types/Telemetry.js';

export function captureActivityEvent<
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
) {
    if (!params.firefly_account_id) delete params.firefly_account_id; // filter undefined or null
    const url = parseURL(window.location.href);
    const referralCode = url?.searchParams.get('r');
    const referralParams =
        [
            EventId.EVENT_CONNECT_WALLET_SUCCESS,
            EventId.EVENT_CHANGE_WALLET_SUCCESS,
            EventId.EVENT_CLAIM_BASIC_SUCCESS,
            EventId.EVENT_CLAIM_PREMIUM_SUCCESS,
        ].includes(eventId) &&
        referralCode &&
        url?.searchParams.get('p') === ReferralAccountPlatform.X
            ? {
                  referral_x_handle: referralCode,
              }
            : {};

    return runInSafeAsync(() => {
        return TelemetryProvider.captureEvent(
            eventId,
            {
                activity: bom.location?.href,
                ...referralParams,
                ...getPublicParameters(eventId, null),
                ...params,
            } as Events[E]['parameters'],
            {},
        );
    });
}
