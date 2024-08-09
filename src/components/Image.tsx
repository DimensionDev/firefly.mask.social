import { kv } from '@vercel/kv';
import type { ImageProps as NextImageProps } from 'next/image.js';
import type { SyntheticEvent } from 'react';
import { forwardRef, useCallback, useEffect, useState } from 'react';

import { KeyType } from '@/constants/enum.js';
import { Image as NextImage } from '@/esm/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveNextImageUrl } from '@/helpers/resolveNextImageUrl.js';
import { useDarkMode } from '@/hooks/useDarkMode.js';

export interface ImageProps extends NextImageProps {
    fallback?: string;
    fallbackClassName?: string;
}

export const Image = forwardRef<HTMLImageElement, ImageProps>(function Image(
    { onError, fallback, fallbackClassName, style, onLoad, ...props },
    ref,
) {
    const [aspectRatio, setAspectRatio] = useState<string>();
    const [imageLoadFailed, setImageLoadFailed] = useState(false);
    const { isDarkMode } = useDarkMode();

    const handleError = useCallback(
        (e: SyntheticEvent<HTMLImageElement>) => {
            if (imageLoadFailed) {
                return;
            }
            setImageLoadFailed(true);
            if (onError) {
                onError(e);
            }
        },
        [imageLoadFailed, setImageLoadFailed, onError],
    );

    const handleLoad = useCallback(
        (event: SyntheticEvent<HTMLImageElement>) => {
            const { src, width, height } = event.currentTarget;
            kv.hset(KeyType.LoadImage, { [src]: `${width} / ${height}` });
            onLoad?.(event);
        },
        [onLoad],
    );

    const restoreAspectRatio = useCallback(async () => {
        const src = resolveNextImageUrl(props.src);
        console.time('[Image] restore aspect ratio');
        const exists = await kv.hexists(KeyType.LoadImage, src);
        if (exists) {
            const ratio = await kv.hget<string>(KeyType.LoadImage, src);
            if (ratio && /^.+\/.+$/.test(ratio)) {
                console.log('[Image] restore aspect ratio', ratio);
                setAspectRatio(ratio);
            }
        }
        console.timeEnd('[Image] restore aspect ratio');
    }, [props.src]);

    useEffect(() => {
        setImageLoadFailed(!props.src);
        if (props.src) {
            restoreAspectRatio();
        }
    }, [props.src, restoreAspectRatio]);

    const isFailed = imageLoadFailed || !props.src;

    // TODO: replace failed fallback image
    return (
        // Since next/image requires the domain of the image to be configured in next.config,
        // But we can't predict the origin of all images.
        // eslint-disable-next-line @next/next/no-img-element
        <NextImage
            {...props}
            style={style && aspectRatio ? { aspectRatio, ...style } : style}
            onLoad={handleLoad}
            unoptimized
            loading="lazy"
            priority={false}
            src={
                isFailed
                    ? fallback || (isDarkMode ? '/image/fallback-dark.png' : '/image/fallback-light.png')
                    : props.src
            }
            className={classNames(props.className, isFailed ? fallbackClassName : undefined)}
            onError={handleError}
            alt={props.alt || ''}
            ref={ref}
        />
    );
});
