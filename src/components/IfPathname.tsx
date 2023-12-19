'use client';

import { usePathname } from 'next/navigation.js';
import type { ReactNode } from 'react';

interface IfPathname {
    isStartsWithOneOf?: string[];
    isNotStartsWithOneOf?: string[];
    children: ReactNode;
}

export function IfPathname({ isStartsWithOneOf, isNotStartsWithOneOf, children }: IfPathname) {
    const pathname = usePathname();

    if (isStartsWithOneOf?.some((includedPath) => pathname.startsWith(includedPath))) {
        return <>{children}</>;
    }

    if (isNotStartsWithOneOf && !isNotStartsWithOneOf.some((excludedPath) => pathname.startsWith(excludedPath))) {
        return <>{children}</>;
    }

    return null;
}
