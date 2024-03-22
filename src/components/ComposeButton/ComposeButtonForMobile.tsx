import { usePathname } from 'next/navigation.js';

import ComposeAddIcon from '@/assets/compose-add.svg';
import ReplyIcon from '@/assets/reply.svg';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { useCurrentVisitingPost } from '@/hooks/useCurrentVisitingPost.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { ComposeModalRef } from '@/modals/controls.js';

export function ComposeButtonForMobile() {
    const pathname = usePathname();
    const isPostPage = isRoutePathname(pathname, '/post');

    const isLogin = useIsLogin();
    const currentPost = useCurrentVisitingPost();

    if (!isLogin) return null;

    return (
        <button
            className=" fixed bottom-4 right-4 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-[#9250FF] text-white dark:bg-white dark:text-[#9250FF]"
            onClick={() => {
                ComposeModalRef.open({
                    type: isPostPage ? 'reply' : 'compose',
                    post: isPostPage ? currentPost : undefined,
                });
            }}
        >
            {isPostPage ? <ReplyIcon width={24} height={24} /> : <ComposeAddIcon width={24} height={24} />}
        </button>
    );
}
