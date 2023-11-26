'use client';

import { useRouter } from 'next/navigation.js';
import type React from 'react';

export default function DetailLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    return <div className="min-h-screen">{children}</div>;
}
