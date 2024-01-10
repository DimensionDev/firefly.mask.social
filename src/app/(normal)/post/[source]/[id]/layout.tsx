'use client';

import type React from 'react';

import type { SourceInURL } from '@/helpers/resolveSource.js';

interface Props {
    params: {
        id: string;
        source: SourceInURL;
    };
    children: React.ReactNode;
}

export default function DetailLayout({ children }: Props) {
    return <>{children}</>;
}
