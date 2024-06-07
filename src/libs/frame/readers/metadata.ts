import { compact, last } from 'lodash-es';

import { getMetaContent } from '@/helpers/getMetaContent.js';
import { qs,qsAll } from '@/helpers/q.js';
import { ActionType, type FrameButton, type FrameInput } from '@/types/frame.js';

export function getClientProtocol(document: Document) {
    const openFrameProtocol = qs(document, 'of:accepts:');
    const openFrameVersion = getMetaContent(document, 'of:version');
    return openFrameProtocol && openFrameVersion ? 'of' : 'fc:frame';
}

export function getTitle(document: Document): string | null {
    return (
        getMetaContent(document, `${getClientProtocol(document)}:title`) ||
        getMetaContent(document, 'og:title') ||
        document.querySelector('title')?.textContent ||
        document.domain
    );
}

export function getVersion(document: Document): 'vNext' | null {
    const protocol = getClientProtocol(document);
    const version = getMetaContent(document, protocol === 'of' ? 'of:version' : protocol);
    return version === 'vNext' ? 'vNext' : null;
}

export function getImageUrl(document: Document): string | null {
    return getMetaContent(document, `${getClientProtocol(document)}:image`) || getMetaContent(document, 'og:image') || null;
}

export function getPostUrl(document: Document): string | null {
    return getMetaContent(document, `${getClientProtocol(document)}:post_url`);
}

export function getRefreshPeriod(document: Document): number | null {
    const period = getMetaContent(document, `${getClientProtocol(document)}:refresh_period`);
    if (!period) return null;

    const parsedPeriod = Number.parseInt(period, 10);
    if (Number.isNaN(parsedPeriod) || parsedPeriod < 0) return null;

    return parsedPeriod;
}

export function getInput(document: Document): FrameInput | null {
    const label = getMetaContent(document, `${getClientProtocol(document)}:input:text`);
    if (label) return { label };
    return null;
}

export function getButtons(document: Document): FrameButton[] {
    const protocol = getClientProtocol(document);
    const metas = qsAll(document, `${protocol}:button:`);

    return compact<FrameButton>(
        Array.from(metas).map((meta) => {
            const raw = last((meta.getAttribute('name') || meta.getAttribute('property'))?.split(':'));
            const text = meta.getAttribute('content');

            if (!raw || !text) return null;

            const index = Number.parseInt(raw, 10);
            if (Number.isNaN(index) || index < 1 || index > 4) return null;

            const action = getMetaContent(document, `${protocol}:button:${index}:action`) || ActionType.Post;
            const target = getMetaContent(document, `${protocol}:button:${index}:target`);
            const postUrl = getMetaContent(document, `${protocol}:button:${index}:post_url`);

            return {
                index,
                text,
                action,
                target,
                postUrl,
            } as FrameButton;
        }),
    ).sort((a, z) => a.index - z.index);
}

export function getAspectRatio(doc: Document): '1.91:1' | '1:1' {
    const protocol = getClientProtocol(doc);
    const aspect =
        getMetaContent(doc, `${protocol}:aspect_ratio`) || getMetaContent(doc, `${protocol}:image:aspect_ratio`) || '1.91:1';
    return aspect === '1:1' ? '1:1' : '1.91:1';
}

export function getState(document: Document) {
    return getMetaContent(document, `${getClientProtocol(document)}:state`);
}
