import type { DetailedHTMLProps, ImgHTMLAttributes, Ref, SyntheticEvent } from 'react';
import { forwardRef, useCallback, useEffect, useState } from 'react';

export const Image = forwardRef(function Image(
    { onError, ...props }: DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>,
    ref: Ref<HTMLImageElement>,
) {
    const [imageLoadFailed, setImageLoadFailed] = useState(false);

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
        <img
            {...props}
            src={imageLoadFailed ? '/image/firefly-avatar.png' : props.src}
            onError={handleError}
            alt={props.alt || ''}
            ref={ref}
        />
    );
});
