'use client';

import { Trans } from '@lingui/macro';

import { NavigationBar } from '@/components/ActivityPage/common/NavigationBar.js';
import { CZActivityHomePage } from '@/components/ActivityPage/CZ/CZActivityHomePage.js';
import { CZActivityShortRules } from '@/components/ActivityPage/CZ/CZActivityShortRules.js';
import { Image } from '@/esm/Image.js';

export default function Page() {
    return (
        <div className="mx-auto flex min-h-[100svh] w-full max-w-[600px] flex-col">
            <NavigationBar className="z-20 bg-primaryBottom">
                <Trans>Welcome Back CZ Collectible</Trans>
            </NavigationBar>
            <Image
                src="/image/activity/cz/background.webp"
                alt="background"
                width={1500}
                height={1000}
                className="pointer-events-none fixed left-0 top-0 h-full w-full object-cover"
            />
            <div className="relative z-10 mx-auto flex w-full flex-1 flex-col items-center justify-center space-y-8 p-6 text-white">
                <CZActivityHomePage />
                <div className="rounded-[13px] bg-gradient-to-b from-[#e5dbb9] to-[#181A20] p-[1px]">
                    <div className="w-full space-y-4 rounded-[12px] bg-[#181A20] px-6 py-3 text-sm">
                        <CZActivityShortRules />
                    </div>
                </div>
            </div>
        </div>
    );
}
