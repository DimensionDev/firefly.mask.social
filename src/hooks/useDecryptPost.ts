import { t } from '@lingui/macro';
import { useAsyncFn } from 'react-use';
import { useAccount } from 'wagmi';

import { Source } from '@/constants/enum.js';
import { ENABLED_DECRYPT_SOURCES } from '@/constants/index.js';
import { enqueueMessageFromError, enqueueSuccessMessage, enqueueWarningMessage } from '@/helpers/enqueueMessage.js';
import { memoizePromise } from '@/helpers/memoizePromise.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { ConnectModalRef } from '@/modals/controls.js';
import type { Post } from '@/providers/types/SocialMedia.js';

const resolver = memoizePromise(
    async (post: Post) => {
        const provider = resolveSocialMediaProvider(post.source);
        return provider.decryptPost(post);
    },
    (post) => `${post.source}-${post.postId}`,
);

export function useDecryptPost(post: Post) {
    const account = useAccount();

    return useAsyncFn(async () => {
        try {
            if (!ENABLED_DECRYPT_SOURCES.includes(post.source)) return null;

            if (post.source === Source.Lens && !account.address) {
                ConnectModalRef.open();
                return null;
            }

            const result = await resolver(post);
            if (result) {
                enqueueSuccessMessage(t`Post decrypted successfully!`);
            }

            return result;
        } catch (error) {
            const sourceName = resolveSourceName(post.source);
            if (error instanceof Error && error.name === 'CannotDecryptError') {
                enqueueWarningMessage(
                    t`You are not eligible to decrypt this post, try again with eligible ${sourceName} account.`,
                );
            } else {
                enqueueMessageFromError(error, t`Failed to decrypt post on ${sourceName}.`);
            }
            return null;
        }
    }, [account.address, post]);
}
