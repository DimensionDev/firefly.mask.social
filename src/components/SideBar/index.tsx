'use client';

import { i18n } from '@lingui/core';
import { Trans } from '@lingui/react';
import { memo, useMemo, useState } from 'react';

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
import { FarcasterStatusModal } from '@/components/FarcasterStatusModal.js';
import { LensStatusModal } from '@/components/LensStatusModal.js';
import { LoginModal } from '@/components/LoginModal.js';
import { LoginStatusBar } from '@/components/LoginStatusBar.js';
import { PageRoutes } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { useQueryMode } from '@/hooks/useQueryMode.js';
import { useFarcasterAccountsStore, useLensAccountsStore } from '@/store/useAccountPersistStore.js';

import { ConnectWalletNav } from './ConnectWalletNav.js';

const items = [
    { href: PageRoutes.Home, name: i18n.t('Discover'), icon: DiscoverIcon, selectedIcon: DiscoverSelectedIcon },
    {
        href: PageRoutes.Following,
        name: i18n.t('Following'),
        icon: FollowingIcon,
        selectedIcon: FollowingSelectedIcon,
    },
    {
        href: PageRoutes.Notification,
        name: i18n.t('Notification'),
        icon: NotificationIcon,
        selectedIcon: NotificationSelectedIcon,
    },
    { href: PageRoutes.Profile, name: i18n.t('Profile'), icon: ProfileIcon, selectedIcon: ProfileSelectedIcon },
    {
        href: '/connect-wallet',
        name: i18n.t('Connect Wallet'),
        icon: '/svg/wallet.svg',
        selectedIcon: '/svg/wallet.svg',
    },
    { href: PageRoutes.Setting, name: i18n.t('Setting'), icon: SettingsIcon, selectedIcon: SettingsSelectedIcon },
];

export const SideBar = memo(function SideBar() {
    const mode = useQueryMode();
    const [loginOpen, setLoginOpen] = useState(false);
    const [lensStatusOpen, setLensStatusOpen] = useState(false);
    const [farcasterStatusOpen, setFarcasterStatusOpen] = useState(false);
    const lensAccounts = useLensAccountsStore.use.currentAccounts();
    const farcasterAccounts = useFarcasterAccountsStore.use.currentAccounts();
    const isLogin = useMemo(() => lensAccounts.length || farcasterAccounts.length, [lensAccounts, farcasterAccounts]);

    return (
        <>
            <div className="fixed inset-y-0 z-50 flex w-72 flex-col">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-line px-6">
                    <div className="flex h-16 shrink-0 items-center">
                        <Link href={PageRoutes.Home}>
                            {mode === 'light' ? (
                                <LightLogo width={134} height={64} />
                            ) : (
                                <DarkLogo width={134} height={64} />
                            )}
                        </Link>
                    </div>
                    <nav className="flex flex-1 flex-col">
                        <ul role="list" className="flex flex-1 flex-col gap-y-7">
                            <li>
                                <ul role="list" className="-mx-2 space-y-6">
                                    {items.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <li className="rounded-lg px-4 py-3 text-main hover:bg-bg" key={item.name}>
                                                {item.href === '/connect-wallet' ? (
                                                    <ConnectWalletNav />
                                                ) : (
                                                    <Link href={item.href} className="flex gap-x-3 text-2xl/6">
                                                        <Icon width={24} height={24} />
                                                        {item.name}
                                                    </Link>
                                                )}
                                            </li>
                                        );
                                    })}
                                    <li>
                                        <button
                                            onClick={() => {}}
                                            type="button"
                                            className=" min-w-[150px] rounded-[16px] bg-main px-3 py-3 text-xl font-semibold leading-6 text-primaryBottom "
                                        >
                                            <Trans id="Post" />
                                        </button>
                                    </li>
                                </ul>
                            </li>
                            <li className="-mx-2 mb-20 mt-auto">
                                {isLogin ? (
                                    <LoginStatusBar
                                        openFarcaster={() => setFarcasterStatusOpen(true)}
                                        openLens={() => setLensStatusOpen(true)}
                                    />
                                ) : (
                                    <button
                                        onClick={() => {
                                            setLoginOpen(true);
                                        }}
                                        type="button"
                                        className=" min-w-[150px] rounded-[16px] bg-main px-3 py-3 text-xl font-semibold leading-6 text-primaryBottom "
                                    >
                                        <Trans id="Login" />
                                    </button>
                                )}
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
            <LoginModal isOpen={loginOpen} setIsOpen={setLoginOpen} />
            <LensStatusModal isOpen={lensStatusOpen} setIsOpen={setLensStatusOpen} />
            <FarcasterStatusModal isOpen={farcasterStatusOpen} setIsOpen={setFarcasterStatusOpen} />
        </>
    );
});
