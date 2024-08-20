'use client';

import { safeUnreachable } from '@masknet/kit';
import { useQuery } from '@tanstack/react-query';
import { last } from 'lodash-es';
import { memo } from 'react';
import { Tweet } from 'react-tweet';
import urlcat from 'urlcat';

import { ChannelTag } from '@/components/Markup/MarkupLink/ChannelTag.js';
import { ExternalLink } from '@/components/Markup/MarkupLink/ExternalLink.js';
import { Hashtag } from '@/components/Markup/MarkupLink/Hashtag.js';
import { MentionLink } from '@/components/Markup/MarkupLink/MentionLink.js';
import { SymbolTag } from '@/components/Markup/MarkupLink/SymbolTag.js';
import { TcoLink } from '@/components/Markup/MarkupLink/TcoLink.js';
import { ProfileTippy } from '@/components/Profile/ProfileTippy.js';
import { components } from '@/components/Tweet/index.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { HEY_URL } from '@/constants/index.js';
import { BIO_TWITTER_PROFILE_REGEX, EMAIL_REGEX, LENS_HANDLE_REGEXP, TWEET_REGEX } from '@/constants/regexp.js';
import { Link } from '@/esm/Link.js';
import { createDummyProfileFromLensHandle } from '@/helpers/createDummyProfile.js';
import { getLensHandleFromMentionTitle } from '@/helpers/getLensHandleFromMentionTitle.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { getTwitterProfileUrl } from '@/helpers/getTwitterProfileUrl.js';
import { isValidDomain } from '@/helpers/isValidDomain.js';
import { isTCOLink } from '@/helpers/resolveTCOLink.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import { type Post } from '@/providers/types/SocialMedia.js';

export interface MarkupLinkProps {
    title?: string;
    post?: Post;
    source?: SocialSource;
    supportTweet?: boolean;
}

export const MarkupLink = memo<MarkupLinkProps>(function MarkupLink({ title, post, source, supportTweet }) {
    // We only have handle in user bio.
    const enabled = !post && source === Source.Farcaster && title?.startsWith('@');
    const { data: fallbackProfile } = useQuery({
        enabled,
        queryKey: ['profile-by-handle', source, title],
        queryFn: async () => {
            if (!title) return null;
            const handle = title.slice(1);
            return FireflySocialMediaProvider.getProfileByHandle(handle);
        },
    });

    console.log(title);
    if (!title) return null;

    if (title.startsWith('@')) {
        if (!source) return title;

        switch (source) {
            case Source.Lens: {
                const handle = getLensHandleFromMentionTitle(title);
                if (!handle) return title;

                const link = getProfileUrl(createDummyProfileFromLensHandle(handle));
                return (
                    <ProfileTippy
                        identity={{
                            source: Source.Lens,
                            id: handle,
                        }}
                    >
                        <MentionLink handle={handle} href={link} className="inline-block" />
                    </ProfileTippy>
                );
            }

            case Source.Farcaster: {
                const profile = post
                    ? post.mentions?.find((x) => x.handle === title.replace(/^@/, ''))
                    : fallbackProfile;
                if (!profile) return title;

                const link = getProfileUrl(profile);
                return (
                    <ProfileTippy
                        identity={{
                            source: Source.Farcaster,
                            id: profile.profileId,
                        }}
                    >
                        <MentionLink handle={profile.handle} href={link} className="inline-block" />
                    </ProfileTippy>
                );
            }

            case Source.Twitter:
                const profile = post?.mentions?.find((x) => x.handle === title.replace(/^@/, ''));
                if (!profile) return title;
                return (
                    <ProfileTippy
                        identity={{
                            source: Source.Twitter,
                            id: profile.profileId,
                        }}
                    >
                        <MentionLink handle={profile.handle} href={getProfileUrl(profile)} className="inline-block" />
                    </ProfileTippy>
                );
            default:
                safeUnreachable(source);
                return title;
        }
    }

    const trimmed = title.trim();
    const tagPadding = title.startsWith(' ') ? ' ' : null;
    if (trimmed.startsWith('#'))
        return (
            <>
                {tagPadding}
                <Hashtag title={trimmed} source={source} />
            </>
        );
    if (trimmed.startsWith('$'))
        return (
            <>
                {tagPadding}
                <SymbolTag title={trimmed} source={source} />
            </>
        );

    if (trimmed.startsWith('/')) {
        return (
            <>
                {tagPadding}
                <ChannelTag title={trimmed} source={source} />
            </>
        );
    }

    if (LENS_HANDLE_REGEXP.test(title)) {
        const handle = title.replace('.lens', '');
        return (
            <Link
                href={urlcat(HEY_URL, '/u/:handle', { handle })}
                className="text-link hover:underline"
                onClick={(event) => event.stopPropagation()}
                target="_blank"
                rel="noreferrer noopener"
            >
                {title}
            </Link>
        );
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
                className="text-lightHighlight hover:underline"
                onClick={(event) => event.stopPropagation()}
                target="_blank"
                rel="noreferrer noopener"
            >
                {title}
            </Link>
        );
    }

    if (new RegExp(TWEET_REGEX).test(title) && supportTweet) {
        const id = last(title.match(TWEET_REGEX));
        if (!id) return <ExternalLink title={title} />;
        return <Tweet id={id} components={components} />;
    }

    if (isTCOLink(title)) {
        return <TcoLink title={title} post={post} />;
    }

    return <ExternalLink title={title} />;
});
