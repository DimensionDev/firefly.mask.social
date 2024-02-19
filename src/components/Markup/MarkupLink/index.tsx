'use client';

import { safeUnreachable } from '@masknet/kit';
import { memo } from 'react';

import { ExternalLink } from '@/components/Markup/MarkupLink/ExternalLink.js';
import { Hashtag } from '@/components/Markup/MarkupLink/Hashtag.js';
import { MentionLink } from '@/components/Markup/MarkupLink/MentionLink.js';
import { SocialPlatform } from '@/constants/enum.js';
import { getLensHandleFromMentionTitle } from '@/helpers/getLensHandleFromMentionTitle.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { type Post, ProfileStatus } from '@/providers/types/SocialMedia.js';

function createLensProfileFromMentionTitle(mentionTitle: string) {
    return {
        fullHandle: mentionTitle,
        source: SocialPlatform.Lens,
        handle: getLensHandleFromMentionTitle(mentionTitle),
        profileId: '',
        displayName: mentionTitle,
        pfp: '',
        followerCount: 0,
        followingCount: 0,
        status: ProfileStatus.Active,
        verified: true,
    };
}

export interface MarkupLinkProps {
    title?: string;
    post?: Post;
}

export const MarkupLink = memo<MarkupLinkProps>(function MarkupLink({ title, post }) {
    if (!title) return null;

    if (title.startsWith('@')) {
        const source = post?.source;
        if (!source) return title;

        switch (source) {
            case SocialPlatform.Lens: {
                const link = getProfileUrl(createLensProfileFromMentionTitle(title));
                return <MentionLink title={title} link={link} />;
            }

            case SocialPlatform.Farcaster: {
                const target = post.mentions?.find((x) => x.handle === title.replace('@', ''));
                if (!target) return title;
                const link = getProfileUrl(target);
                return <MentionLink title={title} link={link} />;
            }
            default:
                safeUnreachable(source);
                return title;
        }
    }

    if (title.startsWith('#')) return <Hashtag title={title} />;

    return <ExternalLink title={title} />;
});
