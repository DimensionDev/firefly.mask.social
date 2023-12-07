'use client';
import { divide } from 'lodash-es';
import { type ImgHTMLAttributes, memo, type SyntheticEvent, useCallback, useState } from 'react';

import { Image } from '@/components/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { useMounted } from '@/hooks/useMounted.js';
import { isGreaterThan } from '@/maskbook/packages/web3-shared/base/src/index.js';

export const ImageAsset = memo<ImgHTMLAttributes<HTMLImageElement>>(function ImageAsset(props) {
    const [imageProps, setImageProps] = useState<ImgHTMLAttributes<HTMLImageElement>>();
    const mounted = useMounted();

    const handleLoad = useCallback((event: SyntheticEvent<HTMLImageElement>) => {
        const width = event.currentTarget.naturalWidth;
        const height = event.currentTarget.naturalHeight;
        const ratio = divide(width, height);

        if (isGreaterThan(ratio, 3 / 4) && isGreaterThan(4 / 3, ratio)) return;

        setImageProps({
            style: {
                aspectRatio: '16 / 9',
                objectFit: 'cover',
            },
        });
    }, []);

    if (!mounted) return;
    return (
        <Image
            {...props}
            className={classNames('max-h-[682px] min-h-[288px]', props.className ?? '')}
            onLoad={handleLoad}
            alt={props.alt || ''}
            {...imageProps}
        />
    );
});
