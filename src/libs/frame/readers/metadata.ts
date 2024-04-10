import { compact, last } from 'lodash-es';

import { getMetaValue, qsAll } from '@/helpers/q.js';
import { ActionType, type FrameButton, type FrameInput } from '@/types/frame.js';

export function getTitle(document: Document): string | null {
    return (
        getMetaValue(document, 'fc:frame:title') ||
        getMetaValue(document, 'og:title') ||
        document.querySelector('title')?.textContent ||
        document.domain
    );
}

export function getVersion(document: Document): 'vNext' | null {
    const version = getMetaValue(document, 'fc:frame');
    return version === 'vNext' ? 'vNext' : null;
}

export function getImageUrl(document: Document): string | null {
    return getMetaValue(document, 'fc:frame:image') || getMetaValue(document, 'og:image') || null;
}

export function getPostUrl(document: Document): string | null {
    return getMetaValue(document, 'fc:frame:post_url');
}

export function getRefreshPeriod(document: Document): number | null {
    const period = getMetaValue(document, 'fc:frame:refresh_period');
    if (!period) return null;

    const parsedPeriod = Number.parseInt(period, 10);
    if (Number.isNaN(parsedPeriod) || parsedPeriod < 0) return null;

    return parsedPeriod;
}

export function getInput(document: Document): FrameInput | null {
    const label = getMetaValue(document, 'fc:frame:input:text');
    if (label) return { label };
    return null;
}

export function getButtons(document: Document): FrameButton[] {
    const metas = qsAll(document, 'fc:frame:button');

    return compact<FrameButton>(
        Array.from(metas).map((meta) => {
            const index = last((meta.getAttribute('name') ?? meta.getAttribute('property'))?.split(':'));
            const text = meta.getAttribute('content');

            if (!index || !text) return null;

            const parsedIndex = Number.parseInt(index, 10);
            if (Number.isNaN(parsedIndex) || parsedIndex < 1 || parsedIndex > 4) return null;

            const action = getMetaValue(document, `fc:frame:button:${parsedIndex}:action`) || ActionType.Post;
            const target = getMetaValue(document, `fc:frame:button:${parsedIndex}:target`);

            return {
                index: parsedIndex,
                text,
                action,
                target,
            } as FrameButton;
        }),
    ).sort((a, z) => a.index - z.index);
}

export function getAspectRatio(doc: Document): '1.91:1' | '1:1' {
    const aspect =
        getMetaValue(doc, 'fc:frame:aspect_ratio') || getMetaValue(doc, 'fc:frame:image:aspect_ratio') || '1.91:1';
    return aspect === '1:1' ? '1:1' : '1.91:1';
}

export function getState(document: Document) {
    return getMetaValue(document, 'fc:frame:state');
}
