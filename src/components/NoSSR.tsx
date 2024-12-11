'use client';

import { useMounted } from '@/hooks/useMounted.js';

interface NoSSRProps {
    children: React.ReactNode;
}

export function NoSSR({ children }: NoSSRProps) {
    const mounted = useMounted();
    return mounted ? children : null;
}
