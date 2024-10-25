import { t } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { useAsyncFn } from 'react-use';

import { Source } from '@/constants/enum.js';
import { checkFarcasterInvalidSignerKey } from '@/helpers/checkFarcasterInvalidSignerKey.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { capturePostActionEvent } from '@/providers/telemetry/capturePostActionEvent.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';
import type { Post } from '@/providers/types/SocialMedia.js';

export function useMirror(post: Post) {
    const { postId, source, hasMirrored } = post;

    return useAsyncFn(
        async (unmirror?: boolean) => {
            if (!postId) return;

            const mirrorOrUnmirror = async () => {
                switch (source) {
                    case Source.Farcaster: {
                        const result = await (hasMirrored
                            ? FarcasterSocialMediaProvider.unmirrorPost(postId, Number(post.author.profileId))
                            : FarcasterSocialMediaProvider.mirrorPost(postId, {
                                  authorId: Number(post.author.profileId),
                              }));
                        enqueueSuccessMessage(hasMirrored ? t`Cancel recast successfully` : t`Recasted`);
                        return result;
                    }
                    case Source.Lens: {
                        const result = await (unmirror
                            ? LensSocialMediaProvider.unmirrorPost(post.publicationId)
                            : LensSocialMediaProvider.mirrorPost(postId));
                        enqueueSuccessMessage(unmirror ? t`Cancel mirror successfully` : t`Mirrored`);
                        return result;
                    }
                    case Source.Twitter:
                        const result = await (hasMirrored
                            ? TwitterSocialMediaProvider.unmirrorPost(postId)
                            : TwitterSocialMediaProvider.mirrorPost(postId));
                        enqueueSuccessMessage(hasMirrored ? t`Cancel repost successfully` : t`Reposted`);
                        return result;
                    default:
                        safeUnreachable(source);
                        return;
                }
            };

            try {
                await mirrorOrUnmirror();

                capturePostActionEvent(hasMirrored ? 'undo_repost' : 'repost', post);
            } catch (error) {
                switch (source) {
                    case Source.Farcaster:
                        enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to recast.`), {
                            error,
                        });
                        break;
                    case Source.Lens:
                        enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to mirror.`), {
                            error,
                        });
                        break;
                    case Source.Twitter:
                        enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to repost.`), {
                            error,
                        });
                        break;
                    default:
                        safeUnreachable(source);
                        break;
                }

                checkFarcasterInvalidSignerKey(error);

                throw error;
            }
        },
        [postId, source, hasMirrored, post.author.profileId],
    );
}
