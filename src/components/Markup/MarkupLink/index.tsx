'use client';

import { memo } from 'react';

import { ExternalLink } from '@/components/Markup/MarkupLink/ExternalLink.js';
import { Hashtag } from '@/components/Markup/MarkupLink/Hashtag.js';
import { MentionLink } from '@/components/Markup/MarkupLink/MentionLink.js';
import { SocialPlatform } from '@/constants/enum.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { type Post, ProfileStatus } from '@/providers/types/SocialMedia.js';

export interface MarkupLinkProps {
    title?: string;
    post?: Post;
}
export const MarkupLink = memo<MarkupLinkProps>(function MarkupLink({ title, post }) {
    if (!title) return null;

    if (title.startsWith('@')) {
        if (post?.source === SocialPlatform.Farcaster) {
            const target = post.mentions?.find((x) => x.handle === title.replace('@', ''));
            if (!target) return title;
            const link = getProfileUrl(target);
            return <MentionLink title={title} link={link} />;
        }

        const link = getProfileUrl({
            fullHandle: title,
            source: SocialPlatform.Lens,
            handle: title.replace('@lens/', ''),
            profileId: '',
            displayName: title,
            pfp: '',
            followerCount: 0,
            followingCount: 0,
            status: ProfileStatus.Active,
            verified: true,
        });
        return <MentionLink title={title} link={link} />;
    }

    if (title.startsWith('#')) return <Hashtag title={title} />;

    return <ExternalLink title={title} />;
});
