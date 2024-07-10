import { usePathname } from 'next/navigation.js';

import { Link } from '@/esm/Link.js';
import { getPostImageUrl } from '@/helpers/getPostImageUrl.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface WithPreviewLinkProps {
    post: Post;
    index: number;
    disablePreview: boolean;
    children: React.ReactNode;
}

export function WithPreviewLink({ disablePreview, children, post, index }: WithPreviewLinkProps) {
    const pathname = usePathname();
    const isPostPage = isRoutePathname(pathname, '/post/:detail', true);

    return disablePreview ? (
        children
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
