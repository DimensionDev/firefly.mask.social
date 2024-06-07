import { compact, last } from 'lodash-es';

import { getMetaContent } from '@/helpers/getMetaContent.js';
import { qsAll } from '@/helpers/q.js';
import { ActionType, type FrameButton, type FrameInput } from '@/types/frame.js';

export function getTitle(document: Document): string | null {
    return (
        getMetaContent(document, 'fc:frame:title') ||
        getMetaContent(document, 'og:title') ||
        document.querySelector('title')?.textContent ||
        document.domain
    );
}

export function getVersion(document: Document): 'vNext' | null {
    const version = getMetaContent(document, 'fc:frame');
    return version === 'vNext' ? 'vNext' : null;
}

export function getImageUrl(document: Document): string | null {
    return getMetaContent(document, 'fc:frame:image') || getMetaContent(document, 'og:image') || null;
}

export function getImageAlt(document: Document): string | null {
    return getMetaContent(document, 'fc:frame:image:alt') || null;
}

export function getPostUrl(document: Document): string | null {
    return getMetaContent(document, 'fc:frame:post_url');
}

export function getRefreshPeriod(document: Document): number | null {
    const period = getMetaContent(document, 'fc:frame:refresh_period');
    if (!period) return null;

    const parsedPeriod = Number.parseInt(period, 10);
    if (Number.isNaN(parsedPeriod) || parsedPeriod < 0) return null;

    return parsedPeriod;
}

export function getInput(document: Document): FrameInput | null {
    const label = getMetaContent(document, 'fc:frame:input:text');
    if (label) return { label };
    return null;
}

export function getButtons(document: Document): FrameButton[] {
    const metas = qsAll(document, 'fc:frame:button:');

    return compact<FrameButton>(
        Array.from(metas).map((meta) => {
            const raw = last((meta.getAttribute('name') || meta.getAttribute('property'))?.split(':'));
            const text = meta.getAttribute('content');

            if (!raw || !text) return null;

            const index = Number.parseInt(raw, 10);
            if (Number.isNaN(index) || index < 1 || index > 4) return null;

            const action = getMetaContent(document, `fc:frame:button:${index}:action`) || ActionType.Post;
            const target = getMetaContent(document, `fc:frame:button:${index}:target`);
            const postUrl = getMetaContent(document, `fc:frame:button:${index}:post_url`);

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
    const aspect =
        getMetaContent(doc, 'fc:frame:aspect_ratio') || getMetaContent(doc, 'fc:frame:image:aspect_ratio') || '1.91:1';
    return aspect === '1:1' ? '1:1' : '1.91:1';
}

export function getState(document: Document) {
    return getMetaContent(document, 'fc:frame:state');
}
