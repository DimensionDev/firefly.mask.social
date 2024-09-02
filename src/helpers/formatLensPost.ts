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
    MultirecipientFeeCollectOpenActionSettingsFragment,
    PostFragment,
    ProfileFragment,
    PublicationMetadataFragment,
    PublicationMetadataMediaFragment,
    QuoteBaseFragment,
    SimpleCollectOpenActionSettingsFragment,
    SpaceMetadataV3Fragment,
    StoryMetadataV3Fragment,
    TextOnlyMetadataV3Fragment,
    ThreeDMetadataV3Fragment,
    TransactionMetadataV3Fragment,
    VideoMetadataV3Fragment,
} from '@lens-protocol/client';
import { safeUnreachable } from '@masknet/kit';
import { compact, first, isEmpty, last } from 'lodash-es';

import { Source } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { URL_REGEX } from '@/constants/regexp.js';
import { formatLensProfile, formatLensProfileByHandleInfo } from '@/helpers/formatLensProfile.js';
import { getEmbedUrls } from '@/helpers/getEmbedUrls.js';
import { composePollFrameUrl, getPollFrameUrl } from '@/helpers/getPollFrameUrl.js';
import { parseURL } from '@/helpers/parseURL.js';
import { isValidPollFrameUrl } from '@/helpers/resolveEmbedMediaType.js';
import { LensMetadataAttributeKey } from '@/providers/types/Lens.js';
import type { Attachment, Post, Profile } from '@/providers/types/SocialMedia.js';

const PLACEHOLDER_IMAGE = 'https://static-assets.hey.xyz/images/placeholder.webp';
const allowedTypes = ['SimpleCollectOpenActionModule', 'MultirecipientFeeCollectOpenActionModule'];

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

function getOembedUrls(metadata: LinkMetadataV3Fragment | TextOnlyMetadataV3Fragment, author: Profile): string[] {
    return getEmbedUrls(
        metadata.content,
        metadata.attributes?.reduce<string[]>((acc, attr) => {
            if (attr.key === LensMetadataAttributeKey.Poll) {
                acc.push(getPollFrameUrl(attr.value, undefined, author));
            }
            return acc;
        }, []) ?? [],
    ).map((url) => {
        if (isValidPollFrameUrl(url)) return composePollFrameUrl(url, Source.Lens);
        return url;
    });
}

