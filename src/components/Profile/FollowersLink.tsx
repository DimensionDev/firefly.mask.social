import { plural } from '@lingui/macro';
import { type HTMLProps, memo } from 'react';

import { Link } from '@/components/Link.js';
import { FollowCategory, Source } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface FollowersLinkProps extends HTMLProps<HTMLAnchorElement> {
    profile: Profile;
}

export const FollowersLink = memo<FollowersLinkProps>(function FollowersLink({ profile, className }) {
    return (
        <Link
            href={resolveProfileUrl(profile.source, profile.profileId, FollowCategory.Followers)}
            className={classNames('gap-1 hover:underline', className, {
                'pointer-events-none': profile.source !== Source.Farcaster && profile.source !== Source.Lens,
            })}
        >
            <data value={profile.followerCount}>
                <span className="font-bold text-lightMain">{nFormatter(profile.followerCount)} </span>
                <span className="text-secondary">
                    {plural(profile.followerCount, {
                        one: 'Follower',
                        other: 'Followers',
                    })}
                </span>
            </data>
        </Link>
    );
});
