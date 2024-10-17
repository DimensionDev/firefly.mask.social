'use client';

import { useRouter } from 'next/navigation.js';
import { useEffectOnce } from 'react-use';

import { ToolkitList } from '@/app/(developers)/components/ToolkitList.js';
import { useIsSmall } from '@/hooks/useMediaQuery.js';

export default function Developers() {
    const router = useRouter();
    const isSmall = useIsSmall('max');

    useEffectOnce(() => {
        if (!isSmall) router.replace('/developers/general');
    });

    if (!isSmall) return null;

    // mobile
    return (
        <main className="flex min-h-screen w-full">
            <ToolkitList />
        </main>
    );
}
