'use client';

import { memo } from 'react';

import DarkLogo from '@/assets/logo.dark.svg';
import LightLogo from '@/assets/logo.light.svg';
import MiniLogo from '@/assets/miniLogo.svg';
import { Menu } from '@/components/SideBar/Menu.js';
import { PageRoute } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { useDarkMode } from '@/hooks/useDarkMode.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';

export const SideBarForDesktop = memo(function SideBarForDesktop() {
    const isMedium = useIsMedium();
    const { isDarkMode } = useDarkMode();

    return (
        <div className="fixed inset-y-0 z-40 flex h-[100svh] min-h-[626px] flex-col md:w-[289px]">
            <div className="flex grow flex-col gap-y-4 border-r border-line px-3 lg:px-6">
                <div className="-ml-1 flex h-16 shrink-0 items-center">
                    <Link href={PageRoute.Home}>
                        {isMedium ? (
                            !isDarkMode ? (
                                <LightLogo width={169} height={80} />
                            ) : (
                                <DarkLogo width={169} height={80} />
                            )
                        ) : (
                            <MiniLogo className='ml-5' width={33} height={43} />
                        )}
                    </Link>
                </div>
                <Menu />
            </div>
        </div>
    );
});
