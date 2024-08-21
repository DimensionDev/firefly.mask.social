import { plural } from '@lingui/macro';
import { memo } from 'react';

import { BioMarkup } from '@/components/Markup/BioMarkup.js';
import { ProfileTippy } from '@/components/Profile/ProfileTippy.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { useFireflyIdentity } from '@/hooks/useFireflyIdentity.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface ProfileSlideProps {
    profile: Profile;
}

export const ProfileSlide = memo<ProfileSlideProps>(function ProfileSlide({ profile }) {
    const identity = useFireflyIdentity(profile.source, profile.profileId);

    return (
        <div className="h-[184px] w-[164px] rounded-2xl bg-lightBottom px-3 py-6 shadow-primary backdrop-blur dark:bg-darkBottom">
            <div
                className={classNames('h-[56px] w-[56px] rounded-full border-2 p-0.5', {
                    'border-farcasterPrimary': profile.source === Source.Farcaster,
                    'border-lensPrimary': profile.source === Source.Lens,
                })}
            >
                <ProfileAvatar profile={profile} size={48} linkable enableSourceIcon={false} />
            </div>
            <div className="flex-start flex items-center truncate text-sm font-bold leading-6">
                <ProfileTippy identity={identity}>
                    <div className="mr-0.5 max-w-full cursor-pointer truncate text-[15px] text-main">
                        {profile.displayName}
                    </div>
                </ProfileTippy>
                <SocialSourceIcon source={profile.source} size={15} className="shrink-0" />
            </div>
            <Link
                href={{
                    pathname: `/profile/${profile?.profileId}/followers`,
                    query: { source: resolveSourceInURL(profile.source) },
                }}
                className={classNames('gap-1 text-xs leading-6 text-second hover:underline', {
                    'pointer-events-none': profile.source !== Source.Farcaster && profile.source !== Source.Lens,
                })}
            >
                <span className="font-bold">{nFormatter(profile.followerCount)} </span>
                <span>
                    {plural(profile.followerCount, {
                        one: 'Follower',
                        other: 'Followers',
                    })}
                </span>
            </Link>
            <BioMarkup className="line-clamp-2 text-xs text-lightMain" source={profile.source}>
                {profile.bio ?? '-'}
            </BioMarkup>
        </div>
    );
});
