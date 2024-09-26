'use client';

import { Trans } from '@lingui/macro';

import { NavigationBar } from '@/components/ActivityPage/common/NavigationBar.js';
import { CZActivityCheckList } from '@/components/ActivityPage/CZ/CZActivityCheckList.js';
import { useComeBack } from '@/hooks/useComeback.js';

export default function Page() {
    const comeback = useComeBack();
    return (
        <div className="mx-auto flex min-h-[100svh] w-full max-w-[600px] flex-1 flex-col bg-black">
            <NavigationBar className="z-20 bg-primaryBottom" onBack={comeback}>
                <Trans>Welcome Back CZ Collectible</Trans>
            </NavigationBar>
            <div className="w-full p-6 text-white">
                <CZActivityCheckList />
            </div>
        </div>
    );
}
