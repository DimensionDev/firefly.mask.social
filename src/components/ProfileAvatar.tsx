import type { HTMLProps } from 'react';

import LoadingIcon from '@/assets/loading.svg';
import { Avatar } from '@/components/Avatar.js';
import { Link } from '@/components/Link.js';
import { ProfileSourceIcon } from '@/components/ProfileSourceIcon.js';
import { classNames } from '@/helpers/classNames.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { useIsLarge } from '@/hooks/useMediaQuery.js';
import { useSizeStyle } from '@/hooks/useSizeStyle.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export interface ProfileAvatarProps extends HTMLProps<HTMLElement> {
    profile: Profile;
    size?: number;
    loading?: boolean;
    linkable?: boolean;
    clickable?: boolean;
    enableSourceIcon?: boolean;
    enableDefaultAvatar?: boolean;
    fallbackUrl?: string;
}

export function ProfileAvatar({
    ref,
    profile,
    fallbackUrl,
    loading = false,
    linkable = false,
    clickable = false,
    enableSourceIcon = true,
    enableDefaultAvatar = false,
    ...props
}: ProfileAvatarProps) {
    const isLarge = useIsLarge();

    const size = props.size ?? (isLarge ? 40 : 36);
    const style = useSizeStyle(size, props.style);

    const content = (
        <div className="relative z-0" style={style}>
            <div className="absolute left-0 top-0 rounded-full" style={style}>
                {!profile.pfp && enableDefaultAvatar ? (
                    <ProfileSourceIcon size={size} source={profile.profileSource} />
                ) : (
                    <Avatar src={profile.pfp} size={size} alt={profile.displayName} fallbackUrl={fallbackUrl} />
                )}
            </div>
            {loading ? (
                <div className="absolute left-0 top-0 z-10">
                    <LoadingIcon className="animate-spin text-primaryBottom" width={size} height={size} />
                </div>
            ) : null}
            {enableSourceIcon ? (
                <ProfileSourceIcon
                    source={profile.profileSource}
                    size={16}
                    className="absolute -bottom-[1px] -right-[8px] z-10 h-4 w-4 rounded-full border border-white"
                />
            ) : null}
        </div>
    );

    return linkable ? (
        <Link
            className={classNames('flex items-start justify-start md:mx-auto lg:m-0', {
                'cursor-pointer': clickable,
            })}
            style={style}
            href={getProfileUrl(profile)}
            {...props}
        >
            {content}
        </Link>
    ) : (
        <div
            className={classNames('flex items-start justify-start md:mx-auto lg:m-0', {
                'cursor-pointer': clickable,
            })}
            style={style}
            {...props}
        >
            {content}
        </div>
    );
}
