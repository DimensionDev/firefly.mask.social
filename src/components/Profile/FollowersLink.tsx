import { plural } from '@lingui/macro';
import { memo } from 'react';

import { Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface FollowersLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    profile: Profile;
}

export const FollowersLink = memo<FollowersLinkProps>(function FollowersLink({ profile, className }) {
    return (
        <Link
            href={{
                pathname: `/profile/${profile?.profileId}/followers`,
                query: { source: resolveSourceInURL(profile.source) },
            }}
            className={classNames('gap-1 hover:underline', className, {
                'pointer-events-none': profile.source !== Source.Farcaster && profile.source !== Source.Lens,
            })}
        >
            <span className="font-bold text-lightMain">{nFormatter(profile.followerCount)} </span>
            <span className="text-secondary">
                {plural(profile.followerCount, {
                    one: 'Follower',
                    other: 'Followers',
                })}
            </span>
        </Link>
    );
});
