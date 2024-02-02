import { q } from '@/helpers/q.js';
import type { FrameButton } from '@/types/frame.js';

export function getVersion(document: Document): 'vNext' | null {
    const version = q('fc:frame')?.getAttribute('content');
    return version === 'vNext' ? 'vNext' : null;
}

export function getImageUrlOG(document: Document): string | null {
    return q('og:image')?.getAttribute('content') ?? null;
}

export function getImageUrl(document: Document): string | null {
    return q('fc:frame:image')?.getAttribute('content') ?? null;
}

export function getButtons(document: Document): FrameButton[] {
    return [];
}
