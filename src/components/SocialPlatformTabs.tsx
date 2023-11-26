'use client';

import { getEnumAsArray } from '@masknet/kit';
import { usePathname } from 'next/navigation.js';
import { startTransition } from 'react';

import { SocialPlatform } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export function SocialPlatformTabs() {
    const pathname = usePathname();
    const currentSocialPlatform = useGlobalState.use.currentSocialPlatform();
    const switchSocialPlatform = useGlobalState.use.switchSocialPlatform();

    if (pathname.includes('/settings') || pathname.includes('/detail')) return null;

    return (
        <div className="py-0">
            <nav className="-mb-px flex space-x-4 border-b border-line" aria-label="Tabs">
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
