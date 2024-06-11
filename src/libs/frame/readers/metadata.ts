import { compact, last } from 'lodash-es';

import { getFrameClientProtocol } from '@/helpers/getFrameClientProtocol.js';
import { getMetaContent } from '@/helpers/getMetaContent.js';
import { qsAll } from '@/helpers/q.js';
import { ActionType, type FrameButton, type FrameInput } from '@/types/frame.js';

export function getTitle(document: Document): string | null {
    return (
        getMetaContent(document, 'title', true) ||
        getMetaContent(document, 'og:title') ||
        document.querySelector('title')?.textContent ||
        document.domain
    );
}

export function getVersion(document: Document): 'vNext' | null {
    const protocol = getFrameClientProtocol(document);
    const version = getMetaContent(document, protocol === 'of' ? 'of:version' : protocol);
    return version === 'vNext' ? 'vNext' : null;
}

export function getImageUrl(document: Document): string | null {
    return (
        getMetaContent(document, 'image', true) ||
        getMetaContent(document, 'frame:image', true) ||
        getMetaContent(document, 'og:image') ||
        null
    );
}

export function getPostUrl(document: Document): string | null {
    return getMetaContent(document, 'post_url', true);
}

export function getRefreshPeriod(document: Document): number | null {
    const period = getMetaContent(document, 'refresh_period', true);
    if (!period) return null;

    const parsedPeriod = Number.parseInt(period, 10);
    if (Number.isNaN(parsedPeriod) || parsedPeriod < 0) return null;

    return parsedPeriod;
}

export function getInput(document: Document): FrameInput | null {
    const label = getMetaContent(document, 'input:text', true);
    if (label) return { label };
    return null;
}

export function getButtons(document: Document): FrameButton[] {
    const protocol = getFrameClientProtocol(document);
    const metas = qsAll(document, `${protocol}:button:`);

    return compact<FrameButton>(
        Array.from(metas).map((meta) => {
            const raw = last((meta.getAttribute('name') || meta.getAttribute('property'))?.split(':'));
            const text = meta.getAttribute('content');

            if (!raw || !text) return null;

            const index = Number.parseInt(raw, 10);
            if (Number.isNaN(index) || index < 1 || index > 4) return null;

            const action = getMetaContent(document, `button:${index}:action`, true) || ActionType.Post;
            const target = getMetaContent(document, `button:${index}:target`, true);
            const postUrl = getMetaContent(document, `button:${index}:post_url`, true);

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
        getMetaContent(doc, 'aspect_ratio', true) || getMetaContent(doc, 'image:aspect_ratio', true) || '1.91:1';
    return aspect === '1:1' ? '1:1' : '1.91:1';
}

export function getState(document: Document) {
    return getMetaContent(document, 'state', true);
}
