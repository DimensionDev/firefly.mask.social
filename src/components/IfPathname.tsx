'use client';

import { usePathname } from 'next/navigation.js';
import type { ReactNode } from 'react';

import type { PageRoute } from '@/constants/enum.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';

interface RE {
    r: string;
    flags?: string;
}

interface IfPathname {
    exact?: boolean;
    isOneOf?: Array<`/${string}` | RE | PageRoute>;
    isNotOneOf?: Array<`/${string}` | RE | PageRoute>;
    children: ReactNode;
}

export function IfPathname({ exact = false, isOneOf, isNotOneOf, children }: IfPathname) {
    const pathname = usePathname();

    if (
        isOneOf &&
        isOneOf.some((includedPath) =>
            typeof includedPath === 'string'
                ? isRoutePathname(pathname, includedPath, exact)
                : new RegExp(includedPath.r, includedPath.flags).test(pathname),
        )
    ) {
        return <>{children}</>;
    }

    if (
        isNotOneOf &&
        !isNotOneOf.some((excludedPath) =>
            typeof excludedPath === 'string'
                ? isRoutePathname(pathname, excludedPath, exact)
                : new RegExp(excludedPath.r, excludedPath.flags).test(pathname),
        )
    ) {
        return <>{children}</>;
    }

    return null;
}
