import { t } from '@lingui/macro';
import { usePathname, useRouter } from 'next/navigation.js';
import { useAsyncFn } from 'react-use';

import { type SocialSource } from '@/constants/enum.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useComeBack } from '@/hooks/useComeback.js';

export function useDeletePost(source: SocialSource) {
    const router = useRouter();
    const pathname = usePathname();
    const navBack = useComeBack();
    return useAsyncFn(
        async (postId: string) => {
            try {
                const provider = resolveSocialMediaProvider(source);
                const result = await provider.deletePost(postId);
                if (!result) throw new Error(`Failed to delete post: ${postId}`);

                if (isRoutePathname(pathname, '/post')) {
                    navBack();
                }
                enqueueSuccessMessage(t`Post was deleted`);
            } catch (error) {
                enqueueErrorMessage(t`Failed to delete`, {
                    error,
                });
            }
        },
        [source, router, pathname, navBack],
    );
}