function formatContent(metadata: PublicationMetadataFragment, author: Profile) {
    const type = metadata.__typename;
    switch (type) {
        case 'ArticleMetadataV3':
            return {
                content: metadata.content,
                attachments: getAttachments(metadata.attachments),
            };
        case 'TextOnlyMetadataV3':
            return {
                content: metadata.content,
                oembedUrls: getOembedUrls(metadata, author),
            };
        case 'LinkMetadataV3':
            const parsedLink = parseURL(metadata.sharingLink);
            return {
                content: metadata.content,
                oembedUrls: getEmbedUrls(
                    metadata.content,
                    parsedLink
                        ? isValidPollFrameUrl(parsedLink.toString())
                            ? [composePollFrameUrl(parsedLink.toString(), Source.Lens)]
                            : [parsedLink.toString()]
                        : [],
                ),
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
                  reactions: result.stats.upvotes,
                  bookmarks: result.stats.bookmarks,
                  countOpenActions: result.stats.countOpenActions,
              }
            : undefined;

    return {
        publicationId: result.id,
        type: result.__typename,
        source: Source.Lens,
        postId: result.id,
        timestamp,
        author: profile,
        mediaObjects,
        isHidden: result.isHidden,
        isEncrypted: !!result.metadata.encryptedWith,
        metadata: {
            locale: result.metadata.locale,
            content: formatContent(result.metadata, profile),
            contentURI: result.metadata.rawURI,
        },
        canComment: result.operations.canComment === 'YES',
        canMirror: result.operations.canMirror === 'YES',
        hasMirrored: result.operations.hasMirrored,
        hasQuoted: result.operations.hasQuoted,
        hasActed: result.operations.hasActed.value,
        hasLiked: result.operations.hasUpvoted,
        hasBookmarked: result.operations.hasBookmarked,
        stats,
        __original__: result,
        momoka: result.momoka || undefined,
        sendFrom: result.publishedOn?.id
            ? {
                  displayName: result.publishedOn.id,
                  name: result.publishedOn.id,
              }
            : undefined,
    };
}

/**
 * Remove feeds that posted by muted users.
 */
export function filterFeeds<T extends { by: ProfileFragment }>(posts: T[]): T[] {
    return posts.filter((x) => !x.by.operations.isBlockedByMe.value);
}

export function formatLensPost(result: AnyPublicationFragment): Post {
    const profile = formatLensProfile(result.by);
    const timestamp = new Date(result.createdAt).getTime();

    if (result.__typename === 'Mirror') {
        const mediaObjects = getMediaObjects(result.mirrorOn.metadata);
        const mirrorOnProfile = formatLensProfile(result.mirrorOn.by);
        const content = formatContent(result.mirrorOn.metadata, mirrorOnProfile);
        const oembedUrls = getEmbedUrls(content?.content ?? '', []);

        const canAct =
            !!result.mirrorOn.openActionModules?.length &&
            result.mirrorOn.openActionModules?.some((openAction) => allowedTypes.includes(openAction.type));

        const openActions = result.mirrorOn.openActionModules.filter((module) => allowedTypes.includes(module.type));
        const openAction = first(openActions) as
            | MultirecipientFeeCollectOpenActionSettingsFragment
            | SimpleCollectOpenActionSettingsFragment
            | undefined;

        return {
            publicationId: result.id,
            type: result.__typename,
            postId: result.mirrorOn.id,
            timestamp,
            author: mirrorOnProfile,
            reporter: profile,
            isHidden: result.mirrorOn.isHidden,
            source: Source.Lens,
            mediaObjects,
            metadata: {
                locale: result.mirrorOn.metadata.locale,
                content: {
                    ...content,
                    oembedUrl: last(oembedUrls),
                },
                contentURI: result.mirrorOn.metadata.rawURI,
            },
            stats: {
                comments: result.mirrorOn.stats.comments,
                mirrors: result.mirrorOn.stats.mirrors,
                quotes: result.mirrorOn.stats.quotes,
                reactions: result.mirrorOn.stats.upvotes,
                bookmarks: result.mirrorOn.stats.bookmarks,
                countOpenActions: result.mirrorOn.stats.countOpenActions,
            },
            canComment: result.mirrorOn.operations.canComment === 'YES',
            canMirror: result.mirrorOn.operations.canMirror === 'YES',
            hasMirrored: result.mirrorOn.operations.hasMirrored,
            hasQuoted: result.mirrorOn.operations.hasQuoted,
            hasActed: result.mirrorOn.operations.hasActed.value,
            hasLiked: result.mirrorOn.operations.hasUpvoted,
            hasBookmarked: result.mirrorOn.operations.hasBookmarked,
            mentions: result.mirrorOn.profilesMentioned.map((x) =>
                formatLensProfileByHandleInfo(x.snapshotHandleMentioned),
            ),
            canAct,
            collectModule: canAct
                ? {
                      collectedCount: result.mirrorOn.stats.countOpenActions,
                      collectLimit: parseInt(openAction?.collectLimit || '0', 10),
                      currency: openAction?.amount.asset.symbol,
                      assetAddress: openAction?.amount.asset.contract.address,
                      usdPrice: openAction?.amount.asFiat?.value,
                      amount: parseInt(openAction?.amount.value || '0', 10),
                      referralFee: openAction?.referralFee,
                      followerOnly: openAction?.followerOnly,
                      contract: {
                          address: openAction?.contract.address,
                          chainId: openAction?.contract.chainId,
                      },
                      endsAt: openAction?.endsAt,
                      type: openAction?.type,
                  }
                : undefined,
            __original__: result,
            sendFrom: result.publishedOn?.id
                ? {
                      displayName: result.publishedOn.id,
                      name: result.publishedOn.id,
                  }
                : undefined,
            momoka: result.mirrorOn.momoka || undefined,
        };
    }

    if (result.metadata.__typename === 'EventMetadataV3') throw new Error('Event not supported');
    const mediaObjects = getMediaObjects(result.metadata);

    const content = formatContent(result.metadata, profile);

    const oembedUrl = last(content?.oembedUrls || content?.content.match(URL_REGEX) || []);

    const canAct =
        !!result.openActionModules?.length &&
        result.openActionModules?.some((openAction) => allowedTypes.includes(openAction.type));
    const actions = result.openActionModules.filter((module) => allowedTypes.includes(module.type));
    const openAction = first(actions) as
        | MultirecipientFeeCollectOpenActionSettingsFragment
        | SimpleCollectOpenActionSettingsFragment
        | undefined;

    if (result.__typename === 'Quote') {
        return {
            publicationId: result.id,
            type: result.__typename,
            source: Source.Lens,
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
                reactions: result.stats.upvotes,
                bookmarks: result.stats.bookmarks,
                countOpenActions: result.stats.countOpenActions,
            },
            __original__: result,
            canComment: result.operations.canComment === 'YES',
            canMirror: result.operations.canMirror === 'YES',
            hasMirrored: result.operations.hasMirrored,
            hasQuoted: result.operations.hasQuoted,
            hasActed: result.operations.hasActed.value,
            hasLiked: result.operations.hasUpvoted,
            hasBookmarked: result.operations.hasBookmarked,
            quoteOn: formatLensQuoteOrComment(result.quoteOn),
            mentions: result.profilesMentioned.map((x) => formatLensProfileByHandleInfo(x.snapshotHandleMentioned)),
            canAct,
            collectModule: canAct
                ? {
                      collectedCount: result.stats.countOpenActions,
                      collectLimit: parseInt(openAction?.collectLimit || '0', 10),
                      assetAddress: openAction?.amount.asset.contract.address,
                      currency: openAction?.amount.asset.symbol,
                      usdPrice: openAction?.amount.asFiat?.value,
                      amount: parseInt(openAction?.amount.value || '0', 10),
                      referralFee: openAction?.referralFee,
                      followerOnly: openAction?.followerOnly,
                      contract: {
                          address: openAction?.contract.address,
                          chainId: openAction?.contract.chainId,
                      },
                      endsAt: openAction?.endsAt,
                      type: openAction?.type,
                  }
                : undefined,
            momoka: result.momoka || undefined,
            sendFrom: result.publishedOn?.id
                ? {
                      displayName: result.publishedOn.id,
                      name: result.publishedOn.id,
                  }
                : undefined,
        };
    } else if (result.__typename === 'Comment') {
        return {
            publicationId: result.id,
            type: result.__typename,
            source: Source.Lens,
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
                reactions: result.stats.upvotes,
                bookmarks: result.stats.bookmarks,
                countOpenActions: result.stats.countOpenActions,
            },
            __original__: result,
            commentOn: formatLensQuoteOrComment(result.commentOn),
            canComment: result.operations.canComment === 'YES',
            canMirror: result.operations.canMirror === 'YES',
            hasMirrored: result.operations.hasMirrored,
            hasQuoted: result.operations.hasQuoted,
            hasActed: result.operations.hasActed.value,
            hasLiked: result.operations.hasUpvoted,
            hasBookmarked: result.operations.hasBookmarked,
            firstComment: result.firstComment ? formatLensQuoteOrComment(result.firstComment) : undefined,
            mentions: result.profilesMentioned.map((x) => formatLensProfileByHandleInfo(x.snapshotHandleMentioned)),
            root:
                result.root && !isEmpty(result.root) && (result.root as PostFragment).id !== result.commentOn.id
                    ? formatLensPost(result.root as PostFragment)
                    : undefined,
            canAct,
            collectModule: canAct
                ? {
                      collectedCount: result.stats.countOpenActions,
                      collectLimit: parseInt(openAction?.collectLimit || '0', 10),
                      currency: openAction?.amount.asset.symbol,
                      assetAddress: openAction?.amount.asset.contract.address,
                      usdPrice: openAction?.amount.asFiat?.value,
                      amount: parseInt(openAction?.amount.value || '0', 10),
                      referralFee: openAction?.referralFee,
                      followerOnly: openAction?.followerOnly,
                      contract: {
                          address: openAction?.contract.address,
                          chainId: openAction?.contract.chainId,
                      },
                      endsAt: openAction?.endsAt,
                      type: openAction?.type,
                  }
                : undefined,
            momoka: result.momoka || undefined,
            sendFrom: result.publishedOn?.id
                ? {
                      displayName: result.publishedOn.id,
                      name: result.publishedOn.id,
                  }
                : undefined,
        };
    } else {
        return {
            publicationId: result.id,
            type: result.__typename,
            source: Source.Lens,
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
                reactions: result.stats.upvotes,
                bookmarks: result.stats.bookmarks,
                countOpenActions: result.stats.countOpenActions,
            },
            canComment: result.operations.canComment === 'YES',
            canMirror: result.operations.canMirror === 'YES',
            canAct,
            collectModule: canAct
                ? {
                      collectedCount: result.stats.countOpenActions,
                      collectLimit: parseInt(openAction?.collectLimit || '0', 10),
                      currency: openAction?.amount.asset.symbol,
                      assetAddress: openAction?.amount.asset.contract.address,
                      usdPrice: openAction?.amount.asFiat?.value,
                      amount: parseInt(openAction?.amount.value || '0', 10),
                      referralFee: openAction?.referralFee,
                      followerOnly: openAction?.followerOnly,
                      contract: {
                          address: openAction?.contract.address,
                          chainId: openAction?.contract.chainId,
                      },
                      endsAt: openAction?.endsAt,
                      type: openAction?.type,
                  }
                : undefined,
            hasActed: result.operations.hasActed.value,
            hasMirrored: result.operations.hasMirrored,
            hasQuoted: result.operations.hasQuoted,
            hasLiked: result.operations.hasUpvoted,
            hasBookmarked: result.operations.hasBookmarked,
            mentions: result.profilesMentioned.map((x) => formatLensProfileByHandleInfo(x.snapshotHandleMentioned)),
            __original__: result,
            momoka: result.momoka || undefined,
            sendFrom: result.publishedOn?.id
                ? {
                      displayName: result.publishedOn.id,
                      name: result.publishedOn.id,
                  }
                : undefined,
        };
    }
}

export function formatLensPostByFeed(result: FeedItemFragment): Post | null {
    const firstComment = result.comments.length ? first(result.comments) : undefined;
    const basePost = firstComment || result.root;
    if (basePost.by.operations.isBlockedByMe.value) return null;
    const post = formatLensPost(basePost);
    const mirrors = result.mirrors.map((x) => formatLensProfile(x.by));
    const reactions = result.reactions.map((x) => formatLensProfile(x.by));
    const comments = filterFeeds(result.comments).map((x) => formatLensPost(x));

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
