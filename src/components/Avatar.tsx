import { memo } from 'react';

import { Image, type ImageProps } from '@/components/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { useDarkMode } from '@/hooks/useDarkMode.js';

interface Props extends ImageProps {
    size: number;
}
export const Avatar = memo(function Avatar({ src, size, className, ...rest }: Props) {
    const { isDarkMode } = useDarkMode();
    const fallback = isDarkMode ? '/image/firefly-dark-avatar.png' : '/image/firefly-light-avatar.png';
    const useFallback = src ? src.startsWith('https://cdn.stamp.fyi/avatar/eth:') : true;

    const avatar = useFallback ? fallback : src;
    return (
        <Image
            loading="lazy"
            {...rest}
            className={classNames('rounded-full object-cover', className)}
            src={avatar}
            fallback={fallback}
            width={size}
            height={size}
            alt={rest.alt}
        />
    );
});
