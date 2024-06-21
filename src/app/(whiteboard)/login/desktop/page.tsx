'use client';

import { Trans } from '@lingui/macro';
import { useMemo } from 'react';

import FullLogo from '@/assets/fullLogo.svg';
import { OpenFireflyAppButton } from '@/components/OpenFireflyAppButton.js';
import { env } from '@/constants/env.js';

interface PageProps {
    searchParams: { [key: string]: string };
}

export default function Page({ searchParams }: PageProps) {
    const scheme = useMemo(() => {
        const ios = env.external.NEXT_PUBLIC_FIREFLY_IOS_LOGIN_CONFIRM;
        const android = env.external.NEXT_PUBLIC_FIREFLY_ANDROID_LOGIN_CONFIRM;
        if (!android || !searchParams.session) return undefined;
        return {
            ios: ios ? `${ios}?session=${searchParams.session}` : location.href.replace('https://', 'firefly://'),
            android: `${android}?session=${searchParams.session}`,
        };
    }, [searchParams]);


    return (
        <div className="absolute inset-0 flex flex-col items-center gap-[178px] bg-white pt-20 dark:bg-black md:pt-[124px]">
            <FullLogo width={240} height={240} className="text-black dark:text-white" />
            <div className="w-full px-9 md:max-w-[311px] md:px-0">
                <OpenFireflyAppButton
                    className="w-full rounded-xl bg-black px-5 py-2 text-center text-xl font-bold text-white dark:bg-white dark:text-[#181A20]"
                    scheme={scheme}
                >
                    <Trans>Open in Firefly App</Trans>
                </OpenFireflyAppButton>
            </div>
        </div>
    );
}
