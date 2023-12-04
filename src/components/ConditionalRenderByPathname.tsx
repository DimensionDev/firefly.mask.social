'use client';

import { usePathname } from 'next/navigation.js';
import type { ReactNode } from 'react';

interface ConditionalRenderByPathnameProps {
    includes?: string[];
    excludes?: string[];
    children: ReactNode;
}

export function ConditionalRenderByPathname({ includes, excludes, children }: ConditionalRenderByPathnameProps) {
    const pathname = usePathname();

    if (includes?.some((includedPath) => pathname.startsWith(includedPath))) {
        return <>{children}</>;
    }

    if (excludes && !excludes.some((excludedPath) => pathname.startsWith(excludedPath))) {
        return <>{children}</>;
    }

    return null;
}
