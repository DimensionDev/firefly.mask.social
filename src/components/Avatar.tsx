'use client';

import { useQuery } from '@tanstack/react-query';
import { compact } from 'lodash-es';
import type { ImageProps as NextImageProps } from 'next/image.js';
import { memo } from 'react';

import { Image as NextImage } from '@/esm/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { isDomainOrSubdomainOf } from '@/helpers/isDomainOrSubdomainOf.js';
import { resolveFirstAvailableUrl } from '@/helpers/resolveFirstAvailableUrl.js';
import { resolveImgurUrl } from '@/helpers/resolveImgurUrl.js';
import { useIsDarkMode } from '@/hooks/useIsDarkMode.js';

function resolveAvatarFallbackUrl(url: string | undefined, isDarkMode = false) {
    if (!url?.startsWith('https://cdn.stamp.fyi/avatar/eth:')) return url;
    return isDarkMode ? '/image/firefly-dark-avatar.png' : '/image/firefly-light-avatar.png';
}

export interface AvatarProps extends Omit<NextImageProps, 'src'> {
    size: number;
    src?: string;
    fallbackUrl?: string;
}

export const Avatar = memo(function Avatar({ src, size, className, fallbackUrl, ...rest }: AvatarProps) {
    const isDarkMode = useIsDarkMode();

    const isNormalUrl = !!src && !src.startsWith('data:image/') && !isDomainOrSubdomainOf(src, 'warpcast.com');
    const { data: url } = useQuery({
        enabled: isNormalUrl,
        queryKey: ['avatar', isNormalUrl ? src : '[disabled-url]', fallbackUrl],
        queryFn: () => resolveFirstAvailableUrl(compact([resolveImgurUrl(resolveAvatarFallbackUrl(src)), fallbackUrl])),
    });

    const defaultFallbackUrl = isDarkMode ? '/image/firefly-dark-avatar.png' : '/image/firefly-light-avatar.png';
    const imageSrc = (isNormalUrl ? url : src) || src || defaultFallbackUrl;

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
            src={imageSrc}
            width={size}
            height={size}
            alt={rest.alt}
        />
    );
});
