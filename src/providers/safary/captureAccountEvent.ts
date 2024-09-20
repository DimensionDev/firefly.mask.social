import { safeUnreachable } from "@masknet/kit";

import { type SocialSource,Source } from "@/constants/enum.js";
import { UnreachableError } from "@/constants/error.js";
import { createLookupTableResolver } from "@/helpers/createLookupTableResolver.js";
import { SafaryTelemetryProvider } from "@/providers/safary/Telemetry.js";
import type { Account } from "@/providers/types/Account.js";
import { EventId } from "@/providers/types/Telemetry.js";

const resolveLoginEventId = createLookupTableResolver<SocialSource, EventId>({
    [Source.Farcaster]: EventId.FARCASTER_LOG_IN_SUCCESS,
    [Source.Lens]: EventId.LENS_ACCOUNT_LOG_IN_SUCCESS,
    [Source.Twitter]: EventId.X_ACCOUNT_LOG_IN_SUCCESS,
}, (source) => {
    throw new UnreachableError('source', source);
})

const resolveLogoutEventId = createLookupTableResolver<SocialSource, EventId>({
    [Source.Farcaster]: EventId.FARCASTER_LOG_OUT_SUCCESS,
    [Source.Lens]: EventId.LENS_ACCOUNT_LOG_OUT_SUCCESS,
    [Source.Twitter]: EventId.X_ACCOUNT_LOG_OUT_SUCCESS,
}, (source) => {
    throw new UnreachableError('source', source);
})

function getAccountEventParameters(account: Account) {
    const source = account.profile.source

    switch (source) {
        case Source.Farcaster:
            return {
                farcaster_id: account.profile.profileId,
                farcaster_handle: account.profile.handle,
            }
        case Source.Lens:
            return {
                lens_id: account.profile.profileId,
                lens_handle: account.profile.handle,
            }
        case Source.Twitter:
            return {
                x_id: account.profile.profileId,
                x_handle: account.profile.handle,
            }
        default:
            safeUnreachable(source);
            throw new UnreachableError('source', source);
    }
}

export function captureAccountLoginInEvent(account: Account) {
    const source = account.profile.source

    SafaryTelemetryProvider.captureEvent(resolveLoginEventId(source), getAccountEventParameters(account));
}

export function captureAccountLoginOutEvent(account: Account) {
    const source = account.profile.source

    SafaryTelemetryProvider.captureEvent(resolveLogoutEventId(source), getAccountEventParameters(account));
}
