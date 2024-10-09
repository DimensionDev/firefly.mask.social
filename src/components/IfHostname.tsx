'use client';

import { useEffect, useState } from 'react';

interface IfHostnameProps {
    isOneOf?: string[];
    isNotOneOf?: string[];
    children: React.ReactNode;
}

export function IfHostname({ isOneOf, isNotOneOf, children }: IfHostnameProps) {
    const [hostname, setHostname] = useState<string | null>(null);

    useEffect(() => {
        setHostname(window.location.hostname);
    }, []);

    if (isOneOf && isOneOf.includes(hostname ?? '')) {
        return <>{children}</>;
    }

    if (isNotOneOf && !isNotOneOf.includes(hostname ?? '')) {
        return <>{children}</>;
    }

    return null;
}
