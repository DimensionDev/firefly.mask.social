import { compact, last } from 'lodash-es';

import { getFrameClientProtocol } from '@/helpers/getFrameClientProtocol.js';
import { getMetaContent } from '@/helpers/getMetaContent.js';
import { qsAll } from '@/helpers/q.js';
import { ActionType, type FrameButton, type FrameInput } from '@/types/frame.js';

export function getTitle(document: Document): string | null {
    return (
        getMetaContent(document, {
            of: 'of:title',
            fc: 'fc:frame:title',
            og: 'og:title',
        }) ||
        document.querySelector('title')?.textContent ||
        document.domain
    );
}

export function getVersion(document: Document): string | null {
    return getMetaContent(document, {
        of: 'of:version',
        fc: 'fc:frame',
    });
}

export function getImageUrl(document: Document): string | null {
    return getMetaContent(document, {
        of: 'of:image',
        fc: 'fc:frame:image',
        og: 'og:image',
    });
}

export function getPostUrl(document: Document): string | null {
    return getMetaContent(document, {
        of: 'of:post_url',
        fc: 'fc:frame:post_url',
    });
}

export function getRefreshPeriod(document: Document): number | null {
    const period = getMetaContent(document, {
        of: 'of:refresh_period',
        fc: 'fc:frame:refresh_period',
    });
    if (!period) return null;

    const parsedPeriod = Number.parseInt(period, 10);
    if (Number.isNaN(parsedPeriod) || parsedPeriod < 0) return null;

    return parsedPeriod;
}

export function getInput(document: Document): FrameInput | null {
    const label = getMetaContent(document, {
        of: 'of:input:text',
        fc: 'fc:frame:input:text',
    });
    if (!label) return null;

    return { label };
}

export function getButtons(document: Document): FrameButton[] {
    const protocol = getFrameClientProtocol(document);
    if (!protocol) return [];

    const metas = qsAll(document, protocol === 'fc' ? `${protocol}:frame:button:` : `${protocol}:button:`);

    return compact<FrameButton>(
        Array.from(metas).map((meta) => {
            const raw = last((meta.getAttribute('name') || meta.getAttribute('property'))?.split(':'));
            const text = meta.getAttribute('content');

            if (!raw || !text) return null;

            const index = Number.parseInt(raw, 10);
            if (Number.isNaN(index) || index < 1 || index > 4) return null;

            const action =
                getMetaContent(document, {
                    of: `of:button:${index}:action`,
                    fc: `fc:frame:button:${index}:action`,
                }) || ActionType.Post;
            const target = getMetaContent(document, {
                of: `of:button:${index}:target`,
                fc: `fc:frame:button:${index}:target`,
            });
            const postUrl = getMetaContent(document, {
                of: `of:button:${index}:post_url`,
                fc: `fc:frame:button:${index}:post_url`,
            });

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

export function getAspectRatio(document: Document): '1.91:1' | '1:1' {
    const aspect =
        getMetaContent(document, {
            of: 'of:aspect_ratio',
            fc: 'fc:frame:aspect_ratio',
        }) ||
        getMetaContent(document, {
            of: 'of:image:aspect_ratio',
            fc: 'fc:frame:image:aspect_ratio',
        }) ||
        '1.91:1';
    return aspect === '1:1' ? '1:1' : '1.91:1';
}

export function getState(document: Document) {
    return getMetaContent(document, {
        of: 'of:state',
        fc: 'fc:frame:state',
    });
}
