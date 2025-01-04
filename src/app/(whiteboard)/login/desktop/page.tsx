'use client';

import { Trans } from '@lingui/macro';
import { useMemo, use } from 'react';

import FullLogo from '@/assets/logo-full.svg';
import { OpenFireflyAppButton } from '@/components/OpenFireflyAppButton.js';
import { bom } from '@/helpers/bom.js';
import { DeviceType } from '@/types/device.js';

interface PageProps {
    searchParams: Promise<{ session?: string }>;
}

export default function Page(props: PageProps) {
    const searchParams = use(props.searchParams);
    const href = bom.location?.href;
    const schemes = useMemo(() => {
        const sessionId = searchParams.session;
        if (!sessionId) return;
        return {
            [DeviceType.IOS]: href?.replace(/^https/, 'firefly') ?? '',
            [DeviceType.Android]: `firefly://LoginToDesktop/ConfirmDialog?session=${sessionId}`,
        };
    }, [searchParams, href]);

    return (
        <div className="absolute inset-0 flex flex-col items-center gap-[178px] bg-white pt-20 dark:bg-black md:pt-[124px]">
            <FullLogo width={240} height={240} className="text-black dark:text-white" />
            <div className="w-full px-9 md:max-w-[311px] md:px-0">
                <OpenFireflyAppButton
                    className="w-full rounded-xl bg-black px-5 py-2 text-center text-xl font-bold text-white dark:bg-white dark:text-[#181A20]"
                    schemes={schemes}
                >
                    <Trans>Open in Firefly App</Trans>
                </OpenFireflyAppButton>
            </div>
        </div>
    );
}
