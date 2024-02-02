import type { FrameButton } from '@/types/frame.js';

export function getImageUrl(document: Document): string | null {
    const meta = document.querySelector('meta[name="fc:frame:image"]');
    if (meta) return meta.getAttribute('content');
    return null;
}

export function getVersion(document: Document): 'vNext' | null {
    const meta = document.querySelector('meta[name="fc:frame"]');
    if (meta) {
        const version = meta.getAttribute('content');
        if (version !== 'vNext') return null;
        return 'vNext';
    }
    return null;
}

export function getButtons(document: Document): FrameButton[] {
    return [];
}
