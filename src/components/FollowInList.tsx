import { memo } from 'react';

import { Avatar } from '@/components/Avatar.js';
import { BioMarkup } from '@/components/Markup/BioMarkup.js';
import { PlainParagraph, VoidLineBreak } from '@/components/Markup/overrides.js';
import { FollowButton } from '@/components/Profile/FollowButton.js';
import { ProfileInList } from '@/components/ProfileInList.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { getLennyURL } from '@/helpers/getLennyURL.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { useIsSmall } from '@/hooks/useMediaQuery.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

const overrideComponents = {
    p: PlainParagraph,
    br: VoidLineBreak,
};
export const FollowInList = memo<{ profile: Profile }>(function FollowInList({ profile }) {
    const isSmall = useIsSmall('max');
    return (
        <div className="flex-start flex cursor-pointer overflow-auto border-b border-secondaryLine p-3 hover:bg-bg dark:border-line">
            <Link href={getProfileUrl(profile)} className="flex-start flex flex-1 gap-3 overflow-auto">
                <Avatar
                    className="shrink-0 rounded-full border"
                    src={profile.pfp}
                    size={isSmall ? 40 : 44}
                    alt={profile.profileId}
                    fallbackUrl={profile.source === Source.Lens ? getLennyURL(profile.pfp) : undefined}
                />
                <div className="flex-start flex flex-1 flex-col overflow-auto">
                    <div className="flex-start flex items-center text-sm font-bold leading-5">
                        <div className="mr-2 truncate text-xl">{profile.displayName}</div>
                        <SocialSourceIcon
                            source={profile.source}
                            className={profile.source === Source.Lens ? 'dark:opacity-70' : undefined}
                        />
                    </div>
                    <div className="text-sm text-secondary">@{profile.handle}</div>
                    {profile.bio ? (
                        <BioMarkup
                            className="mt-1.5 truncate text-sm"
                            components={overrideComponents}
                            source={profile.source}
                        >
                            {profile.bio}
                        </BioMarkup>
                    ) : null}
                </div>
                <div className="flex shrink-0 justify-end">
                    <FollowButton profile={profile} />
                </div>
            </Link>
        </div>
    );
});

export function getFollowInList(index: number, profile: Profile) {
    return <ProfileInList profile={profile} key={`${profile.profileId}-${index}`} />;
}
