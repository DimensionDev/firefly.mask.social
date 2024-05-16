'use client';

import { safeUnreachable } from '@masknet/kit';
import { isValidDomain } from '@masknet/web3-shared-evm';
import { memo } from 'react';

import { ChannelTag } from '@/components/Markup/MarkupLink/ChannelTag.js';
import { ExternalLink } from '@/components/Markup/MarkupLink/ExternalLink.js';
import { Hashtag } from '@/components/Markup/MarkupLink/Hashtag.js';
import { MentionLink } from '@/components/Markup/MarkupLink/MentionLink.js';
import { ProfileTippy } from '@/components/Profile/ProfileTippy.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { BIO_TWITTER_PROFILE_REGEX, EMAIL_REGEX } from '@/constants/regexp.js';
import { Link } from '@/esm/Link.js';
import { createLensProfileFromHandle } from '@/helpers/createLensProfileFromHandle.js';
import { getLensHandleFromMentionTitle } from '@/helpers/getLensHandleFromMentionTitle.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { getTwitterProfileUrl } from '@/helpers/getTwitterProfileUrl.js';
import { type Post } from '@/providers/types/SocialMedia.js';

export interface MarkupLinkProps {
    title?: string;
    post?: Post;
    source?: SocialSource;
}

export const MarkupLink = memo<MarkupLinkProps>(function MarkupLink({ title, post, source }) {
    if (!title) return null;

    if (title.startsWith('@')) {
        const source = post?.source;
        if (!source) return title;

        switch (source) {
            case Source.Lens: {
                const handle = getLensHandleFromMentionTitle(title);
                if (!handle) return title;

                const link = getProfileUrl(createLensProfileFromHandle(handle));
                return (
                    <ProfileTippy className="inline-block" source={Source.Lens} identity={handle}>
                        <MentionLink handle={handle} link={link} />
                    </ProfileTippy>
                );
            }

            case Source.Farcaster: {
                const profile = post.mentions?.find((x) => x.handle === title.replace(/^@/, ''));
                if (!profile) return title;

                const link = getProfileUrl(profile);
                return (
                    <ProfileTippy className="inline-block" source={Source.Farcaster} identity={profile.profileId}>
                        <MentionLink handle={profile.handle} link={link} />
                    </ProfileTippy>
                );
            }

            case Source.Twitter:
                return title;
            default:
                safeUnreachable(source);
                return title;
        }
    }

    if (title.startsWith('#')) return <Hashtag title={title} />;

    if (title.startsWith('/')) {
        return <ChannelTag title={title} source={source} />;
    }

    if (isValidDomain(title)) return title;

    if (EMAIL_REGEX.test(title)) return title;

    if (BIO_TWITTER_PROFILE_REGEX.test(title)) {
        const match = title.match(BIO_TWITTER_PROFILE_REGEX);
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
