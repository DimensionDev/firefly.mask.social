import type { PropsWithChildren } from 'react';

import { Link } from '@/esm/Link.js';

export function Linkable({ url, children }: PropsWithChildren & { url?: string | null }) {
    if (url) {
        return (
            <Link href={url} target="_blank" rel="noopener noreferrer">
                {children}
            </Link>
        );
    }
    return children;
}
