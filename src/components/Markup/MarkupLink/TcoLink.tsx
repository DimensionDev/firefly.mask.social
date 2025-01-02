import { useQuery } from '@tanstack/react-query';

import { Link } from '@/components/Link.js';
import { TWEET_REGEX } from '@/constants/regexp.js';
import { resolveTCOLink } from '@/helpers/resolveTCOLink.js';
import { stopPropagation } from '@/helpers/stopEvent.js';
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

    if (linkPostId && post?.postId === linkPostId) return null;
    if (linkPostId && post?.quoteOn?.postId === linkPostId) return null;

    return (
        <Link
            href={href}
            className="text-highlight hover:underline"
            onClick={stopPropagation}
            target="_blank"
            rel="noreferrer noopener"
        >
            {href}
        </Link>
    );
}
