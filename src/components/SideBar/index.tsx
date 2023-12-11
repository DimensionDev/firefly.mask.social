'use client';

import { Trans } from '@lingui/macro';
import { usePathname } from 'next/navigation.js';
import { memo } from 'react';
import urlcat from 'urlcat';

import DiscoverSelectedIcon from '@/assets/discover.selected.svg';
import DiscoverIcon from '@/assets/discover.svg';
import FollowingSelectedIcon from '@/assets/following.selected.svg';
import FollowingIcon from '@/assets/following.svg';
import DarkLogo from '@/assets/logo.dark.svg';
import LightLogo from '@/assets/logo.light.svg';
import NotificationSelectedIcon from '@/assets/notification.selected.svg';
import NotificationIcon from '@/assets/notification.svg';
import ProfileSelectedIcon from '@/assets/profile.selected.svg';
import ProfileIcon from '@/assets/profile.svg';
import SettingsSelectedIcon from '@/assets/setting.selected.svg';
import SettingsIcon from '@/assets/setting.svg';
import WalletIcon from '@/assets/wallet.svg';
import { LoginStatusBar } from '@/components/Login/LoginStatusBar.js';
import { ConnectWalletNav } from '@/components/SideBar/ConnectWalletNav.js';
import { PageRoutes } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { useDarkMode } from '@/hooks/useDarkMode.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { usePlatformProfile } from '@/hooks/usePlatformProfile.js';
import { ComposeModalRef, LoginModalRef } from '@/modals/controls.js';

const items = [
    {
        pathname: '/',
        href: PageRoutes.Home,
        name: <Trans>Discover</Trans>,
        icon: DiscoverIcon,
        selectedIcon: DiscoverSelectedIcon,
    },
    {
        pathname: '/following',
        href: PageRoutes.Following,
        name: <Trans>Following</Trans>,
        icon: FollowingIcon,
        selectedIcon: FollowingSelectedIcon,
    },
    {
        pathname: '/notifications',
        href: PageRoutes.Notifications,
        name: <Trans>Notifications</Trans>,
        icon: NotificationIcon,
        selectedIcon: NotificationSelectedIcon,
    },
    {
        pathname: '/profile',
        href: PageRoutes.Profile,
        name: <Trans>Profile</Trans>,
        icon: ProfileIcon,
        selectedIcon: ProfileSelectedIcon,
    },
    {
        pathname: '/connect-wallet',
        href: '/connect-wallet',
        name: <Trans>Connect</Trans>,
        icon: WalletIcon,
        selectedIcon: WalletIcon,
    },
    {
        pathname: '/settings',
        href: PageRoutes.Settings,
        name: <Trans>Settings</Trans>,
        icon: SettingsIcon,
        selectedIcon: SettingsSelectedIcon,
    },
];

export const SideBar = memo(function SideBar() {
    const { isDarkMode } = useDarkMode();
    const isLogin = useIsLogin();
    const platformProfile = usePlatformProfile();

    const route = usePathname();

    return (
        <>
            <div className="fixed inset-y-0 z-50 flex w-72 flex-col">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-line px-6">
                    <div className="flex h-16 shrink-0 items-center px-4">
                        <Link href={PageRoutes.Home}>
                            {!isDarkMode ? <LightLogo width={134} height={64} /> : <DarkLogo width={134} height={64} />}
                        </Link>
                    </div>
                    <nav className="flex flex-1 flex-col">
                        <ul role="list" className="flex flex-1 flex-col gap-y-7">
                            <li className="flex">
                                <ul role="list" className="space-y-1">
                                    {items.map((item) => {
                                        const isSelected =
                                            item.pathname === '/' ? route === '/' : route.startsWith(item.pathname);
                                        const Icon = isSelected ? item.selectedIcon : item.icon;
                                        return (
                                            <li className="flex rounded-lg text-main" key={item.href}>
                                                {item.href === '/connect-wallet' ? (
                                                    <ConnectWalletNav />
                                                ) : (
                                                    <Link
                                                        href={urlcat(
                                                            item.href,
                                                            item.href === PageRoutes.Profile
                                                                ? `/${platformProfile.lens?.handle ?? ''}`
                                                                : '',
                                                        )}
                                                        className={classNames(
                                                            'flex flex-grow-0 gap-x-3 px-4 py-3 text-xl/5 hover:bg-bg hover:font-bold',
                                                            { 'font-bold': isSelected },
                                                        )}
                                                    >
                                                        <Icon width={20} height={20} />
                                                        {item.name}
                                                    </Link>
                                                )}
                                            </li>
                                        );
                                    })}
                                    {isLogin ? (
                                        <li>
                                            <button
                                                type="button"
                                                className="w-[200px] rounded-2xl bg-main p-2 text-xl font-bold leading-6 text-primaryBottom"
                                                onClick={() => ComposeModalRef.open({})}
                                            >
                                                <Trans>Post</Trans>
                                            </button>
                                        </li>
                                    ) : null}
                                </ul>
                            </li>
                            <li className="-mx-2 mb-20 mt-auto">
                                {isLogin ? (
                                    <LoginStatusBar />
                                ) : (
                                    <button
                                        onClick={() => {
                                            LoginModalRef.open();
                                        }}
                                        type="button"
                                        className="w-[200px] rounded-2xl bg-main p-2 text-xl font-bold leading-6 text-primaryBottom"
                                    >
                                        <Trans>Login</Trans>
                                    </button>
                                )}
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </>
    );
});
