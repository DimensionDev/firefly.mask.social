import { Trans } from '@lingui/macro';

import { ActivityHomePage } from '@/components/CZ/ActivityHomePage.js';
import { ActivityShortRules } from '@/components/CZ/ActivityShortRules.js';
import { NavigationBar } from '@/components/CZ/NavigationBar.js';
import { Image } from '@/esm/Image.js';
import FireflyIcon from '@/assets/firefly-pure.svg';
import type { Metadata } from 'next';
import { getActivityOG } from '@/components/CZ/getActivityOG.js';

export async function generateMetadata(): Promise<Metadata> {
    return getActivityOG();
}

export default function Page() {
    return (
        <div className="mx-auto flex min-h-[100svh] w-full flex-col items-center">
            <NavigationBar>
                <Trans>Welcome Back CZ Collectible</Trans>
            </NavigationBar>
            <Image
                src="/image/activity/cz/background.webp"
                alt="background"
                width={1500}
                height={1000}
                className="pointer-events-none fixed left-0 top-0 h-full w-full object-cover"
            />
            <div className="relative z-10 mx-auto flex w-full max-w-[600px] flex-1 flex-col items-center justify-center space-y-8 p-6 text-white">
                <ActivityHomePage />
                <div className="rounded-[13px] bg-gradient-to-b from-[#e5dbb9] to-[#181A20] p-[1px]">
                    <div className="w-full space-y-4 rounded-[12px] bg-[#181A20] px-6 py-3 text-sm">
                        <ActivityShortRules />
                    </div>
                </div>
            </div>
            <div className="relative z-10 mt-auto flex w-full items-center justify-center text-center text-sm pb-safe-or-6">
                <FireflyIcon width={14} height={19} className="mr-2.5" />
                <p>
                    <Trans>
                        <b>© 2024 Firefly.</b> All rights reserved.
                    </Trans>
                </p>
            </div>
        </div>
    );
}
