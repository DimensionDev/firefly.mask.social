import { safeUnreachable } from '@masknet/kit';
import urlcat from 'urlcat';

import { InvalidResultError, TimeoutError, UnreachableError, UserRejectionError } from '@/constants/error.js';
import { createDummyProfileFromFireflyAccountId } from '@/helpers/createDummyProfile.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
import { retry } from '@/helpers/retry.js';
import { FireflySession } from '@/providers/firefly/Session.js';
import type { LinkInfoResponse, SessionStatusResponse } from '@/providers/types/Firefly.js';
import { settings } from '@/settings/index.js';

async function pollSessionStatus(session: string, signal?: AbortSignal) {
    return retry(
        async (pollingSignal) => {
            const url = urlcat(settings.FIREFLY_ROOT_URL, '/desktop/status');
            const response = await fetchJSON<SessionStatusResponse>(url, {
                method: 'POST',
                body: JSON.stringify({
                    session,
                }),
                signal: pollingSignal,
            });

            const status = resolveFireflyResponseData(response);
            const status_ = status.status;

            switch (status_) {
                case 'confirm':
                case 'cancel':
                case 'expired':
                    return status;
                case 'pending':
                    // continue polling
                    throw new InvalidResultError();
                default:
                    safeUnreachable(status_);
                    throw new UnreachableError('session status', status_);
            }
        },
        {
            times: Number.MAX_SAFE_INTEGER,
            interval: 1000,
            signal,
        },
    );
}

async function createSession(callback?: (url: string) => void, signal?: AbortSignal) {
    const url = urlcat(settings.FIREFLY_ROOT_URL, '/desktop/linkInfo');
    const response = await fetchJSON<LinkInfoResponse>(url, {
        method: 'GET',
        signal,
    });

    const linkInfo = resolveFireflyResponseData(response);

    // present QR code to the user or open the link in a new tab
    callback?.(linkInfo.link);

    const result = await pollSessionStatus(linkInfo.session, signal);
    const status = result.status;

    switch (status) {
        case 'confirm':
            return new FireflySession(result.accountId, result.accessToken, null, null, false);
        case 'cancel':
            throw new UserRejectionError();
        case 'expired':
            throw new TimeoutError();
        default:
            safeUnreachable(status);
            throw new UnreachableError('session status', status);
    }
}

export async function createAccountByGrantPermission(callback?: (url: string) => void, signal?: AbortSignal) {
    const session = await createSession(callback, signal);
    return {
        session,
        profile: createDummyProfileFromFireflyAccountId(session.profileId),
    };
}
