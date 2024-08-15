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

    const handleClickOnLink = () => {
        if (listKey && !isUndefined(index)) setScrollIndex(listKey, index);
    };

    const profileUrl = getProfileUrl(profile);

    return (
        <div className="flex-start flex gap-3 overflow-auto border-b border-secondaryLine p-3 hover:bg-bg dark:border-line">
            <Link onClick={handleClickOnLink} className="shrink-0" href={profileUrl}>
                <Avatar
                    className="rounded-full border"
                    src={profile.pfp}
                    size={isSmall ? 40 : 44}
                    alt={profile.displayName}
                />
            </Link>
            <div className="min-w-0 flex-grow">
                <div className="flex-start flex gap-3">
                    <div className="flex-start flex flex-1 flex-col overflow-auto">
                        <p className="flex items-center gap-2 text-sm font-bold leading-5">
                            <Link className="truncate text-xl" href={profileUrl}>
                                {profile.displayName}
                            </Link>
                            <SocialSourceIcon className="shrink-0" source={profile.source} />
                        </p>
                        {profile.handle ? (
                            <Link
                                className="self-start text-sm text-secondary"
                                href={profileUrl}
                                onClick={handleClickOnLink}
                            >
                                @{profile.handle}
                            </Link>
                        ) : null}
                    </div>
                    {!noFollowButton && !isCurrentProfile(profile) ? <FollowButton profile={profile} /> : null}
                </div>
                {profile.bio ? (
                    <Link href={profileUrl} onClick={handleClickOnLink}>
                        <BioMarkup
                            className="mt-1.5 truncate text-sm"
                            components={overrideComponents}
                            source={profile.source}
                        >
                            {profile.bio}
                        </BioMarkup>
                    </Link>
                ) : null}
            </div>
        </div>
    );
}
