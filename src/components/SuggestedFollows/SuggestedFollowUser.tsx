import { useQuery } from '@tanstack/react-query';

import { Avatar } from '@/components/Avatar.js';
import { FollowButton } from '@/components/Profile/FollowButton.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import type { SuggestedFollowUserProfile } from '@/providers/types/SocialMedia.js';

export function SuggestedFollowUser({
    profile,
    source,
}: {
    profile: SuggestedFollowUserProfile;
    source: SocialSource;
}) {
    const { data: fullProfile } = useQuery({
        queryKey: ['profile', source, profile.profileId],
        queryFn() {
            const provider = resolveSocialMediaProvider(source);
            return provider.getProfileById(profile.profileId);
        },
    });

    return (
        <Link
            href={resolveProfileUrl(source, source === Source.Lens ? profile.profileId : profile.handle)}
            className="flex w-full px-4 py-2 hover:bg-bg"
        >
            <div className="flex w-full items-center">
                <Avatar
                    className="mr-3 shrink-0 rounded-full border"
                    src={fullProfile?.pfp || profile.pfp}
                    size={40}
                    alt={profile.handle}
                />
                <div className="mr-auto flex max-w-[calc(100%-16px-40px-16px-32px)] flex-col">
                    <div className="flex-start flex items-center truncate text-sm font-bold leading-5">
                        <div className="text-l mr-2 max-w-full truncate">
                            {fullProfile?.displayName || profile.displayName}
                        </div>
                        <SocialSourceIcon source={source} size={16} />
                    </div>
                    <div className="flex items-center gap-2 text-[15px] text-sm leading-[24px] text-secondary">
                        <p className="truncate">@{fullProfile?.handle || profile.handle}</p>
                    </div>
                </div>
                {fullProfile ? (
                    <div>
                        <FollowButton profile={fullProfile} variant="icon" />
                    </div>
                ) : null}
            </div>
        </Link>
    );
}
