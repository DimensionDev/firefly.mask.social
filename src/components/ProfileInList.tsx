import { isUndefined } from 'lodash-es';

import { Avatar } from '@/components/Avatar.js';
import { BioMarkup } from '@/components/Markup/BioMarkup.js';
import { PlainParagraph, VoidLineBreak } from '@/components/Markup/overrides.js';
import { FollowButton } from '@/components/Profile/FollowButton.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { Link } from '@/esm/Link.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { isCurrentProfile } from '@/helpers/isCurrentProfile.js';
import { useIsSmall } from '@/hooks/useMediaQuery.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

interface ProfileInListProps {
    profile: Profile;
    noFollowButton?: boolean;
    listKey?: string;
    index?: number;
}

const overrideComponents = {
    p: PlainParagraph,
    br: VoidLineBreak,
};
export function ProfileInList({ profile, noFollowButton, listKey, index }: ProfileInListProps) {
    const isSmall = useIsSmall('max');

    const setScrollIndex = useGlobalState.use.setScrollIndex();

    return (
        <div className="flex-start flex cursor-pointer overflow-auto border-b border-secondaryLine p-3 hover:bg-bg dark:border-line">
            <Link
                onClick={() => {
                    if (listKey && !isUndefined(index)) setScrollIndex(listKey, index);
                }}
                className="flex-start flex flex-1 gap-3 overflow-auto"
                href={getProfileUrl(profile)}
            >
                <Avatar
                    className="shrink-0 rounded-full border"
                    src={profile.pfp}
                    size={isSmall ? 40 : 44}
                    alt={profile.displayName}
                />

                <div className="flex-start flex flex-1 flex-col overflow-auto">
                    <p className="flex-start flex items-center text-sm font-bold leading-5">
                        <span className="mr-2 truncate text-xl">{profile.displayName}</span>
                        <SocialSourceIcon className="shrink-0" source={profile.source} />
                    </p>
                    {profile.handle ? <p className="text-sm text-secondary">@{profile.handle}</p> : null}
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
            </Link>

            <div className="ml-2 flex-shrink-0">
                {!noFollowButton && !isCurrentProfile(profile) ? <FollowButton profile={profile} /> : null}
            </div>
        </div>
    );
}
