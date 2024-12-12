import { t } from '@lingui/macro';
import { useAsyncFn } from 'react-use';
import { useAccount } from 'wagmi';

import { Source } from '@/constants/enum.js';
import { ENABLED_DECRYPT_SOURCES } from '@/constants/index.js';
import { enqueueMessageFromError, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
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
            enqueueMessageFromError(error, t`Failed to decrypt post on ${resolveSourceName(post.source)}.`);
            return null;
        }
    }, [account.address, post]);
}
