import { FIREFLY_DEV_ROOT_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
import type { LinkInfoResponse } from '@/providers/types/Firefly.js';
import urlcat from 'urlcat';

async function pollingSessionStatus(session: string, signal?: AbortSignal) {
    const sessionStatus = null;
    return sessionStatus;
}

async function initialRequest(callback?: (url: string) => void, signal?: AbortSignal) {
    const url = urlcat(FIREFLY_DEV_ROOT_URL, '/desktop/linkInfo');
    const response = await fetchJSON<LinkInfoResponse>(url, {
        method: 'GET',
    });
    const linkInfo = resolveFireflyResponseData(response);

    // present QR code to the user or open the link in a new tab
    callback?.(linkInfo.link);

    const result = await pollingSessionStatus(linkInfo.session, signal);

    console.log('DEBUG: result');
    console.log(result);

    return {
        link: linkInfo.link,
        session: linkInfo.session,
    };
}

export async function createSessionByGrantPermission(callback?: (url: string) => void, signal?: AbortSignal) {
    const session = await initialRequest(callback, signal);

    return session;
}
