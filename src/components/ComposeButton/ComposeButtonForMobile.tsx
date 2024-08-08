import { usePathname } from 'next/navigation.js';

import ComposeAddIcon from '@/assets/compose-add.svg';
import ReplyIcon from '@/assets/reply.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { Source } from '@/constants/enum.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { narrowToSocialSource } from '@/helpers/narrowToSocialSource.js';
import { useCurrentVisitingChannel } from '@/hooks/useCurrentVisitingChannel.js';
import { useCurrentVisitingPost } from '@/hooks/useCurrentVisitingPost.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { ComposeModalRef } from '@/modals/controls.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export function ComposeButtonForMobile() {
    const currentSource = useGlobalState.use.currentSource();
    const currentSocialSource = narrowToSocialSource(currentSource);

    const pathname = usePathname();
    const isPostPage = isRoutePathname(pathname, '/post/:detail', true);
    const isArticlePage = isRoutePathname(pathname, '/article/:detail', true);
    const isNFTPage = isRoutePathname(pathname, '/nft/:detail', false);
    const isLogin = useIsLogin();
    const isCurrentLogin = useIsLogin(currentSocialSource);
    const currentPost = useCurrentVisitingPost();
    const currentChannel = useCurrentVisitingChannel();

    if (!isLogin) return null;
    if (isPostPage && !isCurrentLogin) return null;
    if (isArticlePage || currentSource === Source.NFTs || currentSource === Source.Article || isNFTPage) return null;

    return (
        <ClickableButton
            className="fixed bottom-4 right-4 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-fireflyBrand text-white outline-none dark:bg-white dark:text-fireflyBrand"
            onClick={() => {
                ComposeModalRef.open({
                    type: isPostPage ? 'reply' : 'compose',
                    post: currentPost,
                    channel: currentChannel,
                    source: isPostPage ? currentSocialSource : undefined,
                });
            }}
        >
            {isPostPage ? <ReplyIcon width={24} height={24} /> : <ComposeAddIcon width={24} height={24} />}
        </ClickableButton>
    );
}
