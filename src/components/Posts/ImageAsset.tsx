'use client';
import { type ImgHTMLAttributes, memo, type SyntheticEvent, useCallback, useState } from 'react';

import { Image } from '@/components/Image.js';
import { useMounted } from '@/hooks/useMounted.js';

export const ImageAsset = memo<ImgHTMLAttributes<HTMLImageElement>>(function ImageAsset(props) {
    const [imageProps, setImageProps] = useState<ImgHTMLAttributes<HTMLImageElement>>();
    const mounted = useMounted();

    const handleLoad = useCallback((event: SyntheticEvent<HTMLImageElement>) => {
        const height = event.currentTarget.height;
        if (height < 288 || height > 682) {
            setImageProps({
                style: {
                    aspectRatio: '16 / 9',
                    objectFit: 'cover',
                    minHeight: 288,
                    maxHeight: 682,
                },
            });
            return;
        }

        setImageProps({
            style: {
                minHeight: 288,
                maxHeight: 682,
            },
        });
    }, []);

    if (!mounted) return;
    return <Image {...props} onLoad={handleLoad} alt={props.alt || ''} {...imageProps} />;
});
