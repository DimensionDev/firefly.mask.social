'use client';

import { Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import urlcat from 'urlcat';

import { AsideTitle } from '@/components/AsideTitle.js';
import { SuggestedFollowUser } from '@/components/SuggestedFollows/SuggestedFollowUser.js';
import { PageRoute, Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';

export function SuggestedFollowsCard() {
    const { data: farcasterData } = useQuery({
        queryKey: ['suggested-follows-lite', Source.Farcaster],
        queryFn() {
            return FarcasterSocialMediaProvider.getSuggestedFollowUsers();
        },
    });
    const { data: lensData } = useQuery({
        queryKey: ['suggested-follows-lite', Source.Lens],
        queryFn() {
            return LensSocialMediaProvider.getSuggestedFollowUsers();
        },
    });

    return (
        <div className="rounded-lg border border-line dark:border-0 dark:bg-lightBg">
            <AsideTitle>
                <Trans>Suggested Follows</Trans>
            </AsideTitle>
            <div>
                {farcasterData?.data
                    ?.slice(0, 3)
                    .map((profile) => (
                        <SuggestedFollowUser key={profile.profileId} profile={profile} source={Source.Farcaster} />
                    ))}
            </div>
            <Link
                href={urlcat(PageRoute.UserTrending, {
                    source: resolveSourceInURL(Source.Farcaster),
                })}
                className="flex px-4 py-2 text-[15px] font-bold leading-[24px] text-[#9250FF]"
            >
                <Trans>Show more Farcaster users</Trans>
            </Link>
            <div className="mt-3">
                {lensData?.data
                    ?.slice(0, 3)
                    .map((profile) => (
                        <SuggestedFollowUser key={profile.profileId} profile={profile} source={Source.Lens} />
                    ))}
            </div>
            <Link
                href={urlcat(PageRoute.UserTrending, {
                    source: resolveSourceInURL(Source.Lens),
                })}
                className="flex px-4 py-2 text-[15px] font-bold leading-[24px] text-[#9250FF]"
            >
                <Trans>Show more Lens users</Trans>
            </Link>
        </div>
    );
}
