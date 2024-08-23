import { Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { memo } from 'react';

import { Avatar } from '@/components/Avatar.js';
import { ClickableArea } from '@/components/ClickableArea.js';
import { BioMarkup } from '@/components/Markup/BioMarkup.js';
import { FollowButton } from '@/components/Profile/FollowButton.js';
import { FollowersLink } from '@/components/Profile/FollowersLink.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { narrowToSocialSource } from '@/helpers/narrowToSocialSource.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import type { FireflyIdentity } from '@/providers/types/Firefly.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface ProfileCardProps {
    identity: FireflyIdentity;
    defaultProfile?: Profile;
}

export const ProfileCard = memo<ProfileCardProps>(function ProfileCard({ identity, defaultProfile }) {
    const { id, source } = identity;

    const { data: profile, isLoading } = useQuery({
        enabled: !!id && !!source,
        queryKey: ['profile', id, source],
        queryFn: async () => {
            if (defaultProfile) return defaultProfile;
            if (!id || !source) return;
            const provider = resolveSocialMediaProvider(narrowToSocialSource(source));
            return source === Source.Lens ? provider.getProfileByHandle(id) : provider.getProfileById(id);
        },
    });
    const myProfile = useCurrentProfile(narrowToSocialSource(source));

    if (isLoading) {
        return (
            <div className="h-[182px] w-[350px] rounded-2xl border border-secondaryLine bg-primaryBottom p-4">
                <div className="animate-pulse">
                    <div className="flex w-full gap-[10px]">
                        <div className="h-20 w-20 rounded-full bg-third" />
                        <div className="flex flex-1 flex-col justify-between">
                            <div className="h-3 w-[120px] rounded bg-third" />
                            <div className="h-3 w-[120px] rounded bg-third" />
                            <div className="h-3 w-[120px] rounded bg-third" />
                        </div>
                    </div>
                    <div className="mt-3 space-y-4">
                        <div className="h-3 w-full rounded bg-third" />
                        <div className="h-3 w-full rounded bg-third" />
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) return null;

    const url = getProfileUrl(profile);

    return (
        <ClickableArea className="flex w-[350px] flex-col gap-y-3 rounded-2xl border border-secondaryLine bg-primaryBottom p-4">
            <div className="flex gap-[10px]">
                <Link href={url}>
                    <Avatar
                        src={profile.pfp}
                        alt="avatar"
                        size={80}
                        className="h-20 w-20 cursor-pointer rounded-full"
                    />
                </Link>

                <div className="flex max-w-[calc(100%-80px-10px)] flex-1 flex-col gap-[6px]">
                    <div className="flex items-center gap-2">
                        <Link
                            href={url}
                            className="block w-full max-w-[calc(100%-18px)] cursor-pointer truncate text-xl leading-6 text-lightMain"
                        >
                            {profile.displayName}
                        </Link>
                        <SocialSourceIcon source={profile.source} className="flex-shrink-0" size={18} />
                    </div>

                    <Link href={url} className="cursor-pointer text-medium leading-6 text-secondary">
                        @{profile.handle}
                    </Link>

                    <div className="flex gap-3 text-medium">
                        <FollowersLink profile={profile} className="leading-[22px]" />

                        <Link
                            href={{
                                pathname: `/profile/${profile?.profileId}/following`,
                                query: { source: resolveSourceInURL(profile.source) },
                            }}
                            className={classNames('gap-1 leading-[22px] hover:underline', {
                                'pointer-events-none':
                                    profile.source !== Source.Farcaster && profile.source !== Source.Lens,
                            })}
                        >
                            <span className="font-bold text-lightMain">{nFormatter(profile.followingCount)} </span>
                            <span className="text-secondary">
                                <Trans>Following</Trans>
                            </span>
                        </Link>
                    </div>
                </div>
            </div>

            <BioMarkup className="mt-3 line-clamp-2 text-medium leading-[22px] text-lightMain" source={profile.source}>
                {profile.bio ?? '-'}
            </BioMarkup>

            {!isSameProfile(myProfile, profile) ? (
                <FollowButton style={{ height: 40 }} className="min-h-[40px] w-full" profile={profile} />
            ) : null}
        </ClickableArea>
    );
});
