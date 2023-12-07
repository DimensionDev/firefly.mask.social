'use client';

import { Trans } from '@lingui/macro';
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
import { LoginStatusBar } from '@/components/LoginStatusBar.js';
import { PageRoutes } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { useDarkMode } from '@/hooks/useDarkMode.js';
import { useLogin } from '@/hooks/useLogin.js';
import { usePlatformAccount } from '@/hooks/usePlatformAccount.js';
import { ComposeModalRef, LoginModalRef } from '@/modals/controls.js';

import { ConnectWalletNav } from './ConnectWalletNav.js';

const items = [
    { href: PageRoutes.Home, name: <Trans>Discover</Trans>, icon: DiscoverIcon, selectedIcon: DiscoverSelectedIcon },
    {
        href: PageRoutes.Following,
        name: <Trans>Following</Trans>,
        icon: FollowingIcon,
        selectedIcon: FollowingSelectedIcon,
    },
    {
        href: PageRoutes.Notifications,
        name: <Trans>Notifications</Trans>,
        icon: NotificationIcon,
        selectedIcon: NotificationSelectedIcon,
    },
    { href: PageRoutes.Profile, name: <Trans>Profile</Trans>, icon: ProfileIcon, selectedIcon: ProfileSelectedIcon },
    {
        href: '/connect-wallet',
        name: <Trans>Connect</Trans>,
        icon: WalletIcon,
        selectedIcon: WalletIcon,
    },
    {
        href: PageRoutes.Settings,
        name: <Trans>Settings</Trans>,
        icon: SettingsIcon,
        selectedIcon: SettingsSelectedIcon,
    },
];

export const SideBar = memo(function SideBar() {
    const { isDarkMode } = useDarkMode();
    const isLogin = useLogin();
    const platformAccount = usePlatformAccount();

    return (
        <>
            <div className="fixed inset-y-0 z-50 flex w-72 flex-col">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-line px-6">
                    <div className="flex h-16 shrink-0 items-center">
                        <Link href={PageRoutes.Home}>
                            {!isDarkMode ? <LightLogo width={134} height={64} /> : <DarkLogo width={134} height={64} />}
                        </Link>
                    </div>
                    <nav className="flex flex-1 flex-col">
                        <ul role="list" className="flex flex-1 flex-col gap-y-7">
                            <li>
                                <ul role="list" className="-mx-2 space-y-6">
                                    {items.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <li className="rounded-lg px-4 py-3 text-main hover:bg-bg" key={item.href}>
                                                {item.href === '/connect-wallet' ? (
                                                    <ConnectWalletNav />
                                                ) : (
                                                    <Link
                                                        href={urlcat(
                                                            item.href,
                                                            item.href === PageRoutes.Profile
                                                                ? `/${platformAccount.lens?.handle ?? ''}`
                                                                : '',
                                                        )}
                                                        className="flex gap-x-3 text-2xl/6"
                                                    >
                                                        <Icon width={24} height={24} />
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
                                                className=" min-w-[150px] rounded-[16px] bg-main px-3 py-3 text-xl font-semibold leading-6 text-primaryBottom "
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
                                            LoginModalRef.open({});
                                        }}
                                        type="button"
                                        className=" min-w-[150px] rounded-[16px] bg-main px-3 py-3 text-xl font-semibold leading-6 text-primaryBottom "
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
