import { memo } from 'react';

import { Image, type ImageProps } from '@/components/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveAvatarFallbackUrl } from '@/helpers/resolveAvatarFallbackUrl.js';
import { resolveImgurUrl } from '@/helpers/resolveImgurUrl.js';
import { useDarkMode } from '@/hooks/useDarkMode.js';

interface Props extends ImageProps {
    size: number;
    src: string;
}
export const Avatar = memo(function Avatar({ src, size, className, ...rest }: Props) {
    const { isDarkMode } = useDarkMode();
    const fallbackUrl = isDarkMode ? '/image/firefly-dark-avatar.png' : '/image/firefly-light-avatar.png';
    const avatarUrl = resolveImgurUrl(resolveAvatarFallbackUrl(src));

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
            src={avatarUrl || fallbackUrl}
            fallback={fallbackUrl}
            width={size}
            height={size}
            alt={rest.alt}
        />
    );
});
