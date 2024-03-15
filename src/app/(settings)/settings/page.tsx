'use client';

import { t } from '@lingui/macro';

import { SettingsList } from '@/app/(settings)/components/SettingsList.js';
import { useIsSmall } from '@/hooks/useMediaQuery.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';

export default function Settings() {
    const isSmall = useIsSmall('max');

    useNavigatorTitle(t`Settings`);

    if (!isSmall) return null;

    return (
        <main className="flex min-h-screen w-full">
            <SettingsList />
        </main>
    );
}
