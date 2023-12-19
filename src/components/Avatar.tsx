import { memo } from 'react';

import { Image, type ImageProps } from '@/components/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveAvatarFallbackUrl } from '@/helpers/resolveAvatarFallbackUrl.js';
import { resolveImgurUrl } from '@/helpers/resolveImgurUrl.js';
import { useDarkMode } from '@/hooks/useDarkMode.js';

interface Props extends ImageProps {
    size: number;
}
export const Avatar = memo(function Avatar({ src, size, className, ...rest }: Props) {
    const { isDarkMode } = useDarkMode();
    const fallbackUrl = isDarkMode ? '/image/firefly-dark-avatar.png' : '/image/firefly-light-avatar.png';
    const avatarUrl = resolveImgurUrl(resolveAvatarFallbackUrl(src));

    return (
        <Image
            loading="lazy"
            {...rest}
            className={classNames(`h-[${size}px] w-[${size}px] rounded-full object-cover`, className)}
            src={avatarUrl}
            fallback={fallbackUrl}
            width={size}
            height={size}
            alt={rest.alt}
        />
    );
});
