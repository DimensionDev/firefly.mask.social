import { memo } from 'react';

import { Avatar } from '@/components/Avatar.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';
import type { FireflyCrossProfile } from '@/providers/types/Firefly.js';

interface CrossProfileItemProps {
    profile: FireflyCrossProfile;
}

export const CrossProfileItem = memo<CrossProfileItemProps>(function CrossProfileItem({ profile }) {
    return (
        <Link
            className="flex items-center gap-x-2 border-b border-line p-3 hover:bg-bg"
            href={resolveProfileUrl(
                profile.platform,
                profile.platform === Source.Lens ? profile.handle : profile.profileId,
            )}
        >
            <Avatar alt={profile.handle} className="h-7 w-7 rounded-full" src={profile.avatar} size={44} />
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-x-1">
                    <span className="truncate text-lg font-bold leading-6 text-lightMain">{profile.name}</span>
                    {profile.allProfile.map((x) => (
                        <SocialSourceIcon
                            key={x.platform}
                            mono
                            className="inline-block shrink-0 text-second"
                            source={resolveSocialSource(x.platform)}
                            size={15}
                        />
                    ))}
                </div>
                <div className="truncate text-medium leading-[22px] text-lightSecond">@{profile.handle}</div>
            </div>
        </Link>
    );
});
