'use client';

import { memo } from 'react';

import { SocialPlatform } from '@/constants/enum.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { type Post, ProfileStatus } from '@/providers/types/SocialMedia.js';

import { ExternalLink } from './ExternalLink.js';
import { Hashtag } from './Hashtag.js';
import { MentionLink } from './MentionLink.js';

export interface MarkupLinkProps {
    title?: string;
    post: Post;
}
export const MarkupLink = memo<MarkupLinkProps>(function MarkupLink({ title, post }) {
    if (!title) return null;

    if (title.startsWith('@')) {
        if (post.source === SocialPlatform.Farcaster) {
            const target = post.mentions?.find((x) => x.handle === title.replace('@', ''));
            if (!target) return title;
            const link = getProfileUrl(target);
            return <MentionLink title={title} link={link} />;
        }

        const link = getProfileUrl({
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
