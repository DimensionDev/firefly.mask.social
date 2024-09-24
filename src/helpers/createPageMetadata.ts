import { t } from '@lingui/macro';
import { ChainId } from '@masknet/web3-shared-evm';
import { parseHTML } from 'linkedom';
import { compact } from 'lodash-es';
import urlcat from 'urlcat';

import type { type ProfilePageSource, SocialSourceInURL } from '@/constants/enum.js';
import { Source } from '@/constants/enum.js';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/constants/index.js';
import { createPageTitle, createPageTitleOG } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { formatAddress } from '@/helpers/formatAddress.js';
import { getArticleUrl } from '@/helpers/getArticleUrl.js';
import { getChannelUrl } from '@/helpers/getChannelUrl.js';
import { getPostUrl } from '@/helpers/getPostUrl.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { getStampAvatarByProfileId } from '@/helpers/getStampAvatarByProfileId.js';
import { resolveChannelUrl } from '@/helpers/resolveChannelUrl.js';
import { resolveFireflyProfiles } from '@/helpers/resolveFireflyProfiles.js';
import { resolveNftUrl } from '@/helpers/resolveNftUrl.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';
import { resolveTokenPageUrl } from '@/helpers/resolveTokenPageUrl.js';
import { Coingecko } from '@/providers/coingecko/index.js';
import { FireflyArticleProvider } from '@/providers/firefly/Article.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import { SimpleHashWalletProfileProvider } from '@/providers/simplehash/WalletProfile.js';
import { getProfileById } from '@/services/getProfileById.js';

export async function createWalletProfilePageMetadata(addressOrEns: string) {
    const identity = { id: addressOrEns, source: Source.Wallet } as const;
    const profiles = await FireflySocialMediaProvider.getAllPlatformProfileByIdentity(identity);
    const { walletProfile } = resolveFireflyProfiles(identity, profiles);
    if (!walletProfile) return createSiteMetadata();
    const title = walletProfile.primary_ens
        ? createPageTitleOG(walletProfile.primary_ens)
        : createPageTitleOG(`${formatAddress(walletProfile.address, 4)}`);
    const description = walletProfile.address;
    const images = [getStampAvatarByProfileId(identity.source, identity.id)];
    return createSiteMetadata({
        title,
        description,
        openGraph: {
            type: 'profile',
            url: urlcat(SITE_URL, resolveProfileUrl(identity.source, identity.id)),
            title,
            description,
            images,
        },
        twitter: {
            card: 'summary',
            title,
            description,
            images,
        },
    });
}

export async function createChannelPageMetadata(channelId: string) {
    const source = Source.Farcaster; // TODO: channel only farcaster
    const provider = resolveSocialMediaProvider(source);
    const channel = await provider.getChannelById(channelId).catch(() => null);
    if (!channel) return createSiteMetadata({});
    const title = createPageTitleOG(channel.name);
    const description = channel.description;
    const images = [channel.imageUrl];
    return createSiteMetadata({
        title,
        description,
        openGraph: {
            title,
            description,
            images,
            type: 'profile',
            url: resolveChannelUrl(channelId),
        },
        twitter: {
            card: 'summary',
            title,
            description,
            images,
        },
    });
}

export async function createNFTPageMetadata(address: string, tokenId: string, chainId: ChainId) {
    const data = await SimpleHashWalletProfileProvider.getNFT(
        address,
        tokenId,
        {
            chainId,
        },
        true,
    );
    if (!data?.metadata) return createSiteMetadata({});
    const title = createPageTitleOG(data.metadata.name);
    const description = data.metadata.description;
    const images = data.metadata.imageURL ? [data.metadata.imageURL] : [];
    return createSiteMetadata({
        title,
        description,
        openGraph: {
            title,
            description,
            images,
            url: resolveNftUrl(address, { chainId }),
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images,
        },
    });
}

export async function createNFTCollectionPageMetadata(address: string, chainId: ChainId) {
    const data = await SimpleHashWalletProfileProvider.getCollection(address, { chainId });
    if (!data) return createSiteMetadata({});
    const title = createPageTitleOG(data.name);
    const description = data.description;
    const images = [data.image_url];
    return createSiteMetadata({
        title,
        description,
        openGraph: {
            title,
            description,
            images,
            url: resolveNftUrl(address, { chainId }),
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images,
        },
    });
}

