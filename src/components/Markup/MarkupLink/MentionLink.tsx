'use client';

import { useRouter } from 'next/navigation.js';
import { memo } from 'react';
import urlcat from 'urlcat';

import { Link } from '@/esm/Link.js';

import type { MarkupLinkProps } from './index.js';

const formatMentionTitle = (title: string) => {
    if (title.startsWith('@lens/')) return title.replace('@lens/', '@');

    return title;
};
export const MentionLink = memo<MarkupLinkProps>(function MentionLink({ title }) {
    const router = useRouter();
    if (!title) return null;

    return (
        <Link href={urlcat('/profile/:handle', { handle: formatMentionTitle(title).slice(1) })}>
            <span className="text-link">{formatMentionTitle(title)}</span>
        </Link>
    );
});
