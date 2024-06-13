import { useQuery } from '@tanstack/react-query';

import { Avatar } from '@/components/Avatar.js';
import { ProfileInList } from '@/components/ProfileInList.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { type SocialSource } from '@/constants/enum.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useIsSmall } from '@/hooks/useMediaQuery.js';
import type { SuggestedFollowUserProfile } from '@/providers/types/SocialMedia.js';

export function SuggestedFollowUserInList({
    profile,
    source,
}: {
    profile: SuggestedFollowUserProfile;
    source: SocialSource;
}) {
    const { data: fullProfile, isLoading } = useQuery({
        queryKey: ['profile', source, profile.profileId],
        queryFn() {
            const provider = resolveSocialMediaProvider(source);
            return provider.getProfileById(profile.profileId);
        },
    });

    const isSmall = useIsSmall('max');

    if (isLoading) {
        return (
            <div
                className="flex-start flex cursor-pointer overflow-auto border-b border-secondaryLine px-4 py-6 hover:bg-bg dark:border-line"
                style={{ gridTemplateColumns: '70px calc(100% - 70px - 100px - 20px) 100px' }}
            >
                <Avatar
                    className="mr-3 shrink-0 rounded-full border"
                    src={profile.pfp}
                    size={isSmall ? 40 : 44}
                    alt={profile.displayName}
                />
                <div className="flex-start flex flex-1 flex-col overflow-auto">
                    <p className="flex-start flex items-center text-sm font-bold leading-5">
                        <span className="overflow-hide mr-2 text-ellipsis whitespace-nowrap text-xl">
                            {profile.displayName}
                        </span>
                        <SocialSourceIcon className="shrink-0" source={source} />
                    </p>
                    {profile.handle ? <p className="text-sm text-secondary">@{profile.handle}</p> : null}
                    <p className="mt-1.5 h-5" />
                </div>
            </div>
        );
    }

    if (!fullProfile) return null;

    return <ProfileInList profile={fullProfile} />;
}

export function getSuggestedFollowUserInList(index: number, source: SocialSource, profile: SuggestedFollowUserProfile) {
    return <SuggestedFollowUserInList profile={profile} source={source} key={`${profile.profileId}-${index}`} />;
}
