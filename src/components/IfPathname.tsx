'use client';

import { usePathname } from 'next/navigation.js';
import type { ReactNode } from 'react';

interface IfPathname {
    isOneOf?: string[];
    isNotOneOf?: string[];
    children: ReactNode;
}

export function IfPathname({ isOneOf: includes, isNotOneOf: excludes, children }: IfPathname) {
    const pathname = usePathname();

    if (includes?.some((includedPath) => pathname.startsWith(includedPath))) {
        return <>{children}</>;
    }

    if (excludes && !excludes.some((excludedPath) => pathname.startsWith(excludedPath))) {
        return <>{children}</>;
    }

    return null;
}
