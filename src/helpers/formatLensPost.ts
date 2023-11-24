import type {
    AnyPublicationFragment,
    ArticleMetadataV3Fragment,
    AudioMetadataV3Fragment,
    CheckingInMetadataV3Fragment,
    CommentBaseFragment,
    EmbedMetadataV3Fragment,
    EventMetadataV3Fragment,
    ImageMetadataV3Fragment,
    LinkMetadataV3Fragment,
    LiveStreamMetadataV3Fragment,
    MintMetadataV3Fragment,
    PostFragment,
    PublicationMetadataFragment,
    PublicationMetadataMediaFragment,
    QuoteBaseFragment,
    SpaceMetadataV3Fragment,
    StoryMetadataV3Fragment,
    TextOnlyMetadataV3Fragment,
    ThreeDMetadataV3Fragment,
    TransactionMetadataV3Fragment,
    VideoMetadataV3Fragment,
} from '@lens-protocol/client';
import { compact, last } from 'lodash-es';

import { SocialPlatform } from '@/constants/enum.js';
import { URL_REGEX } from '@/constants/regex.js';
import type { Attachment, Post } from '@/providers/types/SocialMedia.js';
import type { MetadataAsset } from '@/types/index.js';

import { formatLensProfile } from './formatLensProfile.js';

const PLACEHOLDER_IMAGE = 'https://static-assets.hey.xyz/images/placeholder.webp';

