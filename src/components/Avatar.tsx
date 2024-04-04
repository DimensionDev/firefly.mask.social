import { useQuery } from '@tanstack/react-query';
import { compact } from 'lodash-es';
import type { ImageProps as NextImageProps } from 'next/image.js';
import { memo } from 'react';

import { Image as NextImage } from '@/esm/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveAvatarFallbackUrl } from '@/helpers/resolveAvatarFallbackUrl.js';
import { resolveFirstAvailableUrl } from '@/helpers/resolveFirstAvailableUrl.js';
import { resolveImgurUrl } from '@/helpers/resolveImgurUrl.js';
import { useDarkMode } from '@/hooks/useDarkMode.js';

interface Props extends NextImageProps {
    size: number;
    src: string;
    fallbackUrl?: string;
}

export const Avatar = memo(function Avatar({ src, size, className, fallbackUrl, ...rest }: Props) {
    const { isDarkMode } = useDarkMode();

    const isBase64 = src.startsWith('data:image/');
    const { data: url } = useQuery({
        enabled: !isBase64,
        queryKey: ['avatar', isBase64 ? '[disabled-base64]' : src, fallbackUrl],
        queryFn: () => resolveFirstAvailableUrl(compact([resolveImgurUrl(resolveAvatarFallbackUrl(src)), fallbackUrl])),
    });

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
            src={isBase64 ? src : url || defaultFallbackUrl}
            width={size}
            height={size}
            alt={rest.alt}
        />
    );
});
