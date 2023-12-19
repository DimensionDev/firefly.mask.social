import type {
    AnyPublicationFragment,
    ArticleMetadataV3Fragment,
    AudioMetadataV3Fragment,
    CheckingInMetadataV3Fragment,
    CommentBaseFragment,
    EmbedMetadataV3Fragment,
    EventMetadataV3Fragment,
    FeedItemFragment,
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
import { safeUnreachable } from '@masknet/kit';
import { compact, first, isEmpty, last } from 'lodash-es';

import { SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { URL_REGEX } from '@/constants/regex.js';
import type { Attachment, Post } from '@/providers/types/SocialMedia.js';
import type { MetadataAsset } from '@/types/index.js';

import { formatLensProfile } from './formatLensProfile.js';

const PLACEHOLDER_IMAGE = 'https://static-assets.hey.xyz/images/placeholder.webp';
const allowedTypes = [
    'LegacySimpleCollectModule',
    'LegacyMultirecipientFeeCollectModule',
    'SimpleCollectOpenActionModule',
    'MultirecipientFeeCollectOpenActionModule',
    'UnknownOpenActionModule',
];

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
        return EMPTY_LIST;
    }

    return compact(
        attachments.map((attachment) => {
            const type = attachment.__typename;
            switch (type) {
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
                    safeUnreachable(type);
                    return;
            }
        }),
    );
}

function formatContent(metadata: PublicationMetadataFragment) {
    const type = metadata.__typename;
    switch (type) {
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
                content: metadata.content,
                attachments: getAttachmentsData(metadata.attachments),
            };
        case 'EmbedMetadataV3':
            return {
                content: metadata.content,
                attachments: getAttachmentsData(metadata.attachments),
            };
        case 'LiveStreamMetadataV3':
            return {
                content: metadata.content,
                attachments: getAttachmentsData(metadata.attachments),
            };
        case 'CheckingInMetadataV3':
            return null;
        case 'EventMetadataV3':
            return null;
        case 'SpaceMetadataV3':
            return null;
        case 'StoryMetadataV3':
            return null;
        case 'ThreeDMetadataV3':
            return null;
        case 'TransactionMetadataV3':
            return null;
        default:
            safeUnreachable(type);
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
        ? metadata.attachments?.map((attachment) => {
              const type = attachment.__typename;
              switch (type) {
                  case 'PublicationMetadataMediaAudio':
                      return {
                          url: attachment.audio.raw.uri,
                          mimeType: attachment.audio.raw.mimeType ?? 'audio/*',
                      };
                  case 'PublicationMetadataMediaImage':
                      return {
                          url: attachment.image.raw.uri,
                          mimeType: attachment.image.raw.mimeType ?? 'image/*',
                      };
                  case 'PublicationMetadataMediaVideo':
                      return {
                          url: attachment.video.raw.uri,
                          mimeType: attachment.video.raw.mimeType ?? 'video/*',
                      };
                  default:
                      safeUnreachable(type);
                      return {
                          url: '',
                          mimeType: '',
                      };
              }
          }) ?? undefined
        : undefined;
}

export function formatLensQuoteOrComment(result: CommentBaseFragment | PostFragment | QuoteBaseFragment): Post {
    const profile = formatLensProfile(result.by);
    const timestamp = new Date(result.createdAt).getTime();

    const mediaObjects = getMediaObjects(result.metadata);

    const stats =
        result.__typename === 'Post'
            ? {
                  comments: result.stats.comments,
                  mirrors: result.stats.mirrors,
                  quotes: result.stats.quotes,
                  reactions: result.stats.upvoteReactions,
                  bookmarks: result.stats.bookmarks,
                  countOpenActions: result.stats.countOpenActions,
              }
            : undefined;

    return {
        type: result.__typename,
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
        stats,
        __original__: result,
    };
}

export function formatLensPost(result: AnyPublicationFragment): Post {
    const profile = formatLensProfile(result.by);
    const timestamp = new Date(result.createdAt).getTime();

    if (result.__typename === 'Mirror') {
        const mediaObjects = getMediaObjects(result.mirrorOn.metadata);

        const content = formatContent(result.mirrorOn.metadata);

        const oembedUrl = last(content?.content.match(URL_REGEX) || []);

        const canAct =
            !!result.mirrorOn.openActionModules?.length &&
            result.mirrorOn.openActionModules?.some((openAction) => allowedTypes.includes(openAction.type));
        return {
            type: result.__typename,
            postId: result.id,
            timestamp,
            author: profile,
            isHidden: result.isHidden,
            source: SocialPlatform.Lens,
            mediaObjects,
            metadata: {
                locale: result.mirrorOn.metadata.locale,
                content: {
                    ...content,
                    oembedUrl,
                },
                contentURI: result.mirrorOn.metadata.rawURI,
            },
            canAct,
            __original__: result,
        };
    }

    if (result.metadata.__typename === 'EventMetadataV3') throw new Error('Event not supported');
    const mediaObjects = getMediaObjects(result.metadata);

    const content = formatContent(result.metadata);

    const oembedUrl = last(content?.content.match(URL_REGEX) || []);

    const canAct =
        !!result.openActionModules?.length &&
        result.openActionModules?.some((openAction) => allowedTypes.includes(openAction.type));

    if (result.__typename === 'Quote') {
        return {
            type: result.__typename,
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
                countOpenActions: result.stats.countOpenActions,
            },
            __original__: result,
            canComment: result.operations.canComment === 'YES',
            canMirror: result.operations.canMirror === 'YES',
            hasMirrored: result.operations.hasMirrored,
            hasActed: result.operations.hasActed.value,
            quoteOn: formatLensQuoteOrComment(result.quoteOn),
            canAct,
        };
    } else if (result.__typename === 'Comment') {
        return {
            type: result.__typename,
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
                countOpenActions: result.stats.countOpenActions,
            },
            __original__: result,
            canComment: result.operations.canComment === 'YES',
            canMirror: result.operations.canMirror === 'YES',
            hasMirrored: result.operations.hasMirrored,
            hasActed: result.operations.hasActed.value,
            commentOn: formatLensQuoteOrComment(result.commentOn),
            root:
                result.root && !isEmpty(result.root) && (result.root as PostFragment).id !== result.commentOn.id
                    ? formatLensPost(result.root as PostFragment)
                    : undefined,
            canAct,
        };
    } else {
        return {
            type: result.__typename,
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
                countOpenActions: result.stats.countOpenActions,
            },
            canComment: result.operations.canComment === 'YES',
            canMirror: result.operations.canMirror === 'YES',
            canAct,
            hasMirrored: result.operations.hasMirrored,
            hasLiked: result.operations.hasUpvoted,
            hasActed: result.operations.hasActed.value,
            __original__: result,
        };
    }
}

export function formatLensPostByFeed(result: FeedItemFragment): Post {
    const firstComment = result.comments.length ? first(result.comments) : undefined;
    const post = formatLensPost(firstComment || result.root);
    const mirrors = result.mirrors.map((x) => formatLensProfile(x.by));
    const reactions = result.reactions.map((x) => formatLensProfile(x.by));
    const comments = result.comments.map((x) => formatLensPost(x));

    return {
        ...post,
        comments,
        mirrors,
        reactions,
        commentOn: firstComment ? formatLensPost(result.root) : undefined,
        root:
            firstComment && result.root.__typename === 'Comment'
                ? formatLensQuoteOrComment(result.root.commentOn)
                : undefined,
    };
}
