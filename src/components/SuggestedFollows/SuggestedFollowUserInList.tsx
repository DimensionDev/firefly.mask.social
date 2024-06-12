import { useQuery } from '@tanstack/react-query';

import { Avatar } from '@/components/Avatar.js';
import { FollowInList } from '@/components/FollowInList.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { getLennyURL } from '@/helpers/getLennyURL.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
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

    if (isLoading) {
        return (
            <div
                className="grid w-full gap-2.5 border-b border-line py-3 pl-3 pr-5"
                style={{ gridTemplateColumns: '70px calc(100% - 70px - 100px - 20px) 100px' }}
            >
                <Avatar
                    className="w-17.5 h-17.5 min-w-[70px] shrink-0"
                    src={profile.pfp}
                    size={70}
                    alt={profile.profileId}
                    fallbackUrl={source === Source.Lens ? getLennyURL(profile.pfp) : undefined}
                />
                <div className="leading-5.5 flex flex-col text-[15px]">
                    <div className="flex w-full items-center">
                        <div className="max-w-[calc(100% - 32px)] mr-2 truncate text-xl leading-6">
                            {profile.displayName}
                        </div>
                        <SocialSourceIcon
                            source={source}
                            className={source === Source.Lens ? 'dark:opacity-70' : undefined}
                        />
                    </div>
                    <div className="w-full truncate text-secondary">@{profile.handle}</div>
                    <div className="w-full truncate" />
                </div>
                <div />
            </div>
        );
    }

    if (!fullProfile) return null;

    return <FollowInList profile={fullProfile} />;
}

export function getSuggestedFollowUserInList(index: number, source: SocialSource, profile: SuggestedFollowUserProfile) {
    return <SuggestedFollowUserInList profile={profile} source={source} key={`${profile.profileId}-${index}`} />;
}
