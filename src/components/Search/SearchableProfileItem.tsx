import { memo } from 'react';

import WalletIcon from '@/assets/wallet-circle.svg';
import { Avatar } from '@/components/Avatar.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { FireflyPlatform, Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { getStampAvatarByProfileId } from '@/helpers/getStampAvatarByProfileId.js';
import { narrowToSocialSource } from '@/helpers/narrowToSocialSource.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { resolveSocialSourceFromFireflyPlatform, resolveSourceFromFireflyPlatform } from '@/helpers/resolveSource.js';
import type { Profile } from '@/providers/types/Firefly.js';

interface CrossProfileItemProps {
    profile: Profile;
    related: Profile[];
}

export const SearchableProfileItem = memo<CrossProfileItemProps>(function SearchableProfileItem({ profile, related }) {
    const platformSource = resolveSourceFromFireflyPlatform(profile.platform);
    const source = platformSource === Source.Wallet ? Source.Wallet : narrowToSocialSource(platformSource);
    const avatar = profile.avatar ?? getStampAvatarByProfileId(source, profile.platform_id);

    // keep the matched profile at the first place
    const sortedRelated = related.sort((a, b) => (a.platform === profile.platform ? -1 : 1));

    return (
        <Link
            className="flex items-center gap-x-2 border-b border-line p-3 hover:bg-bg"
            href={resolveProfileUrl(source, source === Source.Lens ? profile.handle : profile.platform_id)}
        >
            <Avatar alt={profile.handle} className="h-7 w-7 rounded-full" src={avatar} size={44} />
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-x-1">
                    <span className="truncate text-lg font-bold leading-6 text-lightMain">{profile.name}</span>
                    {sortedRelated.map((x) =>
                        x.platform === FireflyPlatform.Wallet ? (
                            <WalletIcon
                                className="inline-block shrink-0 text-second"
                                key={x.platform}
                                width={15}
                                height={15}
                            />
                        ) : (
                            <SocialSourceIcon
                                key={x.platform}
                                mono
                                className="inline-block shrink-0 text-second"
                                source={resolveSocialSourceFromFireflyPlatform(x.platform)}
                                size={15}
                            />
                        ),
                    )}
                </div>
                <div className="truncate text-medium leading-[22px] text-lightSecond">@{profile.handle}</div>
            </div>
        </Link>
    );
});
