'use client';

import { getEnumAsArray } from '@masknet/kit';
import { usePathname, useRouter } from 'next/navigation.js';
import { startTransition } from 'react';

import { SocialPlatform } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { resolveSource, type SourceInURL } from '@/helpers/resolveSource.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export function SocialPlatformTabs() {
    const { currentSource, updateCurrentSource } = useGlobalState();
    const lensProfile = useCurrentProfile(SocialPlatform.Lens);
    const farcasterProfile = useCurrentProfile(SocialPlatform.Farcaster);

    const router = useRouter();
    const pathname = usePathname();

    if (isRoutePathname(pathname, '/settings') || isRoutePathname(pathname, '/post')) return null;

    if (pathname !== '/profile' && isRoutePathname(pathname, '/profile')) {
        const param = pathname.split('/');
        const handle = param[param.length - 1];
        const sourceString = param[param.length - 2] as SourceInURL;
        const source = resolveSource(sourceString);

        if (source === SocialPlatform.Farcaster && farcasterProfile?.profileId !== handle) return null;
        if (source === SocialPlatform.Lens && lensProfile?.handle !== handle) return null;
    }

    return (
        <div className="border-b border-line bg-primaryBottom px-4">
            <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                {getEnumAsArray(SocialPlatform).map(({ key, value }) => (
                    <a
                        key={key}
                        className={classNames(
                            currentSource === value ? 'border-b-2 border-[#9250FF] text-main' : 'text-third',
                            'px-4 py-5 text-xl font-bold leading-6 hover:cursor-pointer hover:text-main',
                        )}
                        aria-current={currentSource === value ? 'page' : undefined}
                        onClick={() =>
                            startTransition(() => {
                                if (isRoutePathname(pathname, '/profile')) {
                                    if (value === SocialPlatform.Lens)
                                        router.push(lensProfile ? getProfileUrl(lensProfile) : '/profile');
                                    if (value === SocialPlatform.Farcaster)
                                        router.push(farcasterProfile ? getProfileUrl(farcasterProfile) : '/profile');
                                }
                                scrollTo(0, 0);
                                updateCurrentSource(value);
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
