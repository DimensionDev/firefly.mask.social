'use client';

import { safeUnreachable } from '@masknet/kit';
import { isValidDomain } from '@masknet/web3-shared-evm';
import { memo } from 'react';

import { ExternalLink } from '@/components/Markup/MarkupLink/ExternalLink.js';
import { Hashtag } from '@/components/Markup/MarkupLink/Hashtag.js';
import { MentionLink } from '@/components/Markup/MarkupLink/MentionLink.js';
import { SocialPlatform } from '@/constants/enum.js';
import { BIO_TWITTER_PROFILE_REGE } from '@/constants/regex.js';
import { Link } from '@/esm/Link.js';
import { createLensProfileFromHandle } from '@/helpers/createLensProfileFromHandle.js';
import { getLensHandleFromMentionTitle } from '@/helpers/getLensHandleFromMentionTitle.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { getTwitterProfileUrl } from '@/helpers/getTwitterProfileUrl.js';
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

    if (isValidDomain(title)) return title;

    if (BIO_TWITTER_PROFILE_REGE.test(title)) {
        const match = title.match(BIO_TWITTER_PROFILE_REGE);
        if (!match) return title;
        const href = getTwitterProfileUrl(match[1]);
        return (
            <Link
                href={href}
                className="text-link hover:underline"
                onClick={(event) => event.stopPropagation()}
                target="_blank"
                rel="noreferrer noopener"
            >
                {title}
            </Link>
        );
    }

    return <ExternalLink title={title} />;
});
