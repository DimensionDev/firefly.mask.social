import { compact, last } from 'lodash-es';

import { q, qsAll } from '@/helpers/q.js';
import type { FrameButton } from '@/types/frame.js';

export function getTitle(document: Document): string | null {
    return (
        q(document, 'fc:frame:title')?.getAttribute('content') ??
        q(document, 'og:title')?.getAttribute('content') ??
        document.querySelector('title')?.textContent ??
        document.domain
    );
}

export function getVersion(document: Document): 'vNext' | null {
    const version = q(document, 'fc:frame')?.getAttribute('content');
    return version === 'vNext' ? 'vNext' : null;
}

export function getImageUrl(document: Document): string | null {
    return (
        q(document, 'fc:frame:image')?.getAttribute('content') ??
        q(document, 'og:image')?.getAttribute('content') ??
        null
    );
}

export function getPostUrl(document: Document): string | null {
    return q(document, 'fc:frame:post_url')?.getAttribute('content') ?? null;
}

export function getRefreshPeriod(document: Document): number | null {
    const period = q(document, 'fc:frame:refresh_period')?.getAttribute('content') ?? null;
    if (!period) return null;

    const parsedPeriod = Number.parseInt(period, 10);
    if (Number.isNaN(parsedPeriod) || parsedPeriod < 0) return null;

    return parsedPeriod;
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

            const action = q(document, `fc:frame:button:${parsedIndex}:action`)?.getAttribute('content');

            return {
                index: parsedIndex,
                text,
                action: action && ['post', 'post_redirect'].includes(action) ? action : 'post',
            } as FrameButton;
        }),
    ).sort((a, z) => a.index - z.index);
}
