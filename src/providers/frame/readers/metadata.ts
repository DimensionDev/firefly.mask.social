import { compact, last } from 'lodash-es';

import { FrameProtocol } from '@/constants/enum.js';
import { getMetaContent } from '@/helpers/getMetaContent.js';
import { q, qsAll } from '@/helpers/q.js';
import { ActionType, type FrameButton, type FrameInput } from '@/types/frame.js';

/**
 * Get content of frame meta tag with frame client protocol
 * @param document
 * @param criteria
 * @returns
 */
function getFrameMetaContent(
    document: Document,
    criteria: Record<Exclude<ReturnType<typeof getProtocol>, undefined>, string> & { og?: string },
) {
    const protocol = getProtocol(document);
    if (!protocol) return null;

    const selector = criteria[protocol];
    const content = getMetaContent(document, selector);
    if (content) return content;

    return criteria.og ? getMetaContent(document, criteria.og) : null;
}

export function getTitle(document: Document): string | null {
    return (
        getFrameMetaContent(document, {
            of: 'of:title',
            fc: 'fc:frame:title',
            og: 'og:title',
        }) ||
        document.querySelector('title')?.textContent ||
        document.domain
    );
}

export function getVersion(document: Document): string | null {
    return getFrameMetaContent(document, {
        of: 'of:version',
        fc: 'fc:frame',
    });
}

export function getImageUrl(document: Document): string | null {
    return getFrameMetaContent(document, {
        of: 'of:image',
        fc: 'fc:frame:image',
        og: 'og:image',
    });
}

export function getImageAlt(document: Document): string | null {
    return getFrameMetaContent(document, {
        of: 'of:image:alt', // not exist in spec
        fc: 'fc:frame:image:alt',
    });
}

export function getPostUrl(document: Document): string | null {
    return getFrameMetaContent(document, {
        of: 'of:post_url',
        fc: 'fc:frame:post_url',
    });
}

export function getRefreshPeriod(document: Document): number | null {
    const period = getFrameMetaContent(document, {
        of: 'of:refresh_period',
        fc: 'fc:frame:refresh_period',
    });
    if (!period) return null;

    const parsedPeriod = Number.parseInt(period, 10);
    if (Number.isNaN(parsedPeriod) || parsedPeriod < 0) return null;

    return parsedPeriod;
}

export function getInput(document: Document): FrameInput | null {
    const label = getFrameMetaContent(document, {
        of: 'of:input:text',
        fc: 'fc:frame:input:text',
    });
    if (!label) return null;

    return { label };
}

export function getButtons(document: Document): FrameButton[] {
    const protocol = getProtocol(document);
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
                getFrameMetaContent(document, {
                    of: `of:button:${index}:action`,
                    fc: `fc:frame:button:${index}:action`,
                }) || ActionType.Post;
            const target = getFrameMetaContent(document, {
                of: `of:button:${index}:target`,
                fc: `fc:frame:button:${index}:target`,
            });
            const postUrl = getFrameMetaContent(document, {
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
        getFrameMetaContent(document, {
            of: 'of:aspect_ratio',
            fc: 'fc:frame:aspect_ratio',
        }) ||
        getFrameMetaContent(document, {
            of: 'of:image:aspect_ratio',
            fc: 'fc:frame:image:aspect_ratio',
        }) ||
        '1.91:1';
    return aspect === '1:1' ? '1:1' : '1.91:1';
}

export function getState(document: Document) {
    return getFrameMetaContent(document, {
        of: 'of:state',
        fc: 'fc:frame:state',
    });
}

export function getProtocol(document: Document, strict = false) {
    const ofVersion = q(document, 'of:version')?.getAttribute('content');
    if (ofVersion) {
        if (!strict) {
            const ofButtons = qsAll(document, 'of:button:');
            const fcButtons = qsAll(document, 'fc:frame:button:');
            if (!ofButtons.length && fcButtons.length) return FrameProtocol.Farcaster; // farcaster
        }

        return FrameProtocol.OpenFrame; // open frame
    }

    const fcVersion = q(document, 'fc:frame')?.getAttribute('content');
    if (fcVersion) return FrameProtocol.Farcaster; // farcaster

    return;
}
