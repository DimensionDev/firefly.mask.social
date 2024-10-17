import type { HTMLProps } from 'react';

import { Avatar } from '@/components/Avatar.js';
import { FollowButton } from '@/components/Profile/FollowButton.js';
import { ProfileTippy } from '@/components/Profile/ProfileTippy.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveFireflyIdentity } from '@/helpers/resolveFireflyProfileId.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface Props extends HTMLProps<HTMLAnchorElement> {
    profile: Profile;
    source: SocialSource;
}

export function ProfileCell({ profile, source, className, ref, ...props }: Props) {
    const identity = resolveFireflyIdentity(profile);
    if (!identity) return null;

    return (
        <Link
            href={resolveProfileUrl(source, source === Source.Lens ? profile.handle : profile.profileId)}
            className={classNames('flex w-full px-4 py-2 hover:bg-bg', className)}
            data-disable-nprogress
            {...props}
        >
            <div className="flex w-full items-center">
                <ProfileTippy identity={identity}>
                    <span>
                        <Avatar
                            className="mr-3 shrink-0 rounded-full border"
                            src={profile?.pfp || profile.pfp}
                            size={40}
                            alt={profile.handle}
                        />
                    </span>
                </ProfileTippy>
                <div className="mr-auto flex max-w-[calc(100%-16px-40px-16px-32px)] flex-col">
                    <div className="flex-start flex items-center truncate text-sm font-bold leading-5">
                        <div className="text-l mr-2 max-w-full truncate text-main">{profile.displayName}</div>
                        <SocialSourceIcon source={source} size={16} className="flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-2 text-medium text-sm leading-[24px] text-secondary">
                        <p className="truncate">@{profile.handle}</p>
                    </div>
                </div>
                <div>
                    <FollowButton profile={profile} variant="icon" hasMutedButton={false} />
                </div>
            </div>
        </Link>
    );
}
