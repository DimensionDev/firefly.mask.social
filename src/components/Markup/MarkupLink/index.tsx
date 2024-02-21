'use client';

import { safeUnreachable } from '@masknet/kit';
import { memo } from 'react';

import { ExternalLink } from '@/components/Markup/MarkupLink/ExternalLink.js';
import { Hashtag } from '@/components/Markup/MarkupLink/Hashtag.js';
import { MentionLink } from '@/components/Markup/MarkupLink/MentionLink.js';
import { SocialPlatform } from '@/constants/enum.js';
import { createLensProfileFromHandle } from '@/helpers/createLensProfileFromHandle.js';
import { getLensHandleFromMentionTitle } from '@/helpers/getLensHandleFromMentionTitle.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { type Post } from '@/providers/types/SocialMedia.js';

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
                const handle = getLensHandleFromMentionTitle(title);
                if (!handle) return title;

                const link = getProfileUrl(createLensProfileFromHandle(handle));

                return <MentionLink handle={handle} link={link} />;
            }

            case SocialPlatform.Farcaster: {
                const profile = post.mentions?.find((x) => x.handle === title.replace(/^@/, ''));
                if (!profile) return title;

                const link = getProfileUrl(profile);
                return <MentionLink handle={profile.handle} link={link} />;
            }
            default:
                safeUnreachable(source);
                return title;
        }
    }

    if (title.startsWith('#')) return <Hashtag title={title} />;

    return <ExternalLink title={title} />;
});
