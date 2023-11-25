'use client';

import { Trans } from '@lingui/react';
import { useRouter } from 'next/navigation.js';
import type React from 'react';

import ComeBack from '@/assets/comeback.svg';

export default function DetailLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    return <div className="min-h-screen">{children}</div>;
}
