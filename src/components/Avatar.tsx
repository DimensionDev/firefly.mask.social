import type { ImageProps as NextImageProps } from 'next/image.js';
import { memo, useState } from 'react';

import { Image as NextImage } from '@/esm/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { useDarkMode } from '@/hooks/useDarkMode.js';

interface Props extends Omit<NextImageProps, 'src'> {
    size: number;
    src?: string;
    fallbackUrl?: string;
}

export const Avatar = memo(function Avatar({ src, size, className, fallbackUrl, ...rest }: Props) {
    const { isDarkMode } = useDarkMode();

    const [url, setUrl] = useState(src);

    const defaultFallbackUrl = isDarkMode ? '/image/firefly-dark-avatar.png' : '/image/firefly-light-avatar.png';

    return (
        <NextImage
            {...rest}
            loading="lazy"
            unoptimized
            priority={false}
            className={classNames('relative z-10 max-w-none rounded-full bg-secondary object-cover', className)}
            style={{
                height: size,
                width: size,
                ...rest.style,
            }}
            src={url || defaultFallbackUrl}
            width={size}
            height={size}
            alt={rest.alt}
            onError={() => {
                setUrl(defaultFallbackUrl);
            }}
        />
    );
});