const removeUrlsByHostnames = (content: string, hostnames: Set<string>) => {
    const regexPattern = Array.from(hostnames)
        .map((hostname) => `https?:\\/\\/(www\\.)?${hostname.replace('.', '\\.')}[\\S]+`)
        .join('|');
    const regex = new RegExp(regexPattern, 'g');

    return content
        .replace(regex, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
};

function getAttachmentsData(attachments?: PublicationMetadataMediaFragment[] | null): Attachment[] {
    if (!attachments) {
        return [];
    }

    return compact(
        attachments.map((attachment) => {
            switch (attachment.__typename) {
                case 'PublicationMetadataMediaImage':
                    return {
                        uri: attachment.image.optimized?.uri,
                        type: 'Image',
                    };
                case 'PublicationMetadataMediaVideo':
                    return {
                        uri: attachment.video.optimized?.uri,
                        coverUri: attachment.cover?.optimized?.uri,
                        type: 'Video',
                    };
                case 'PublicationMetadataMediaAudio':
                    return {
                        uri: attachment.audio.optimized?.uri,
                        coverUri: attachment.cover?.optimized?.uri,
                        artist: attachment.artist,
                        type: 'Audio',
                    };
                default:
                    return;
            }
        }),
    );
}

function formatContent(metadata: PublicationMetadataFragment) {
    switch (metadata.__typename) {
        case 'ArticleMetadataV3':
            return {
                content: metadata.content,
                attachments: getAttachmentsData(metadata.attachments),
            };
        case 'TextOnlyMetadataV3':
        case 'LinkMetadataV3':
            return {
                content: metadata.content,
            };
        case 'ImageMetadataV3':
            return {
                content: metadata.content,
                asset: {
                    uri: metadata.asset.image.optimized?.uri,
                    type: 'Image',
                } as MetadataAsset,
                attachments: getAttachmentsData(metadata.attachments),
            };
        case 'AudioMetadataV3':
            const audioAttachments = getAttachmentsData(metadata.attachments)[0];

            return {
                content: metadata.content,
                asset: {
                    uri: metadata.asset.audio.optimized?.uri || audioAttachments?.uri,
                    cover: metadata.asset.cover?.optimized?.uri || audioAttachments?.coverUri || PLACEHOLDER_IMAGE,
                    artist: metadata.asset.artist || audioAttachments?.artist,
                    title: metadata.title,
                    type: 'Audio',
                } as MetadataAsset,
            };
        case 'VideoMetadataV3':
            const videoAttachments = getAttachmentsData(metadata.attachments)[0];

            return {
                content: metadata.content,
                asset: {
                    uri: metadata.asset.video.optimized?.uri || videoAttachments?.uri,
                    cover: metadata.asset.cover?.optimized?.uri || videoAttachments?.coverUri || PLACEHOLDER_IMAGE,
                    type: 'Video',
                } as MetadataAsset,
            };
        case 'MintMetadataV3':
            return {
                content: removeUrlsByHostnames(
                    metadata.content,
                    new Set(['zora.co', 'testnet.zora.co', 'basepaint.art', 'unlonely.app']),
                ),
                attachments: getAttachmentsData(metadata.attachments),
            };
        case 'EmbedMetadataV3':
            return {
                content: removeUrlsByHostnames(metadata.content, new Set(['snapshot.org'])),
                attachments: getAttachmentsData(metadata.attachments),
            };
        case 'LiveStreamMetadataV3':
            return {
                content: metadata.content,
                attachments: getAttachmentsData(metadata.attachments),
            };
        default:
            return null;
    }
}

function getMediaObjects(
    metadata:
        | ArticleMetadataV3Fragment
        | AudioMetadataV3Fragment
        | CheckingInMetadataV3Fragment
        | EmbedMetadataV3Fragment
        | EventMetadataV3Fragment
        | ImageMetadataV3Fragment
        | LinkMetadataV3Fragment
        | LiveStreamMetadataV3Fragment
        | MintMetadataV3Fragment
        | SpaceMetadataV3Fragment
        | StoryMetadataV3Fragment
        | TextOnlyMetadataV3Fragment
        | ThreeDMetadataV3Fragment
        | TransactionMetadataV3Fragment
        | VideoMetadataV3Fragment,
) {
    return metadata.__typename !== 'StoryMetadataV3' && metadata.__typename !== 'TextOnlyMetadataV3'
        ? metadata.attachments?.map((attachment) =>
              attachment.__typename === 'PublicationMetadataMediaAudio'
                  ? {
                        url: attachment.audio.raw.uri,
                        mimeType: attachment.audio.raw.mimeType ?? 'audio/*',
                    }
                  : attachment.__typename === 'PublicationMetadataMediaImage'
                    ? {
                          url: attachment.image.raw.uri,
                          mimeType: attachment.image.raw.mimeType ?? 'image/*',
                      }
                    : attachment.__typename === 'PublicationMetadataMediaVideo'
                      ? {
                            url: attachment.video.raw.uri,
                            mimeType: attachment.video.raw.mimeType ?? 'video/*',
                        }
                      : {
                            url: '',
                            mimeType: '',
                        },
          ) ?? undefined
        : undefined;
}

export function formatLensQuote(result: CommentBaseFragment | PostFragment | QuoteBaseFragment): Post {
    const profile = formatLensProfile(result.by);
    const timestamp = new Date(result.createdAt).getTime();

    const mediaObjects = getMediaObjects(result.metadata);

    return {
        source: SocialPlatform.Lens,
        postId: result.id,
        timestamp,
        author: profile,
        mediaObjects,
        isHidden: result.isHidden,
        isEncrypted: !!result.metadata.encryptedWith,
        metadata: {
            locale: result.metadata.locale,
            content: formatContent(result.metadata),
            contentURI: result.metadata.rawURI,
        },
        __original__: result,
    };
}

export function formatLensPost(result: AnyPublicationFragment): Post {
    const profile = formatLensProfile(result.by);
    const timestamp = new Date(result.createdAt).getTime();

    if (result.__typename === 'Mirror') {
        return {
            postId: result.id,
            timestamp,
            author: profile,
            isHidden: result.isHidden,
            source: SocialPlatform.Lens,
            metadata: {
                locale: '',
                content: null,
                contentURI: '',
            },
            __original__: result,
        };
    }

    if (result.metadata.__typename === 'EventMetadataV3') throw new Error('Event not supported');
    const mediaObjects = getMediaObjects(result.metadata);

    const content = formatContent(result.metadata);

    const showNFT = result.metadata.__typename === 'MintMetadataV3';
    const showLive = result.metadata.__typename === 'LiveStreamMetadataV3';
    const showEmbed = result.metadata.__typename === 'EmbedMetadataV3';
    const showAttachments = (content?.attachments?.length && content.attachments.length > 0) || content?.asset;
    const oembedUrl =
        !showNFT && !showLive && !showEmbed && !showAttachments
            ? last(content?.content.match(URL_REGEX) || [])
            : undefined;

    if (result.__typename === 'Quote') {
        return {
            source: SocialPlatform.Lens,
            postId: result.id,
            timestamp,
            author: profile,
            mediaObjects,
            isHidden: result.isHidden,
            isEncrypted: !!result.metadata.encryptedWith,
            metadata: {
                locale: result.metadata.locale,
                content: {
                    ...content,
                    oembedUrl,
                },
                contentURI: result.metadata.rawURI,
            },
            stats: {
                comments: result.stats.comments,
                mirrors: result.stats.mirrors,
                quotes: result.stats.quotes,
                reactions: result.stats.upvoteReactions,
                bookmarks: result.stats.bookmarks,
            },
            __original__: result,
            canComment: result.operations.canComment === 'YES',
            canMirror: result.operations.canMirror === 'YES',
            hasMirrored: result.operations.hasMirrored,
            quoteOn: formatLensQuote(result.quoteOn),
        };
    }

    return {
        source: SocialPlatform.Lens,
        postId: result.id,
        timestamp,
        author: profile,
        mediaObjects,
        isHidden: result.isHidden,
        isEncrypted: !!result.metadata.encryptedWith,
        metadata: {
            locale: result.metadata.locale,
            content: {
                ...content,
                oembedUrl,
            },
            contentURI: result.metadata.rawURI,
        },
        stats: {
            comments: result.stats.comments,
            mirrors: result.stats.mirrors,
            quotes: result.stats.quotes,
            reactions: result.stats.upvoteReactions,
            bookmarks: result.stats.bookmarks,
        },
        canComment: result.operations.canComment === 'YES',
        canMirror: result.operations.canMirror === 'YES',
        hasMirrored: result.operations.hasMirrored,
        hasLiked: result.operations.hasUpvoted,
        __original__: result,
    };
}
