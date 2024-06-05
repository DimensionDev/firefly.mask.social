'use client';

import { t } from '@lingui/macro';
import { useRouter } from 'next/navigation.js';
import { useEffect } from 'react';

import { SettingsList } from '@/app/(settings)/components/SettingsList.js';
import { useIsSmall } from '@/hooks/useMediaQuery.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';

export default function Settings() {
    const router = useRouter();
    const isSmall = useIsSmall('max');

    useNavigatorTitle(t`Settings`);

    useEffect(() => {
        if (!isSmall) router.replace('/settings/general');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!isSmall) return null;

    // mobile
    return (
        <main className="flex-grow-1 flex w-full">
            <SettingsList />
        </main>
    );
}
