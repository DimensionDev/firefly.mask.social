import { useQuery } from '@tanstack/react-query';

import { TWEET_REGEX } from '@/constants/regexp.js';
import { Link } from '@/esm/Link.js';
import { resolveTCOLink } from '@/helpers/resolveTCOLink.js';
import type { Post } from '@/providers/types/SocialMedia.js';

export function TcoLink({ title, post }: { title: string; post?: Post }) {
    const { data } = useQuery({
        queryKey: ['tco-link', title],
        queryFn() {
            return resolveTCOLink(title);
        },
    });
    const href = data ?? title;
    const linkPostId = href.match(TWEET_REGEX)?.[3];

    if (post?.postId === linkPostId) return null;
    if (post?.quoteOn?.postId === linkPostId) return null;

    return (
        <Link
            href={href}
            className="text-lightHighlight hover:underline"
            onClick={(event) => event.stopPropagation()}
            target="_blank"
            rel="noreferrer noopener"
        >
            {href}
        </Link>
    );
}
