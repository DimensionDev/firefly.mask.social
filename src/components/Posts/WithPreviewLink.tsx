import { usePathname } from 'next/navigation.js';

import { PageRoute } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { getPostImageUrl } from '@/helpers/getPostImageUrl.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { stopPropagation } from '@/helpers/stopEvent.js';
import { PreviewMediaModalRef } from '@/modals/controls.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface WithPreviewLinkProps {
    post: Post;
    index: number;
    disablePreview?: boolean;
    children: React.ReactNode;
    useModal?: boolean;
    prefetch?: boolean;
}

export function WithPreviewLink({
    disablePreview = false,
    children,
    post,
    index,
    useModal = false,
    prefetch = false,
}: WithPreviewLinkProps) {
    const pathname = usePathname();
    const isPostPage = isRoutePathname(pathname, PageRoute.PostDetail, true);

    const openPreviewModal = () => {
        PreviewMediaModalRef.open({
            post,
            index,
            source: post.source,
            showAction: false,
        });
    };

    return !disablePreview && !useModal ? (
        <Link
            prefetch={prefetch}
            href={getPostImageUrl(post, index, isPostPage)}
            scroll={false}
            onClick={stopPropagation}
        >
            {children}
        </Link>
    ) : (
        <span
            onClick={(event) => {
                event.stopPropagation();
                if (disablePreview) return;
                openPreviewModal();
            }}
        >
            {children}
        </span>
    );
}