export async function createTokenPageMetadata(symbol: string) {
    const tokens = await Coingecko.getTokens();
    const sym = symbol.toLowerCase();
    const token = tokens.find((x) => x.symbol === sym) || null;
    if (!token) return createSiteMetadata();
    const title = createPageTitleOG(token.symbol);
    const description = token.name;
    const images = token.logoURL ? [token.logoURL] : [];
    return createSiteMetadata({
        title,
        description,
        openGraph: {
            title,
            description,
            images,
            url: resolveTokenPageUrl(symbol),
        },
        twitter: {
            card: 'summary',
            title,
            description,
            images,
        },
    });
}

export async function createArticlePageMetadataById(id: string) {
    const article = await FireflyArticleProvider.getArticleById(id);
    if (!article) return createSiteMetadata();
    const images = article.coverUrl ? [article.coverUrl] : undefined;
    const title = createPageTitleOG(article.title);
    const html = parseHTML(`<html><body>${article.content}</body></html>`);
    const description = html.document.body.innerText;

    return createSiteMetadata({
        title,
        description,
        openGraph: {
            type: 'article',
            url: urlcat(SITE_URL, getArticleUrl(article)),
            title,
            description,
            images,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images,
        },
    });
}

export async function createChannelPageMetadataById(source: SocialSourceInURL, channelId: string) {
    const provider = resolveSocialMediaProvider(resolveSocialSource(source));
    const channel = await provider.getChannelById(channelId);
    if (!channel) return createSiteMetadata();

    const images = [
        {
            url: channel.imageUrl,
        },
    ];

    const title = createPageTitle(`${channel.name} (/${channel.id})`);
    const description = channel.description ?? '';

    return createSiteMetadata({
        title,
        openGraph: {
            type: 'website',
            url: urlcat(SITE_URL, getChannelUrl(channel)),
            title,
            description,
            images,
        },
        twitter: {
            card: 'summary',
            title,
            description,
            images,
        },
    });
}

export async function createProfilePageMetadataById(source: ProfilePageSource, profileId: string) {
    if (source === Source.Wallet) return createWalletProfilePageMetadata(profileId);
    const profile = await getProfileById(source, profileId).catch(() => null);

    if (!profile) return createSiteMetadata();

    const images = [
        {
            url: getStampAvatarByProfileId(source, profileId) || profile.pfp,
        },
    ];

    const title = createPageTitleOG(`@${profile.handle}`);
    const description = profile.bio ?? SITE_DESCRIPTION;

    return createSiteMetadata({
        title,
        description,
        openGraph: {
            type: 'profile',
            url: urlcat(SITE_URL, getProfileUrl(profile)),
            title,
            description,
            images,
        },
        twitter: {
            card: 'summary',
            title,
            description,
            images,
        },
    });
}

export async function createPostPageMetadataById(source: SocialSourceInURL, postId: string) {
    const provider = resolveSocialMediaProvider(resolveSocialSource(source));
    const post = await provider.getPostById(postId).catch(() => null);
    if (!post) return createSiteMetadata();

    const audios = compact(
        post.metadata.content?.attachments?.map((x) => {
            const url = x.type === 'Audio' ? x.uri : undefined;
            return url ? { url } : undefined;
        }),
    );
    const videos = compact(
        post.metadata.content?.attachments?.map((x) => {
            const url = x.type === 'Video' ? x.uri : undefined;
            return url ? { url } : undefined;
        }),
    );

    const ogImage = urlcat(SITE_URL, '/api/og/post/:source/:postId/image', {
        source,
        postId,
    });

    return createSiteMetadata({
        title: post?.author ? t`Post by ${post.author.displayName}` : SITE_NAME,
        openGraph: {
            type: 'article',
            url: urlcat(SITE_URL, getPostUrl(post)),
            title: `Posted by ${post.author.displayName} via Firefly`,
            description: post.metadata.content?.content ?? '',
            images: [ogImage],
            audio: audios,
            videos,
        },
        twitter: {
            card: 'summary_large_image',
            title: `Posted by ${post.author.displayName} via Firefly`,
            description: post.metadata.content?.content ?? '',
            images: [ogImage],
        },
    });
}
