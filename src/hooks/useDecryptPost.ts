import { t } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import { Source } from '@/constants/enum.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getErrorMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import type { Post } from '@/providers/types/SocialMedia.js';

const ENABLED_DECRYPT_SOURCES = [Source.Lens];

export function useDecryptPost(post: Post) {
    return useAsyncFn(async () => {
        try {
            if (!ENABLED_DECRYPT_SOURCES.includes(post.source)) return null;

            const provider = resolveSocialMediaProvider(post.source);
            return await provider.decryptPost(post);
        } catch (error) {
            enqueueErrorMessage(
                getErrorMessageFromError(error, t`Failed to decrypt post on ${resolveSourceName(post.source)}.`),
                { error },
            );
            return null;
        }
    });
}
