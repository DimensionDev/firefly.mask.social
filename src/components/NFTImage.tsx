import { memo } from 'react';

import { Image, type ImageProps } from '@/components/Image.js';
import { useIsDarkMode } from '@/hooks/useIsDarkMode.js';

export const NFTImage = memo<ImageProps>(function NFTImage(props) {
    const isDarkMode = useIsDarkMode();
    return (
        <Image
            fallbackClassName="border border-secondaryLine"
            fallback={isDarkMode ? '/image/img-fallback-dark.png' : '/image/img-fallback-light.png'}
            {...props}
            alt={props.alt}
            src={props.src}
        />
    );
});
