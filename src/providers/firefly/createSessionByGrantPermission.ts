import { safeUnreachable } from '@masknet/kit';
import urlcat from 'urlcat';

import { FIREFLY_DEV_ROOT_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { pollingWithRetry } from '@/helpers/pollWithRetry.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
import { FireflySession } from '@/providers/firefly/Session.js';
import type { LinkInfoResponse, SessionStatusResponse } from '@/providers/types/Firefly.js';

async function pollingSessionStatus(session: string, signal?: AbortSignal) {
    const checkStatus = async (s?: AbortSignal) => {
        const url = urlcat(FIREFLY_DEV_ROOT_URL, '/desktop/status', {
            session,
        });
        const response = await fetchJSON<SessionStatusResponse>(url, {
            method: 'GET',
            signal: s,
        });
        const status = resolveFireflyResponseData(response);
        return status;
    };

    return pollingWithRetry(checkStatus, {
        times: Number.MAX_SAFE_INTEGER,
        interval: 1000,
        signal,
    });
}

async function initialRequest(callback?: (url: string) => void, signal?: AbortSignal) {
    const url = urlcat(FIREFLY_DEV_ROOT_URL, '/desktop/linkInfo');
    const response = await fetchJSON<LinkInfoResponse>(url, {
        method: 'GET',
        signal,
    });
    const linkInfo = resolveFireflyResponseData(response);

    // present QR code to the user or open the link in a new tab
    callback?.(linkInfo.link);

    const result = await pollingSessionStatus(linkInfo.session, signal);
    const status = result.status;

    switch (status) {
        case 'confirm':
            return new FireflySession('', result.accessToken, null);
        case 'cancel':
            throw new Error('User canceled the session.');
        case 'expired':
            throw new Error('Session expired.');
        default:
            safeUnreachable(status);
            throw new Error(`Unexpected status: ${status}`);
    }
}

export async function createSessionByGrantPermission(callback?: (url: string) => void, signal?: AbortSignal) {
    const session = await initialRequest(callback, signal);

    return session;
}
