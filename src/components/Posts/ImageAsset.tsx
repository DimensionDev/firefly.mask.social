'use client';
import { memo, type SyntheticEvent, useCallback, useState } from 'react';

import { Image, type ImageProps } from '@/components/Image.js';
import { useMounted } from '@/hooks/useMounted.js';

export interface ImageAssetProps extends ImageProps {
    disableLoadHandler?: boolean;
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

export const ImageAsset = memo<ImageAssetProps>(function ImageAsset({ disableLoadHandler, ...props }) {
    const cacheKey = getImageCacheKey(props.src);
    const ratioCache = getImageCache(cacheKey);
    const [imageProps, setImageProps] = useState<Partial<ImageProps>>(
        ratioCache ? { style: { aspectRatio: ratioCache } } : {},
    );
    const mounted = useMounted();

    const handleLoad = useCallback(
        (event: SyntheticEvent<HTMLImageElement>) => {
            if (disableLoadHandler) return;
            const height = event.currentTarget.height;

            if (height < 50 || height > 682) {
                setImageCache(cacheKey, '16 / 9');
                setImageProps({
                    style: {
                        aspectRatio: '16 / 9',
                        objectFit: 'cover',
                        minHeight: 50,
                        maxHeight: 682,
                        ...props.style,
                    },
                });
            } else {
                setImageCache(cacheKey, `${event.currentTarget.width} / ${height}`);
                setImageProps({
                    style: {
                        aspectRatio: `${event.currentTarget.width} / ${height}`,
                        minHeight: 50,
                        maxHeight: 682,
                        ...props.style,
                    },
                });
            }
        },
        [disableLoadHandler, props.style],
    );

    if (!mounted) return;

    return <Image onLoad={handleLoad} {...props} {...imageProps} alt={props.alt || ''} />;
});
