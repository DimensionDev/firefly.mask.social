'use client';

import { redirect, useRouter } from 'next/navigation.js';
import { useMount } from 'react-use';
import urlcat from 'urlcat';

import { SettingsList } from '@/app/(settings)/components/SettingsList.js';
import { PageRoutes } from '@/constants/enum.js';
import { useIsSmall } from '@/hooks/useMediaQuery.js';

export default function Settings() {
    const isSmall = useIsSmall('max');

    if (!isSmall) return null;

    return (
        <div className=" flex min-h-screen w-full">
            <SettingsList />
        </div>
    );
}
