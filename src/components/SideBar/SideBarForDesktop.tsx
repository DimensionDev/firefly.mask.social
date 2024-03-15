'use client';

import { memo } from 'react';

import DarkLogo from '@/assets/logo.dark.svg';
import LightLogo from '@/assets/logo.light.svg';
import MiniLogo from '@/assets/miniLogo.svg';
import { Menu } from '@/components/SideBar/Menu.js';
import { PageRoutes } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { useDarkMode } from '@/hooks/useDarkMode.js';
import { useIsLarge } from '@/hooks/useMediaQuery.js';

export const SideBarForDesktop = memo(function SideBarForDesktop() {
    const isLarge = useIsLarge();
    const { isDarkMode } = useDarkMode();

    return (
        <div
            className={`
          fixed inset-y-0 z-50 flex flex-col

          lg:w-[289px]
        `}
        >
            <div
                className={`
              flex grow flex-col gap-y-5 border-r border-line px-3

              lg:px-6
            `}
            >
                <div
                    className={`
                  flex h-16 shrink-0 items-center

                  lg:px-4
                `}
                >
                    <Link href={PageRoutes.Home}>
                        {isLarge ? (
                            !isDarkMode ? (
                                <LightLogo width={134} height={64} />
                            ) : (
                                <DarkLogo width={134} height={64} />
                            )
                        ) : (
                            <MiniLogo width={33} height={43} />
                        )}
                    </Link>
                </div>
                <Menu collapsed={!isLarge} />
            </div>
        </div>
    );
});
