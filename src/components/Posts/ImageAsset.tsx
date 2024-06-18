'use client';
import { memo, type SyntheticEvent, useCallback, useState } from 'react';

import { Image, type ImageProps } from '@/components/Image.js';
import { useMounted } from '@/hooks/useMounted.js';

export interface ImageAssetProps extends ImageProps {
    disableLoadHandler?: boolean;
}

export const ImageAsset = memo<ImageAssetProps>(function ImageAsset({ disableLoadHandler, ...props }) {
    const [imageProps, setImageProps] = useState<Partial<ImageProps>>();
    const mounted = useMounted();

    const handleLoad = useCallback(
        (event: SyntheticEvent<HTMLImageElement>) => {
            if (disableLoadHandler) return;
            const height = event.currentTarget.height;

            if (height < 50 || height > 682) {
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
                setImageProps({
                    style: {
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
