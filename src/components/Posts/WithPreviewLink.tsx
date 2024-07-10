import { usePathname } from 'next/navigation.js';

import { Link } from '@/esm/Link.js';
import { getPostImageUrl } from '@/helpers/getPostImageUrl.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { PreviewMediaModalRef } from '@/modals/controls.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface WithPreviewLinkProps {
    post: Post;
    index: number;
    disablePreview: boolean;
    children: React.ReactNode;
    useModal?: boolean;
}

export function WithPreviewLink({ disablePreview, children, post, index, useModal = false }: WithPreviewLinkProps) {
    const pathname = usePathname();
    const isPostPage = isRoutePathname(pathname, '/post/:detail', true);

    const openPreviewModal = () => {
        PreviewMediaModalRef.open({
            post,
            index: index.toString(),
            source: post.source,
        });
    };

    return disablePreview ? (
        children
    ) : useModal ? (
        <span
            onClick={(event) => {
                event.stopPropagation();
                openPreviewModal();
            }}
        >
            {children}
        </span>
    ) : (
        <Link
            href={getPostImageUrl(post, index, isPostPage)}
            scroll={false}
            onClick={(event) => {
                event.stopPropagation();
            }}
        >
            {children}
        </Link>
    );
}
