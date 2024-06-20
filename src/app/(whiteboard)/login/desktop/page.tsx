'use client';

import { Trans } from '@lingui/macro';

import FullLogo from '@/assets/fullLogo.svg';
import { OpenFireflyAppButton } from '@/components/OpenFireflyAppButton.js';

interface PageProps {
    searchParams: { [key: string]: string };
}

export default function Page({ searchParams }: PageProps) {
    return (
        <div className="absolute inset-0 flex flex-col items-center gap-[178px] bg-white pt-20 dark:bg-black md:pt-[124px]">
            <FullLogo width={240} height={240} className="text-black dark:text-white" />
            <div className="w-full px-9 md:max-w-[311px] md:px-0">
                <OpenFireflyAppButton
                    className="w-full rounded-xl bg-black px-5 py-2 text-center text-xl font-bold text-white dark:bg-white dark:text-[#181A20]"
                    scheme={
                        searchParams.session
                            ? {
                                  ios: location.href.replace('https://', 'firefly://'),
                                  android: `firefly://LoginToDesktop/ConfirmDialog?session=${searchParams.session}`,
                              }
                            : undefined
                    }
                >
                    <Trans>Open in Firefly App</Trans>
                </OpenFireflyAppButton>
            </div>
        </div>
    );
}
