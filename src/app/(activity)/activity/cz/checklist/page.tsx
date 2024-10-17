import { Trans } from '@lingui/macro';
import type { Metadata } from 'next';

import { ActivityCheckList } from '@/components/CZ/ActivityCheckList.js';
import { getActivityOG } from '@/components/CZ/getActivityOG.js';
import { NavigationBar } from '@/components/CZ/NavigationBar.js';
import { setupLocaleForSSR } from '@/i18n/index.js';

export async function generateMetadata(): Promise<Metadata> {
    return getActivityOG();
}

export default function Page() {
    setupLocaleForSSR();

    return (
        <div className="mx-auto flex min-h-[100svh] w-full flex-1 flex-col items-center bg-black">
            <NavigationBar>
                <Trans>Welcome Back CZ Collectible</Trans>
            </NavigationBar>
            <div className="w-full max-w-[600px] p-6 text-white">
                <ActivityCheckList />
            </div>
        </div>
    );
}
