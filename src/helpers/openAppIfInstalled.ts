import { delay } from '@masknet/kit';

import { IS_IOS } from '@/constants/bowser.js';

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
    await delay(waitDuration);
    document.body.removeChild(element);
    if (document.visibilityState === 'visible') {
        window.location.href = downloadUrl;
        await delay(1000);
    }
}

export async function openAppIfInstalled(scheme: string, downloadUrl: string, waitDuration = 3500) {
    if (IS_IOS) {
        if (typeof window.webkit !== 'undefined' && window.webkit.messageHandlers[scheme]) {
            window.location.href = scheme;
        } else {
            // < ios 9
            await tryOpenScheme('iframe', scheme, downloadUrl, waitDuration);
        }
    } else {
        await tryOpenScheme('a', scheme, downloadUrl, waitDuration);
    }
}
