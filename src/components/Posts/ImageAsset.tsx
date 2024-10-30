'use client';
import { memo, type SyntheticEvent, useCallback, useState } from 'react';

import { Image, type ImageProps } from '@/components/Image.js';
import { useMounted } from '@/hooks/useMounted.js';

export interface ImageAssetProps extends ImageProps {
    disableLoadHandler?: boolean;
    overSize?: boolean;
}

const imageRatioCache = new Map<string, string>();

const setImageCache = (key: string, value: string) => {
    imageRatioCache.set(key, value);
    const size = imageRatioCache.size;
    if (size > 100) {
        const keys = Array.from(imageRatioCache.keys()).slice(0, size - 100);
        keys.forEach((k) => imageRatioCache.delete(k));
    }
};

const getImageCache = (key: string) => {
    const value = imageRatioCache.get(key);
    if (value) {
        imageRatioCache.delete(key);
        imageRatioCache.set(key, value);
    }
    return value;
};

const getImageCacheKey = (src: ImageProps['src']) => {
    if (typeof src === 'string') return src;
    if ('src' in src) return src.src;
    return src.default.src;
};

export const ImageAsset = memo<ImageAssetProps>(function ImageAsset({ disableLoadHandler, overSize = true, ...props }) {
    const cacheKey = getImageCacheKey(props.src);
    const ratioCache = getImageCache(cacheKey);
    const [imageProps, setImageProps] = useState<Partial<ImageProps>>(
        ratioCache ? { style: { aspectRatio: ratioCache } } : {},
    );
    const mounted = useMounted();

    const handleLoad = useCallback(
        (event: SyntheticEvent<HTMLImageElement>) => {
            if (disableLoadHandler) return;

            const width = event.currentTarget.naturalWidth || event.currentTarget.width;
            const height = event.currentTarget.naturalHeight || event.currentTarget.height;

            if (overSize && (height < 50 || height > 750)) {
                setImageCache(cacheKey, '16 / 9');
                setImageProps({
                    style: {
                        aspectRatio: '16 / 9',
                        objectFit: 'cover',
                        minHeight: 50,
                        maxHeight: 750,
                        ...props.style,
                    },
                });
            } else {
                setImageCache(cacheKey, `${width} / ${height}`);
                setImageProps({
                    style: {
                        aspectRatio: `${width} / ${height}`,
                        minHeight: 50,
                        maxHeight: 750,
                        maxWidth: '100%',
                        width: width < 200 ? '100%' : undefined,
                        ...props.style,
                    },
                });
            }
        },
        [disableLoadHandler, props.style, cacheKey, overSize],
    );

    if (!mounted) return;

    return <Image onLoad={handleLoad} {...props} {...imageProps} alt={props.alt || ''} />;
});
