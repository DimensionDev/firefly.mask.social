'use client';

import { getEnumAsArray } from '@masknet/kit';
import { usePathname, useRouter } from 'next/navigation.js';
import { startTransition } from 'react';
import urlcat from 'urlcat';

import { SocialPlatform } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { usePlatformProfile } from '@/hooks/usePlatformProfile.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export function SocialPlatformTabs() {
    const pathname = usePathname();
    const currentSocialPlatform = useGlobalState.use.currentSocialPlatform();
    const switchSocialPlatform = useGlobalState.use.switchSocialPlatform();
    const platformProfile = usePlatformProfile();
    const router = useRouter();

    if (pathname.includes('/settings') || pathname.includes('/detail')) return null;

    if (pathname.includes('/profile')) {
        const param = pathname.split('/');
        const handle = param[param.length - 1];

        if (
            currentSocialPlatform === SocialPlatform.Lens &&
            platformProfile.lens?.handle &&
            platformProfile.lens.handle !== handle
        )
            return null;
        if (
            currentSocialPlatform === SocialPlatform.Farcaster &&
            platformProfile.farcaster?.profileId &&
            platformProfile.farcaster.profileId !== handle
        )
            return null;
    }

    return (
        <div className="bg-primaryBottom px-4">
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
                                if (pathname.includes('/profile')) {
                                    router.push(
                                        urlcat('/profile/:handle', {
                                            handle:
                                                value === SocialPlatform.Lens
                                                    ? platformProfile.lens?.handle
                                                    : platformProfile.farcaster?.profileId,
                                        }),
                                    );
                                }
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
