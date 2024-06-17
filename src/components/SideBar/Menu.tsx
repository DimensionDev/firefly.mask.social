'use client';

import { PlusIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { t, Trans } from '@lingui/macro';
import { delay } from '@masknet/kit';
import { usePathname } from 'next/navigation.js';
import { memo } from 'react';

import BookmarkSelectedIcon from '@/assets/bookmark.selected.svg';
import BookmarkIcon from '@/assets/bookmark.svg';
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
import { ClickableButton } from '@/components/ClickableButton.js';
import { LoginStatusBar } from '@/components/Login/LoginStatusBar.js';
import { ActiveApp } from '@/components/SideBar/ActiveApp.js';
import { ConnectWallet } from '@/components/SideBar/ConnectWallet.js';
import { Tooltip } from '@/components/Tooltip.js';
import { PageRoute } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { narrowToSocialSource } from '@/helpers/narrowSource.js';
import { useCurrentVisitingChannel } from '@/hooks/useCurrentVisitingChannel.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useIsMyProfile } from '@/hooks/useIsMyProfile.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { ComposeModalRef, LoginModalRef } from '@/modals/controls.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useNavigatorState } from '@/store/useNavigatorStore.js';

interface MenuProps {
    collapsed?: boolean;
}

export const Menu = memo(function Menu({ collapsed = false }: MenuProps) {
    const currentSource = useGlobalState.use.currentSource();
    const currentSocialSource = narrowToSocialSource(currentSource);
    const currentChannel = useCurrentVisitingChannel();
    const isMedium = useIsMedium();

    const { updateSidebarOpen } = useNavigatorState();

    const isLogin = useIsLogin();
    const pathname = usePathname();

    const isMyProfile = useIsMyProfile(
        currentSocialSource,
        isRoutePathname(pathname, '/profile') ? pathname.split('/')[3] ?? '' : '',
    );

    const checkIsSelected = (href: `/${string}`) =>
        href === PageRoute.Profile ? isMyProfile || pathname === PageRoute.Profile : isRoutePathname(pathname, href);

    return (
        <>
            <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li className="flex overflow-hidden">
                        <ul role="list" className="space-y-1 overflow-hidden w-full">
                            {[
                                {
                                    href: PageRoute.Home,
                                    name: <Trans>Discover</Trans>,
                                    icon: DiscoverIcon,
                                    selectedIcon: DiscoverSelectedIcon,
                                },
                                {
                                    href: PageRoute.Following,
                                    name: <Trans>Following</Trans>,
                                    icon: FollowingIcon,
                                    selectedIcon: FollowingSelectedIcon,
                                },
                                {
                                    href: PageRoute.Notifications,
                                    name: <Trans>Notifications</Trans>,
                                    icon: NotificationIcon,
                                    selectedIcon: NotificationSelectedIcon,
                                },
                                {
                                    href: PageRoute.Bookmarks,
                                    name: <Trans>Bookmarks</Trans>,
                                    icon: BookmarkIcon,
                                    selectedIcon: BookmarkSelectedIcon,
                                },
                                {
                                    href: PageRoute.Profile,
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
                                    href: PageRoute.Settings,
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
                                        className="flex rounded-lg text-main outline-none"
                                        key={item.href}
                                        onClick={() => updateSidebarOpen(false)}
                                    >
                                        {item.href === '/connect-wallet' ? (
                                            <ConnectWallet collapsed={collapsed} />
                                        ) : (
                                            <Link
                                                href={item.href}
                                                className={classNames(
                                                    'flex flex-grow-0 items-center gap-x-3 rounded-full p-2 text-xl outline-none hover:bg-bg w-full md:w-auto',
                                                    { 'font-bold': isSelected, 'px-4': !collapsed },
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
                                            <ClickableButton
                                                className="rounded-full bg-main p-1 text-primaryBottom"
                                                onClick={() =>
                                                    ComposeModalRef.open({
                                                        type: 'compose',
                                                        channel: currentChannel,
                                                    })
                                                }
                                            >
                                                <PlusIcon className="h-5 w-5" aria-hidden="true" />
                                            </ClickableButton>
                                        </Tooltip>
                                    </li>
                                ) : (
                                    <li>
                                        <ClickableButton
                                            className="hidden w-[200px] rounded-2xl bg-main p-2 text-xl font-bold leading-6 text-primaryBottom md:block"
                                            onClick={() => {
                                                ComposeModalRef.open({
                                                    type: 'compose',
                                                    channel: currentChannel,
                                                });
                                            }}
                                        >
                                            <Trans>Post</Trans>
                                        </ClickableButton>
                                    </li>
                                )
                            ) : null}
                        </ul>
                    </li>
                    {!isMedium ? (
                        <li>
                            <ActiveApp />
                        </li>
                    ) : null}
                    <li className="-mx-2 mb-20 mt-auto text-center">
                        {isLogin ? (
                            <LoginStatusBar collapsed={collapsed} />
                        ) : collapsed ? (
                            <ClickableButton
                                onClick={() => {
                                    LoginModalRef.open();
                                }}
                                className="rounded-full bg-main p-1 text-primaryBottom"
                            >
                                <UserPlusIcon className="h-5 w-5" aria-hidden="true" />
                            </ClickableButton>
                        ) : (
                            <ClickableButton
                                onClick={async () => {
                                    updateSidebarOpen(false);
                                    await delay(300);
                                    LoginModalRef.open();
                                }}
                                className="w-[200px] rounded-2xl bg-main p-2 text-xl font-bold leading-6 text-primaryBottom"
                            >
                                <Trans>Login</Trans>
                            </ClickableButton>
                        )}
                    </li>
                </ul>
            </nav>
        </>
    );
});
