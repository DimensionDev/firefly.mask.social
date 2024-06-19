import { memo } from 'react';

import { Image, type ImageProps } from '@/components/Image.js';
import { useDarkMode } from '@/hooks/useDarkMode.js';

export const NFTImage = memo<ImageProps>(function NFTImage(props) {
    const { isDarkMode } = useDarkMode();
    return (
        <Image
            {...props}
            src={props.src}
            fallbackClassName="border border-secondaryLine"
            fallback={isDarkMode ? '/image/img-fallback-dark.png' : '/image/img-fallback-light.png'}
        />
    );
});
