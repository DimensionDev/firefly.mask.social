import { delay } from '@masknet/kit';
import { once } from 'lodash-es';
import { v4 as uuid } from 'uuid';

import { IS_IOS } from '@/constants/bowser.js';
import { env } from '@/constants/env.js';
import type { Schemes } from '@/types/device.js';

const eventIdSet = new Set<string>();

const initListener = once(() => {
    window.addEventListener('pagehide', () => {
        eventIdSet.clear();
    });
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            eventIdSet.clear();
        }
    });
});

async function tryOpenScheme(tagType: 'a' | 'iframe', scheme: string) {
    // fallback to download link if the scheme is not supported
    if (!scheme) window.location.href = env.external.NEXT_PUBLIC_FIREFLY_DOWNLOAD_LINK;

    initListener();

    const element = document.createElement(tagType);
    element.style.display = 'none';
    const isAnchor = element instanceof HTMLAnchorElement;
    if (isAnchor) {
        element.href = scheme;
    } else {
        element.src = scheme;
    }

    document.body.appendChild(element);
    if (isAnchor) element.click();
    const eventId = uuid();
    eventIdSet.add(eventId);
    await delay(3500);
    document.body.removeChild(element);

    // app not installed since the page is still visible
    if (document.visibilityState === 'visible' && eventIdSet.has(eventId)) {
        eventIdSet.delete(eventId);
        window.location.href = env.external.NEXT_PUBLIC_FIREFLY_DOWNLOAD_LINK;
        await delay(1000);
    }
}

export async function openAppSchemes(schemes: Schemes) {
    if (IS_IOS) {
        if (typeof window.webkit !== 'undefined' && window.webkit.messageHandlers[schemes.ios]) {
            window.location.href = schemes.ios;
        } else {
            // < ios 9
            await tryOpenScheme('iframe', schemes.ios);
        }
    } else {
        await tryOpenScheme('a', schemes.android);
    }
}
