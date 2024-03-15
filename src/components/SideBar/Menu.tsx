'use client';

import { PlusIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { t, Trans } from '@lingui/macro';
import { usePathname } from 'next/navigation.js';
import { memo, useState } from 'react';

import DiscoverSelectedIcon from '@/assets/discover.selected.svg';
import DiscoverIcon from '@/assets/discover.svg';
import FollowingSelectedIcon from '@/assets/following.selected.svg';
import FollowingIcon from '@/assets/following.svg';
import NotificationSelectedIcon from '@/assets/notification.selected.svg';
import NotificationIcon from '@/assets/notification.svg';
import ProfileSelectedIcon from '@/assets/profile.selected.svg';
import ProfileIcon from '@/assets/profile.svg';
import SettingsSelectedIcon from '@/assets/setting.selected.svg';
import SettingsIcon from '@/assets/setting.svg';
import WalletIcon from '@/assets/wallet.svg';
import { DraggablePopover } from '@/components/DraggablePopover/index.js';
import { LoginStatusBar } from '@/components/Login/LoginStatusBar.js';
import { ConnectWallet } from '@/components/SideBar/ConnectWallet.js';
import { Tooltip } from '@/components/Tooltip.js';
import { PageRoutes } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useIsMyProfile } from '@/hooks/useIsMyProfile.js';
import { ComposeModalRef, LoginModalRef } from '@/modals/controls.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useNavigatorState } from '@/store/useNavigatorStore.js';

interface MenuProps {
    collapsed?: boolean;
}

export const Menu = memo(function Menu({ collapsed = false }: MenuProps) {
    const currentSource = useGlobalState.use.currentSource();
    const updateSidebarOpen = useNavigatorState.use.updateSidebarOpen();

    const [open, setOpen] = useState(false);

    const isLogin = useIsLogin();

    const pathname = usePathname();
    const isMyProfile = useIsMyProfile(
        currentSource,
        isRoutePathname(pathname, '/profile') ? pathname.split('/')[3] ?? '' : '',
    );

    const checkIsSelected = (href: `/${string}`) =>
        href === PageRoutes.Profile ? isMyProfile || pathname === PageRoutes.Profile : isRoutePathname(pathname, href);

    return (
        <>
            <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li className="flex">
                        <ul role="list" className="space-y-1">
                            {[
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
                            ].map((item) => {
                                const isSelected =
                                    item.href === '/' ? pathname === '/' : checkIsSelected(item.href as `/${string}`);
                                const Icon = isSelected ? item.selectedIcon : item.icon;

                                return (
                                    <li
                                        className="flex rounded-lg text-main"
                                        key={item.href}
                                        onClick={() => updateSidebarOpen(false)}
                                    >
                                        {item.href === '/connect-wallet' ? (
                                            <ConnectWallet collapsed={collapsed} />
                                        ) : (
                                            <Link
                                                href={item.href}
                                                className={classNames(
                                                    ' flex flex-grow-0 gap-x-3 rounded-full p-2 text-xl/5 hover:bg-bg',
                                                    { 'font-bold': isSelected, 'px-4 py-3': !collapsed },
                                                )}
                                            >
                                                {collapsed ? (
                                                    <Tooltip content={item.name} placement="right">
                                                        <Icon width={20} height={20} />
                                                    </Tooltip>
                                                ) : (
                                                    <Icon width={20} height={20} />
                                                )}

                                                <span
                                                    style={{
                                                        display: collapsed ? 'none' : 'inline',
                                                    }}
                                                >
                                                    {item.name}
                                                </span>
                                            </Link>
                                        )}
                                    </li>
                                );
                            })}
                            {isLogin ? (
                                collapsed ? (
                                    <li className="text-center">
                                        <Tooltip content={t`Post`} placement="right">
                                            <button
                                                type="button"
                                                className="rounded-full bg-main p-1 text-primaryBottom"
                                                onClick={() => ComposeModalRef.open({})}
                                            >
                                                <PlusIcon className="h-5 w-5" aria-hidden="true" />
                                            </button>
                                        </Tooltip>
                                    </li>
                                ) : (
                                    <li>
                                        <button
                                            type="button"
                                            className="hidden w-[200px] rounded-2xl bg-main p-2 text-xl font-bold leading-6 text-primaryBottom md:block"
                                            onClick={() => setOpen(true)}
                                        >
                                            <Trans>Post</Trans>
                                        </button>
                                    </li>
                                )
                            ) : null}
                        </ul>
                    </li>
                    <li className="-mx-2 mb-20 mt-auto text-center">
                        {isLogin ? (
                            <LoginStatusBar collapsed={collapsed} />
                        ) : collapsed ? (
                            <button
                                onClick={() => {
                                    LoginModalRef.open();
                                }}
                                type="button"
                                className="rounded-full bg-main p-1 text-primaryBottom"
                            >
                                <UserPlusIcon className="h-5 w-5" aria-hidden="true" />
                            </button>
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
            <DraggablePopover open={open} onClose={() => setOpen(false)}>
                <p>This is a message.</p>
                <p>This is a another message longer than the previous one.</p>
                <p>
                    Grants Canal was a military project to construct a canal through a bend in the Mississippi River
                    opposite Vicksburg, Mississippi, during the American Civil War. Control of Vicksburg and the
                    Mississippi was considered crucial by both the Union and the Confederacy. In June 1862, Union
                    officer Thomas Williams was sent to De Soto Point with his men to dig a canal to bypass the strong
                    Confederate defenses around Vicksburg. Disease and falling river levels prevented completion, and
                    the project was abandoned until January 1863, when Ulysses S. Grant took an interest. The upstream
                    entrance of the canal was moved, but heavy rains and flooding interfered with the project. Work was
                    abandoned in March, and Grant eventually used other methods to capture Vicksburg.
                </p>
                <p>
                    The Philippine television newscast 24 Oras has won thirty-two awards from ninety-three nominations.
                    It premiered on GMA Network on March 15, 2004, and focuses on reportage of present-day events,
                    incorporating disparate segments that appear recurringly. The newscast initially featured Mel
                    Tiangco and Mike Enriquez; the newscasts anchors have changed significantly during its run. It has
                    won five Box Office Entertainment Awards for Most Popular TV Program News & Public Affairs. The
                    newscast has received eight Asian Academy Creative Award nominations (winning one) and fifty-two
                    PMPC Star Awards for Television nominations (winning nine). At the 2009 New York Festivals TV & Film
                    Awards, 24 Oras garnered a Gold World Medal and a Silver World Medal. It was nominated for
                    International Emmy Award for Best News in 2013 and received a Peabody Award in 2014.
                </p>
                <button
                    className=" mt-2 rounded-md border border-line p-2 px-4 text-main"
                    onClick={() => {
                        setOpen(false);
                    }}
                >
                    Submit
                </button>
            </DraggablePopover>
        </>
    );
});
