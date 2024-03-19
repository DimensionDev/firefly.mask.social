import { ChatBubbleOvalLeftIcon } from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation.js';

import ComposeAddIcon from '@/assets/compose-add.svg';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { useCurrentVisitingPost } from '@/hooks/useCurrentVisitingPost.js';
import { ComposeModalRef } from '@/modals/controls.js';

export function ComposeButtonForMobile() {
    const pathname = usePathname();
    const isPostPage = isRoutePathname(pathname, '/post');

    const post = useCurrentVisitingPost();

    return (
        <button
            className=" fixed bottom-4 right-4 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-[#9250FF] text-white dark:bg-white dark:text-[#9250FF]"
            onClick={() => {
                ComposeModalRef.open({
                    type: isPostPage ? 'reply' : 'compose',
                    post: isPostPage ? post : undefined,
                });
            }}
        >
            {isPostPage ? (
                <ChatBubbleOvalLeftIcon width={24} height={24} fontSize={24} />
            ) : (
                <ComposeAddIcon width={24} height={24} />
            )}
        </button>
    );
}
