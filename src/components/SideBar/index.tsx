'use client';

import { Trans } from '@lingui/macro';
import { CrossIsolationMessages } from '@masknet/shared-base';
import { usePathname } from 'next/navigation.js';
import { memo } from 'react';

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
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useDarkMode } from '@/hooks/useDarkMode.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useIsMyProfile } from '@/hooks/useIsMyProfile.js';
import { ComposeModalRef, LoginModalRef } from '@/modals/controls.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

const items = [
    {
        href: PageRoutes.Home,
        name: <Trans>Discover</Trans>,
        icon: DiscoverIcon,
        selectedIcon: DiscoverSelectedIcon,
    },
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
    {
        href: PageRoutes.Profile,
        name: <Trans>Profile</Trans>,
        icon: ProfileIcon,
        selectedIcon: ProfileSelectedIcon,
    },
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
    const currentSource = useGlobalState.use.currentSource();
    const currentProfile = useCurrentProfile(currentSource);

    const isLogin = useIsLogin();
    const { isDarkMode } = useDarkMode();

    const pathname = usePathname();
    const isMyProfile = useIsMyProfile(
        currentSource,
        isRoutePathname(pathname, '/profile') ? pathname.split('/')[3] ?? '' : '',
    );

    const checkIsSelected = (href: `/${string}`) =>
        href === PageRoutes.Profile ? isMyProfile : isRoutePathname(pathname, href);

    return (
        <>
            <div className="fixed inset-y-0 z-50 flex w-[289px] flex-col">
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
                                            item.href === '/'
                                                ? pathname === '/'
                                                : checkIsSelected(item.href as `/${string}`);
                                        const Icon = isSelected ? item.selectedIcon : item.icon;
                                        return (
                                            <li className="flex rounded-lg text-main" key={item.href}>
                                                {item.href === '/connect-wallet' ? (
                                                    <ConnectWalletNav />
                                                ) : (
                                                    <Link
                                                        href={
                                                            item.href === PageRoutes.Profile && currentProfile
                                                                ? getProfileUrl(currentProfile)
                                                                : item.href
                                                        }
                                                        className={classNames(
                                                            'flex flex-grow-0 gap-x-3 px-4 py-3 text-xl/5 hover:bg-bg',
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
                                    <li>
                                        <button
                                            type="button"
                                            className="mt-2 w-[200px] rounded-2xl bg-main p-2 text-xl font-bold leading-6 text-primaryBottom"
                                            onClick={() => {
                                                CrossIsolationMessages.events.compositionDialogEvent.sendToAll({
                                                    reason: 'timeline',
                                                    open: true,
                                                    options: {
                                                        initialMetas: {
                                                            'com.maskbook.red_packet:1': {
                                                                network: 'Polygon',
                                                                contract_address:
                                                                    '0x93e0b87A0aD0C991dc1B5176ddCD850c9a78aabb',
                                                                contract_version: 4,
                                                                sender: {
                                                                    address:
                                                                        '0x33a7209F653727A2ff688C81E661D61BcfFfD809',
                                                                    name: 'Unknown User',
                                                                    message: 'Best Wishes!',
                                                                },
                                                                is_random: true,
                                                                shares: 1,
                                                                password:
                                                                    '0x0e1b3c7b6d29e9eaa90b088ed17c40980f51912b2f74a8fc6ee7a2824b031f84',
                                                                rpid: '0xb1462df26c7e6a963eb7e8f7f8c1146dc52f4d85db6e47634e743dee59ae42fb',
                                                                total: '10000000000000000',
                                                                duration: 86400,
                                                                creation_time: 1702911355000,
                                                                token: {
                                                                    decimals: 18,
                                                                    symbol: 'MATIC',
                                                                    address:
                                                                        '0x0000000000000000000000000000000000000000',
                                                                    chainId: 137,
                                                                },
                                                            },
                                                        },
                                                    },
                                                });
                                            }}
                                        >
                                            <Trans>Draft Red Packet</Trans>
                                        </button>
                                    </li>
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
