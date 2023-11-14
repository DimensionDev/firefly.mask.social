import formatLensProfile from '@/helpers/formatLensProfile.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import type { AnyPublicationFragment } from '@lens-protocol/client';

export default function formatLensPost(result: AnyPublicationFragment): Post {
    const profile = formatLensProfile(result.by);
    const timestamp = new Date(result.createdAt).getTime();

    if (result.__typename === 'Mirror') {
        return {
            postId: result.id,
            timestamp,
            author: profile,
            isHidden: result.isHidden,
            metadata: {
                locale: '',
                content: '',
                contentURI: '',
            },
            __original__: result,
        };
    }

    if (result.metadata.__typename === 'EventMetadataV3') throw new Error('Event not supported');
    const mediaObjects =
        result.metadata.__typename !== 'StoryMetadataV3' && result.metadata.__typename !== 'TextOnlyMetadataV3'
            ? result.metadata.attachments?.map((attachment) =>
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

    return {
        postId: result.id,
        timestamp,
        author: profile,
        mediaObjects,
        isHidden: result.isHidden,
        isEncrypted: !!result.metadata.encryptedWith,
        metadata: {
            locale: result.metadata.locale,
            content: result.metadata.content,
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
    };
}
