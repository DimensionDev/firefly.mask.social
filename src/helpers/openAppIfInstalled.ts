import { delay } from '@masknet/kit';
import { once } from 'lodash-es';
import { v4 as uuid } from 'uuid';

import type { ComposedScheme } from '@/components/OpenFireflyAppButton.jsx';
import { IS_IOS } from '@/constants/bowser.js';

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

async function tryOpenScheme(tagType: 'a' | 'iframe', scheme: string, downloadUrl: string, waitDuration: number) {
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
    await delay(waitDuration);
    document.body.removeChild(element);
    if (document.visibilityState === 'visible' && eventIdSet.has(eventId)) {
        eventIdSet.delete(eventId);
        window.location.href = downloadUrl;
        await delay(1000);
    }
}

export async function openAppIfInstalled(scheme: ComposedScheme, downloadUrl: string, waitDuration = 3500) {
    initListener();
    if (IS_IOS) {
        if (typeof window.webkit !== 'undefined' && window.webkit.messageHandlers[scheme.ios]) {
            window.location.href = scheme.ios;
        } else {
            // < ios 9
            await tryOpenScheme('iframe', scheme.ios, downloadUrl, waitDuration);
        }
    } else {
        await tryOpenScheme('a', scheme.android, downloadUrl, waitDuration);
    }
}
