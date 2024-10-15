'use client';

import { safeUnreachable } from '@masknet/kit';
import { useQuery } from '@tanstack/react-query';
import { memo } from 'react';
import urlcat from 'urlcat';

import { ChannelTag } from '@/components/Markup/MarkupLink/ChannelTag.js';
import { ExternalLink } from '@/components/Markup/MarkupLink/ExternalLink.js';
import { Hashtag } from '@/components/Markup/MarkupLink/Hashtag.js';
import { MentionLink } from '@/components/Markup/MarkupLink/MentionLink.js';
import { NFTCard } from '@/components/Markup/MarkupLink/NFTCard.js';
import { NFTCollection } from '@/components/Markup/MarkupLink/NFTCollection.js';
import { SymbolTag } from '@/components/Markup/MarkupLink/SymbolTag.js';
import { TcoLink } from '@/components/Markup/MarkupLink/TcoLink.js';
import { ProfileTippy } from '@/components/Profile/ProfileTippy.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { HEY_URL } from '@/constants/index.js';
import { BIO_TWITTER_PROFILE_REGEX, EMAIL_REGEX, LENS_HANDLE_REGEXP } from '@/constants/regexp.js';
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
    sourceLink?: string;
}

export const MarkupLink = memo<MarkupLinkProps>(function MarkupLink({ title, post, source, sourceLink }) {
    const { data: fallbackProfile } = useQuery({
        // We only have handle in user bio.
        enabled: !post && source === Source.Farcaster && title?.startsWith('@'),
        queryKey: ['profile-by-handle', source, title],
        queryFn: async () => {
            if (!title) return null;
            const handle = title.slice(1);
            return FireflySocialMediaProvider.getProfileByHandle(handle);
        },
    });

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

    if (title.startsWith('nft://') && sourceLink) {
        const [chainId, contractAddress, last] = title.replace('nft://', '').split('/');
        const tokenId = last.split('?')[0];
        if (!chainId || !contractAddress) return;
        if (tokenId)
            return (
                <NFTCard
                    sourceLink={sourceLink}
                    chainId={Number.parseInt(chainId, 10)}
                    contractAddress={contractAddress}
                    tokenId={tokenId}
                />
            );
        return (
            <NFTCollection
                sourceLink={sourceLink}
                chainId={Number.parseInt(chainId, 10)}
                contractAddress={contractAddress}
            />
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
                className="text-highlight hover:underline"
                onClick={(event) => event.stopPropagation()}
                target="_blank"
                rel="noreferrer noopener"
            >
                {title}
            </Link>
        );
    }

    if (isTCOLink(title)) {
        return <TcoLink title={title} post={post} />;
    }

    return <ExternalLink title={title} />;
});
