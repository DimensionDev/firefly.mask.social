'use client';

import { getEnumAsArray } from '@masknet/kit';
import { usePathname } from 'next/navigation.js';
import { startTransition } from 'react';

import { SocialPlatform } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { usePlatformAccount } from '@/hooks/usePlatformAccount.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export function SocialPlatformTabs() {
    const pathname = usePathname();
    const currentSocialPlatform = useGlobalState.use.currentSocialPlatform();
    const switchSocialPlatform = useGlobalState.use.switchSocialPlatform();
    const platformAccount = usePlatformAccount();

    if (pathname.includes('/settings') || pathname.includes('/detail')) return null;

    if (pathname.includes('/profile')) {
        const param = pathname.split('/');
        const handle = param[param.length - 1];

        if (platformAccount.lens.handle && platformAccount.lens.handle !== handle) return null;
    }

    return (
        <div className="sticky top-0 z-[998] border-b border-line bg-primaryBottom">
            <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                {getEnumAsArray(SocialPlatform).map(({ key, value }) => (
                    <a
                        key={key}
                        className={classNames(
                            currentSocialPlatform === value ? 'border-b-2 border-[#9250FF] text-main' : 'text-third',
                            'px-4 py-5 text-xl font-bold leading-6 hover:cursor-pointer',
                        )}
                        aria-current={currentSocialPlatform === value ? 'page' : undefined}
                        onClick={() =>
                            startTransition(() => {
                                switchSocialPlatform(value);
                            })
                        }
                    >
                        {value}
                    </a>
                ))}
            </nav>
        </div>
    );
}
