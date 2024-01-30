import { compact } from 'lodash-es';
import type { ImageProps as NextImageProps } from 'next/image.js';
import { memo, useMemo, useState } from 'react';

import { Image as NextImage } from '@/esm/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveAvatarFallbackUrl } from '@/helpers/resolveAvatarFallbackUrl.js';
import { resolveImgurUrl } from '@/helpers/resolveImgurUrl.js';
import { useDarkMode } from '@/hooks/useDarkMode.js';

interface Props extends NextImageProps {
    size: number;
    src: string;
    fallbackUrl?: string;
}
export const Avatar = memo(function Avatar({ src, size, className, fallbackUrl, ...rest }: Props) {
    const { isDarkMode } = useDarkMode();

    const [index, setIndex] = useState(0);

    const fallbacks = useMemo(() => {
        return compact([
            resolveImgurUrl(resolveAvatarFallbackUrl(src)),
            fallbackUrl,
            isDarkMode ? '/image/firefly-dark-avatar.png' : '/image/firefly-light-avatar.png',
        ]);
    }, [src, fallbackUrl, isDarkMode]);

    return (
        <NextImage
            {...rest}
            loading="lazy"
            unoptimized
            priority={false}
            className={classNames('relative z-10 rounded-full object-cover', className)}
            style={{
                height: size,
                width: size,
                ...rest.style,
            }}
            src={fallbacks[index]}
            width={size}
            height={size}
            alt={rest.alt}
            onError={({ currentTarget }) => {
                if (index < fallbacks.length - 1) setIndex((index) => index + 1);
            }}
        />
    );
});
