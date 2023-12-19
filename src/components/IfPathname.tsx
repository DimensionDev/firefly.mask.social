'use client';

import { usePathname } from 'next/navigation.js';
import type { ReactNode } from 'react';

import { isRoutePathname } from '@/helpers/isRoutePathname.js';

interface IfPathname {
    isOneOf?: Array<`/${string}`>;
    isNotOneOf?: Array<`/${string}`>;
    children: ReactNode;
}

export function IfPathname({ isOneOf, isNotOneOf, children }: IfPathname) {
    const pathname = usePathname();

    if (isOneOf?.some((includedPath) => isRoutePathname(pathname, includedPath))) {
        return <>{children}</>;
    }

    if (isNotOneOf && !isNotOneOf.some((excludedPath) => isRoutePathname(pathname, excludedPath))) {
        return <>{children}</>;
    }

    return null;
}
