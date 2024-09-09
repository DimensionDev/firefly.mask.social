import type { ImageProps as NextImageProps } from 'next/image.js';
import type { SyntheticEvent } from 'react';
import { forwardRef, useCallback, useEffect, useState } from 'react';

import { Image as NextImage } from '@/esm/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { useDarkMode } from '@/hooks/useDarkMode.js';

export interface ImageProps extends NextImageProps {
    fallback?: string;
    fallbackClassName?: string;
}

export const Image = forwardRef<HTMLImageElement, ImageProps>(function Image(
    { onError, onLoad, fallback, fallbackClassName, ...props },
    ref,
) {
    const [imageLoadFailed, setImageLoadFailed] = useState(false);
    const { isDarkMode } = useDarkMode();
    const [loading, setLoading] = useState(true);

    const handleError = useCallback(
        (e: SyntheticEvent<HTMLImageElement>) => {
            setLoading(false);
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
        (e: SyntheticEvent<HTMLImageElement>) => {
            setLoading(false);
            onLoad?.(e);
        },
        [onLoad],
    );

    useEffect(() => {
        setImageLoadFailed(!props.src);
    }, [props.src]);

    const isFailed = imageLoadFailed || !props.src;

    // TODO: replace failed fallback image
    return (
        // Since next/image requires the domain of the image to be configured in next.config,
        // But we can't predict the origin of all images.
        // eslint-disable-next-line @next/next/no-img-element
        <NextImage
            {...props}
            unoptimized
            loading="lazy"
            priority={false}
            onLoad={handleLoad}
            src={
                isFailed
                    ? fallback || (isDarkMode ? '/image/fallback-dark.png' : '/image/fallback-light.png')
                    : props.src
            }
            className={classNames(
                props.className,
                isFailed ? fallbackClassName : undefined,
                loading ? 'animate-pulse bg-bg' : '',
            )}
            onError={handleError}
            alt={props.alt || ''}
            ref={ref}
        />
    );
});
