'use client';
import { MarkupLinkProps } from '@/components/Markup/MarkupLink';
import Link from 'next/link';
import { memo } from 'react';
import urlcat from 'urlcat';

const formatMentionTitle = (title: string) => {
    if (title.startsWith('@lens/')) return title.replace('@lens/', '@');

    return title;
};
export const MentionLink = memo<MarkupLinkProps>(function MentionLink({ title }) {
    if (!title) return null;

    return (
        <Link
            href={urlcat('/u/:handle', { handle: formatMentionTitle(title).slice(1) })}
            onClick={(event) => event.stopPropagation()}
        >
            <span className="text-[#8E96FF]">{formatMentionTitle(title)}</span>
        </Link>
    );
});
