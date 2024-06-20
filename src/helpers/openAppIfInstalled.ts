const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const tryOpenScheme = async (tagType: 'a' | 'iframe', scheme: string, downloadUrl: string, waitDuration: number) => {
    const element = document.createElement(tagType);
    element.style.display = 'none';
    const isAnchor = element instanceof HTMLAnchorElement;
    if (isAnchor) {
        element.href = scheme;
    } else {
        element.src = scheme;
    }
    document.body.appendChild(element);
    isAnchor && element.click();
    await sleep(waitDuration);
    document.body.removeChild(element);
    if (document.visibilityState === 'visible') {
        window.location.href = downloadUrl;
        await sleep(1000);
    }
};

export const openAppIfInstalled = async (scheme: string, downloadUrl: string, waitDuration = 3500) => {
    if (navigator.userAgent.match(/(iPhone|iPod|iPad)/)) {
        if (typeof window.webkit !== 'undefined' && window.webkit.messageHandlers[scheme]) {
            window.location.href = scheme;
        } else {
            // < ios 9
            await tryOpenScheme('iframe', scheme, downloadUrl, waitDuration);
        }
    } else {
        await tryOpenScheme('a', scheme, downloadUrl, waitDuration);
    }
};
