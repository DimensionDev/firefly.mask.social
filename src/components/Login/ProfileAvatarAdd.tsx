import { PlusIcon } from '@heroicons/react/24/outline';
import type { HTMLProps } from 'react';

import LoadingIcon from '@/assets/loading.svg';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { type SocialSource } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { useAsyncStatus } from '@/hooks/useAsyncStatus.js';
import { useIsLarge } from '@/hooks/useMediaQuery.js';
import { useSizeStyle } from '@/hooks/useSizeStyle.js';

interface ProfileAvatarAddProps extends HTMLProps<HTMLDivElement> {
    source: SocialSource;
    loading?: boolean;
}

export function ProfileAvatarAdd({ source, loading, ...props }: ProfileAvatarAddProps) {
    const isLarge = useIsLarge();
    const asyncStatus = useAsyncStatus(source);

    const size = isLarge ? 40 : 36;
    const style = useSizeStyle(size, props.style);

    const isLoading = loading || asyncStatus;

    return (
        <div
            className={classNames('relative z-0 md:m-0', {
                'cursor-pointer': !isLoading,
                'cursor-not-allowed': isLoading,
            })}
            style={style}
            {...props}
            onClick={(ev) => {
                if (isLoading) return;
                props.onClick?.(ev);
            }}
        >
            <div className="absolute left-0 top-0 rounded-full" style={style}>
                <SocialSourceIcon source={source} size={size} />
            </div>
            {isLoading ? (
                <div className="absolute left-0 top-0">
                    <LoadingIcon className="animate-spin text-primaryBottom" width={size} height={size} />
                </div>
            ) : null}
            <PlusIcon
                className="absolute -bottom-[1px] -right-[8px] rounded-full bg-white text-black lg:left-8 lg:top-6"
                width={16}
                height={16}
            />
        </div>
    );
}
