'use client';

import { memo } from 'react';

import { Link } from '@/esm/Link.js';

export const MentionLink = memo<{ handle: string; link: string }>(function MentionLink({ handle, link }) {
    if (!handle) return null;
    return (
        <Link href={link} className="text-link" onClick={(event) => event.stopPropagation()}>
            @{handle}
        </Link>
    );
});
