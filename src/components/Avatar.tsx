import { memo } from 'react';
import urlcat from 'urlcat';

import { Image, type ImageProps } from '@/components/Image.js';
import { SITE_URL } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveAvatarFallbackUrl } from '@/helpers/resolveAvatarFallbackUrl.js';
import { resolveImgurUrl } from '@/helpers/resolveImgurUrl.js';
import { useDarkMode } from '@/hooks/useDarkMode.js';

interface Props extends ImageProps {
    size: number;
    src: string;
    fallbackUrl?: string;
}
export const Avatar = memo(function Avatar({ src, size, className, fallbackUrl, ...rest }: Props) {
    const { isDarkMode } = useDarkMode();

    const avatarUrl = resolveImgurUrl(resolveAvatarFallbackUrl(src));
    const fireflyAvatarUrl = urlcat(
        SITE_URL,
        isDarkMode ? '/image/firefly-dark-avatar.png' : '/image/firefly-light-avatar.png',
    );

    return (
        <Image
            loading="lazy"
            {...rest}
            className={classNames('relative z-10 rounded-full object-cover', className)}
            style={{
                height: size,
                width: size,
                ...rest.style,
            }}
            src={avatarUrl ?? fallbackUrl ?? fireflyAvatarUrl}
            width={size}
            height={size}
            alt={rest.alt}
            onError={({ currentTarget }) => {
                if (fallbackUrl && currentTarget.src !== fallbackUrl) currentTarget.src = fallbackUrl;
                else if (currentTarget.src !== fireflyAvatarUrl) currentTarget.src = fireflyAvatarUrl;
            }}
        />
    );
});
