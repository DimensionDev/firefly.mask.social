'use client';

import { memo } from 'react';

import { Link } from '@/esm/Link.js';
import { getLensHandleFromMentionTitle } from '@/helpers/getLensHandleFromMentionTitle.js';

export const MentionLink = memo<{ title: string; link: string }>(function MentionLink({ title, link }) {
    if (!title) return null;
    return (
        <Link href={link} className="text-link" onClick={(event) => event.stopPropagation()}>
            @{getLensHandleFromMentionTitle(title)}
        </Link>
    );
});
