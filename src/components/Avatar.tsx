import { compact } from 'lodash-es';
import type { ImageProps as NextImageProps } from 'next/image.js';
import { memo } from 'react';
import { useAsync } from 'react-use';

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

    const { value: url, loading } = useAsync(
        async () => resolveFirstAvailableUrl(compact([resolveImgurUrl(resolveAvatarFallbackUrl(src)), fallbackUrl])),
        [src, fallbackUrl],
    );

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
            src={loading ? defaultFallbackUrl : url ?? defaultFallbackUrl}
            width={size}
            height={size}
            alt={rest.alt}
        />
    );
});
