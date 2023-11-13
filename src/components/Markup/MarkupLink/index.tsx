import { ExternalLink } from '@/components/Markup/MarkupLink/ExternalLink';
import { Hashtag } from '@/components/Markup/MarkupLink/Hashtag';
import { MentionLink } from '@/components/Markup/MarkupLink/MentionLink';
import { memo } from 'react';

export interface MarkupLinkProps {
    title?: string;
}
export const MarkupLink = memo<MarkupLinkProps>(function MarkupLink({ title }) {
    if (!title) return null;

    if (title.startsWith('@')) return <MentionLink title={title} />;

    if (title.startsWith('#')) return <Hashtag title={title} />;

    return <ExternalLink title={title} />;
});
