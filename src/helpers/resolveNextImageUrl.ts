import type { ImageProps } from 'next/image.js';

export function resolveNextImageUrl(src: ImageProps['src']) {
    if (typeof src === 'string') return src;
    if ('src' in src) return src.src;
    return src.default.src;
}
