import { usePathname, useRouter } from 'next/navigation.js';
import { Trans } from 'react-i18next';
import { useAsyncFn } from 'react-use';

import { type SocialPlatform, SourceInURL } from '@/constants/enum.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';

export function useDeletePost(source: SocialPlatform) {
    const router = useRouter();
    const pathname = usePathname();
    return useAsyncFn(
        async (postId: string) => {
            try {
                const provider = resolveSocialMediaProvider(source);
                const result = await provider.deletePost(postId);
                if (!result) throw new Error(`Failed to delete post: ${postId}`);

                if (isRoutePathname(pathname, '/post')) {
                    const url = `/profile?source=${SourceInURL.Lens}`;
                    router.replace(url);
                }
                enqueueSuccessMessage(<Trans>Your post was deleted.</Trans>);
            } catch (error) {
                enqueueErrorMessage(<Trans>Failed to delete post.</Trans>, {
                    error,
                });
            }
        },
        [source, router, pathname],
    );
}
