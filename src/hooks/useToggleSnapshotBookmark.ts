import { t } from '@lingui/macro';
import { useMutation } from '@tanstack/react-query';

import { BookmarkType, FireflyPlatform } from '@/constants/enum.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getErrorMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { LoginModalRef } from '@/modals/controls.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { SnapshotActivity } from '@/providers/snapshot/type.js';

export function useToggleSnapshotBookmark() {
    return useMutation({
        mutationFn: async (snapshot: SnapshotActivity) => {
            if (!fireflySessionHolder.session) {
                LoginModalRef.open();
                return;
            }
            const { hasBookmarked } = snapshot;

            try {
                if (hasBookmarked) {
                    const result = await FarcasterSocialMediaProvider.unbookmark(snapshot.hash);
                    enqueueSuccessMessage(t`Snapshot removed from your Bookmarks`);
                    return result;
                } else {
                    const result = await FarcasterSocialMediaProvider.bookmark(
                        snapshot.hash,
                        FireflyPlatform.DAOs,
                        snapshot.author.id,
                        BookmarkType.Text,
                    );
                    enqueueSuccessMessage(t`Snapshot added to your Bookmarks`);
                    return result;
                }
            } catch (error) {
                enqueueErrorMessage(
                    getErrorMessageFromError(
                        error,
                        hasBookmarked ? t`Failed to un-bookmark snapshot.` : t`Failed to bookmark snapshot.`,
                    ),
                    {
                        error,
                    },
                );
                throw error;
            }
        },
    });
}
