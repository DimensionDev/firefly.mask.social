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
import { formatLensProfile } from '@/helpers/formatLensProfile.js';
import type { Attachment, Post } from '@/providers/types/SocialMedia.js';

const PLACEHOLDER_IMAGE = 'https://static-assets.hey.xyz/images/placeholder.webp';
const allowedTypes = [
    'LegacySimpleCollectModule',
    'LegacyMultirecipientFeeCollectModule',
    'SimpleCollectOpenActionModule',
    'MultirecipientFeeCollectOpenActionModule',
    'UnknownOpenActionModule',
];

function getAttachments(attachments?: PublicationMetadataMediaFragment[] | null): Attachment[] {
    if (!attachments) return EMPTY_LIST;

    return compact<Attachment>(
        attachments.map((attachment) => {
            const type = attachment.__typename;
            switch (type) {
                case 'PublicationMetadataMediaImage':
                    if (attachment.image.optimized?.uri) {
                        return {
                            uri: attachment.image.optimized?.uri,
                            type: 'Image',
                        };
                    }
                    return;
                case 'PublicationMetadataMediaVideo':
                    if (attachment.video.optimized?.uri) {
                        return {
                            uri: attachment.video.optimized?.uri,
                            coverUri: attachment.cover?.optimized?.uri,
                            type: 'Video',
                        };
                    }
                    return;
                case 'PublicationMetadataMediaAudio':
                    if (attachment.audio.optimized?.uri) {
                        return {
                            uri: attachment.audio.optimized?.uri,
                            coverUri: attachment.cover?.optimized?.uri,
                            artist: attachment.artist ?? undefined,
                            type: 'Audio',
                        };
                    }
                    return;
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
                attachments: getAttachments(metadata.attachments),
            };
        case 'TextOnlyMetadataV3':
        case 'LinkMetadataV3':
            return {
                content: metadata.content,
            };
        case 'ImageMetadataV3': {
            const asset = metadata.asset.image.optimized?.uri
                ? ({
                      uri: metadata.asset.image.optimized?.uri,
                      type: 'Image',
                  } satisfies Attachment)
                : undefined;

            return {
                content: metadata.content,
                asset,
                attachments: metadata.attachments?.length ? getAttachments(metadata.attachments) : asset ? [asset] : [],
            };
        }
        case 'AudioMetadataV3': {
            const audioAttachments = getAttachments(metadata.attachments)[0];
            const asset = {
                uri: metadata.asset.audio.optimized?.uri || audioAttachments?.uri,
                coverUri: metadata.asset.cover?.optimized?.uri || audioAttachments?.coverUri || PLACEHOLDER_IMAGE,
                artist: metadata.asset.artist || audioAttachments?.artist,
                title: metadata.title,
                type: 'Audio',
            } satisfies Attachment;

            return {
                content: metadata.content,
                asset,
                attachments: [asset],
            };
        }
        case 'VideoMetadataV3': {
            const videoAttachments = getAttachments(metadata.attachments)[0];
            const asset = {
                uri: metadata.asset.video.optimized?.uri || videoAttachments?.uri,
                coverUri: metadata.asset.cover?.optimized?.uri || videoAttachments?.coverUri || PLACEHOLDER_IMAGE,
                type: 'Video',
            } satisfies Attachment;

            return {
                content: metadata.content,
                asset,
                attachments: [asset],
            };
        }
        case 'MintMetadataV3':
            return {
                content: metadata.content,
                attachments: getAttachments(metadata.attachments),
            };
        case 'EmbedMetadataV3':
            return {
                content: metadata.content,
                attachments: getAttachments(metadata.attachments),
            };
        case 'LiveStreamMetadataV3':
            return {
                content: metadata.content,
                attachments: getAttachments(metadata.attachments),
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
        momoka: result.momoka || undefined,
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
            postId: result.mirrorOn.id,
            timestamp,
            author: formatLensProfile(result.mirrorOn.by),
            reporter: profile,
            isHidden: result.mirrorOn.isHidden,
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
            momoka: result.mirrorOn.momoka || undefined,
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
            momoka: result.momoka || undefined,
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
            momoka: result.momoka || undefined,
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
            momoka: result.momoka || undefined,
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
