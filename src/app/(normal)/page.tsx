'use client';

import { HomePage } from '@/app/(normal)/pages/Home.js';
import type { SearchParams } from '@/types/index.js';

export default function Page({ searchParams }: { searchParams: SearchParams }) {
    return <HomePage />;
}
