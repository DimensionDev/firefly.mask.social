'use client';

import { safeUnreachable } from '@masknet/kit';
import { memo } from 'react';

import { ExternalLink } from '@/components/Markup/MarkupLink/ExternalLink.js';
import { Hashtag } from '@/components/Markup/MarkupLink/Hashtag.js';
import { MentionLink } from '@/components/Markup/MarkupLink/MentionLink.js';
import { SocialPlatform } from '@/constants/enum.js';
import { createLensProfileFromMentionTitle } from '@/helpers/createLensProfileFromMentionTitle.js';
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
                const link = getProfileUrl(createLensProfileFromMentionTitle(title));

                console.log('DEBUG: markuplink');
                console.log({
                    source,
                    title,
                    post,
                    handle: getLensHandleFromMentionTitle(title),
                });

                return <MentionLink handle={getLensHandleFromMentionTitle(title)} link={link} />;
            }

            case SocialPlatform.Farcaster: {
                const target = post.mentions?.find((x) => x.handle === title.replace(/^@/, ''));
                if (!target) return title;
                const link = getProfileUrl(target);
                return <MentionLink handle={target.handle} link={link} />;
            }
            default:
                safeUnreachable(source);
                return title;
        }
    }

    if (title.startsWith('#')) return <Hashtag title={title} />;

    return <ExternalLink title={title} />;
});
