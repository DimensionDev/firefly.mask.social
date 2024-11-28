'use client';

import urlcat from 'urlcat';

import { type SocialSource, Source } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';
import { memoizePromise } from '@/helpers/memoizePromise.js';
import { parseUrl } from '@/helpers/parseUrl.js';
import { ReferralAccountPlatform } from '@/helpers/resolveActivityUrl.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { getAccountEventParameters } from '@/providers/telemetry/captureAccountEvent.js';
import { getPublicParameters } from '@/providers/telemetry/getPublicParameters.js';
import { TelemetryProvider } from '@/providers/telemetry/index.js';
import type { Account } from '@/providers/types/Account.js';
import type { WalletProfileResponse } from '@/providers/types/Firefly.js';
import { EventId, type Events } from '@/providers/types/Telemetry.js';
import { settings } from '@/settings/index.js';

const resolveActivityLoginEventId = createLookupTableResolver<SocialSource, EventId>(
    {
        [Source.Twitter]: EventId.EVENT_X_LOG_IN_SUCCESS,
        [Source.Farcaster]: EventId.EVENT_FARCASTER_LOG_IN_SUCCESS,
        [Source.Lens]: EventId.EVENT_LENS_LOG_IN_SUCCESS,
    },
    (source) => {
        throw new UnreachableError('source', source);
    },
);

const getFireflyWalletProfile = memoizePromise(
    async function getFireflyWalletProfile() {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/wallet/profile');
        const response = await fireflySessionHolder.fetchWithSession<WalletProfileResponse>(url);
        return resolveFireflyResponseData(response);
    },
    () => 'firefly-wallet-profile',
);

export async function captureActivityEvent<E extends EventId>(
    eventId: E,
    params: Omit<Events[E]['parameters'], 'firefly_account_id' | 'activity'> & {
        firefly_account_id?: string;
    },
) {
    if (!params.firefly_account_id) delete params.firefly_account_id; // filter undefined or null

    if (fireflyBridgeProvider.supported) {
        const response = await getFireflyWalletProfile();
        if (response?.fireflyAccountId) params.firefly_account_id = response.fireflyAccountId;
    }

    const url = parseUrl(window.location.href);
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
                ...referralParams,
                ...getPublicParameters(eventId, null),
                ...params,
            } as Events[E]['parameters'],
            {},
        );
    });
}

export async function captureActivityLoginEvent(account: Account) {
    return runInSafeAsync(async () => {
        const source = account.profile.source;
        await captureActivityEvent(resolveActivityLoginEventId(source), getAccountEventParameters(account));
    });
}

export async function captureActivityLoginEventBySocialSource(source: SocialSource) {
    return runInSafeAsync(async () => {
        await captureActivityEvent(resolveActivityLoginEventId(source), {});
    });
}
