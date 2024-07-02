import type { PropsWithChildren } from 'react';

import { Link } from '@/esm/Link.js';

export function Linkable({ url, children }: PropsWithChildren & { url?: string | null }) {
    return url ? (
        <Link href={url} target="_blank" rel="noopener noreferrer">
            {children}
        </Link>
    ) : (
        <>{children}</>
    );
}
