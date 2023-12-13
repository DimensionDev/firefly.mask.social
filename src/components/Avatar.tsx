import { memo } from 'react';

import { Image, type ImageProps } from '@/components/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { useDarkMode } from '@/hooks/useDarkMode.js';

interface Props extends ImageProps {
    size: number;
}
export const Avatar = memo(function Avatar({ src, size, className, ...rest }: Props) {
    const { isDarkMode } = useDarkMode();
    const useFallback = src ? src.startsWith('https://cdn.stamp.fyi/avatar/eth:') : true;

    const avatar = useFallback
        ? isDarkMode
            ? '/image/firefly-dark-avatar.png'
            : '/image/firefly-light-avatar.png'
        : src;
    return (
        <Image
            loading="lazy"
            className={classNames('rounded-full', className)}
            src={avatar}
            width={size}
            height={size}
            {...rest}
            alt={rest.alt}
        />
    );
});
