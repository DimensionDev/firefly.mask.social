import { t } from '@lingui/macro';
import { ZERO_ADDRESS } from '@masknet/web3-shared-evm';
import { useIsMutating, useMutation } from '@tanstack/react-query';

import { FireflyPlatform } from '@/constants/enum.js';
import { enqueueMessageFromError, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { LoginModalRef } from '@/modals/controls.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';

export function useToggleNFTBookmark(options: { owner: string; nftId: string }) {
    const isLogin = useIsLogin();
    const mutationKey = ['toggle-bookmark', FireflyPlatform.NFTs, options.nftId];
    const isMutating = useIsMutating({ mutationKey, exact: true }) > 0;

    const mutation = useMutation({
        mutationKey,
        mutationFn: async (hasBookmarked: boolean) => {
            if (!isLogin) {
                LoginModalRef.open();
                return;
            }

            const owner = options.owner || ZERO_ADDRESS;

            try {
                const result = !hasBookmarked
                    ? await FireflySocialMediaProvider.bookmarkNFT(options.nftId, owner)
                    : await FireflySocialMediaProvider.unbookmarkNFT(options.nftId, owner);
                if (!result) {
                    throw new Error('Bookmark operation failed.');
                }
                enqueueSuccessMessage(
                    hasBookmarked ? t`NFT removed from your Bookmarks` : t`NFT added to your Bookmarks`,
                );
                return result;
            } catch (error) {
                enqueueMessageFromError(
                    error,
                    hasBookmarked ? t`Failed to un-bookmark NFT.` : t`Failed to bookmark NFT.`,
                );
                throw error;
            }
        },
    });

    return [isMutating, mutation] as const;
}
