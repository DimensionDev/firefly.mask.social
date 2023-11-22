'use client';

import { memo } from 'react';

import { ExternalLink } from './ExternalLink.js';
import { Hashtag } from './Hashtag.js';
import { MentionLink } from './MentionLink.js';

export interface MarkupLinkProps {
    title?: string;
}
export const MarkupLink = memo<MarkupLinkProps>(function MarkupLink({ title }) {
    if (!title) return null;

    if (title.startsWith('@')) return <MentionLink title={title} />;

    if (title.startsWith('#')) return <Hashtag title={title} />;

    return <ExternalLink title={title} />;
});
