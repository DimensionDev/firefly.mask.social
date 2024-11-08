import { safeUnreachable } from '@masknet/kit';

import { type SocialSource, Source } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';
import { getProfileState } from '@/helpers/getProfileState.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { TelemetryProvider } from '@/providers/telemetry/index.js';
import type { Account } from '@/providers/types/Account.js';
import { EventId } from '@/providers/types/Telemetry.js';

const resolveLoginEventId = createLookupTableResolver<SocialSource, EventId>(
    {
        [Source.Farcaster]: EventId.FARCASTER_LOG_IN_SUCCESS,
        [Source.Lens]: EventId.LENS_ACCOUNT_LOG_IN_SUCCESS,
        [Source.Twitter]: EventId.X_ACCOUNT_LOG_IN_SUCCESS,
    },
    (source) => {
        throw new UnreachableError('source', source);
    },
);

const resolveLogoutEventId = createLookupTableResolver<SocialSource, EventId>(
    {
        [Source.Farcaster]: EventId.FARCASTER_LOG_OUT_SUCCESS,
        [Source.Lens]: EventId.LENS_ACCOUNT_LOG_OUT_SUCCESS,
        [Source.Twitter]: EventId.X_ACCOUNT_LOG_OUT_SUCCESS,
    },
    (source) => {
        throw new UnreachableError('source', source);
    },
);

const resolveDisconnectEventId = createLookupTableResolver<SocialSource, EventId>(
    {
        [Source.Farcaster]: EventId.FARCASTER_ACCOUNT_DISCONNECT_SUCCESS,
        [Source.Lens]: EventId.LENS_ACCOUNT_DISCONNECT_SUCCESS,
        [Source.Twitter]: EventId.X_ACCOUNT_DISCONNECT_SUCCESS,
    },
    (source) => {
        throw new UnreachableError('source', source);
    },
);

function getAccountEventParameters(account: Account) {
    const source = account.profile.source;
    const accounts = getProfileState(source).accounts.map((x) => [x.profile.profileId, x.profile.handle]) as Array<
        [string, string]
    >;

    switch (source) {
        case Source.Farcaster:
            return {
                is_token_sync: account.origin === 'sync',
                farcaster_id: account.profile.profileId,
                farcaster_handle: account.profile.handle,
                farcaster_accounts: accounts,
            };
        case Source.Lens:
            return {
                is_token_sync: account.origin === 'sync',
                lens_id: account.profile.profileId,
                lens_handle: account.profile.handle,
                lens_accounts: accounts,
            };
        case Source.Twitter:
            return {
                is_token_sync: account.origin === 'sync',
                x_id: account.profile.profileId,
                x_handle: account.profile.handle,
                x_accounts: accounts,
            };
        default:
            safeUnreachable(source);
            throw new UnreachableError('source', source);
    }
}

function getAccountDisconnectEventParameters(account: Account) {
    const source = account.profile.source;
    const accounts = getProfileState(source).accounts.map((x) => [x.profile.profileId, x.profile.handle]) as Array<
        [string, string]
    >;

    switch (source) {
        case Source.Farcaster:
            return {
                is_token_sync: account.origin === 'sync',
                farcaster_id: account.profile.profileId,
                farcaster_handle: account.profile.handle,
            };
        case Source.Lens:
            return {
                is_token_sync: account.origin === 'sync',
                lens_id: account.profile.profileId,
                lens_handle: account.profile.handle,
            };
        case Source.Twitter:
            return {
                is_token_sync: account.origin === 'sync',
                x_id: account.profile.profileId,
                x_handle: account.profile.handle,
            };
        default:
            safeUnreachable(source);
            throw new UnreachableError('source', source);
    }
}

export function captureAccountLoginEvent(account: Account) {
    return runInSafeAsync(() => {
        const source = account.profile.source;
        return TelemetryProvider.captureEvent(resolveLoginEventId(source), getAccountEventParameters(account));
    });
}

export function captureAccountLogoutEvent(account: Account) {
    return runInSafeAsync(() => {
        const source = account.profile.source;
        return TelemetryProvider.captureEvent(resolveLogoutEventId(source), getAccountEventParameters(account));
    });
}

export function captureAccountDisconnectEvent(account: Account) {
    return runInSafeAsync(() => {
        const source = account.profile.source;
        return TelemetryProvider.captureEvent(
            resolveDisconnectEventId(source),
            getAccountDisconnectEventParameters(account),
        );
    });
}

export function captureAccountLogoutAllEvent(accounts: Account[]) {
    return runInSafeAsync(async () => {
        await Promise.all(accounts.map((account) => captureAccountLogoutEvent(account)));
        await TelemetryProvider.captureEvent(EventId.ACCOUNT_LOG_OUT_ALL_SUCCESS, {});
    });
}
