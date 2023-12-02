import type { DetailedHTMLProps, ImgHTMLAttributes, Ref, SyntheticEvent } from 'react';
import { forwardRef, useCallback, useEffect, useState } from 'react';

import { useDarkMode } from '@/hooks/useDarkMode.js';

export const Image = forwardRef(function Image(
    {
        onError,
        fallback,
        ...props
    }: DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> & { fallback?: string },
    ref: Ref<HTMLImageElement>,
) {
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

    useEffect(() => {
        setImageLoadFailed(false);
    }, [props.src]);

    // TODO: replace failed fallback image
    return (
        // Since next/image requires the domain of the image to be configured in next.cong,
        // But we can't predict the origin of all images.
        // eslint-disable-next-line @next/next/no-img-element
        <img
            {...props}
            src={
                imageLoadFailed
                    ? fallback || (!isDarkMode ? '/image/fallback-light.png' : '/image/fallback-dark.png')
                    : props.src
            }
            onError={handleError}
            alt={props.alt || ''}
            ref={ref}
        />
    );
});
