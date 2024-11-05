'use client';

import { Trans } from '@lingui/macro';
import { usePathname } from 'next/navigation.js';
import { memo } from 'react';

import ActivityIcon from '@/assets/activity.svg';
import BookmarkSelectedIcon from '@/assets/bookmark.selected.svg';
import BookmarkIcon from '@/assets/bookmark.svg';
import CircleShareIcon from '@/assets/circle-share.svg';
import DiscoverSelectedIcon from '@/assets/discover.selected.svg';
import DiscoverIcon from '@/assets/discover.svg';
import ExploreSelectedIcon from '@/assets/explore.selected.svg';
import ExploreIcon from '@/assets/explore.svg';
import FollowingSelectedIcon from '@/assets/following.selected.svg';
import FollowingIcon from '@/assets/following.svg';
import NotificationSelectedIcon from '@/assets/notification.selected.svg';
import NotificationIcon from '@/assets/notification.svg';
import ProfileSelectedIcon from '@/assets/profile.selected.svg';
import ProfileIcon from '@/assets/profile.svg';
import SettingsSelectedIcon from '@/assets/setting.selected.svg';
import SettingsIcon from '@/assets/setting.svg';
import WalletIcon from '@/assets/wallet.svg';
import { OpenFireflyAppButton } from '@/components/OpenFireflyAppButton.js';
import { ConnectWallet } from '@/components/SideBar/ConnectWallet.js';
import { ExclusiveEvents } from '@/components/SideBar/ExclusiveEvents.js';
import { Footer } from '@/components/SideBar/Footer.js';
import { Post } from '@/components/SideBar/Post.js';
import { Profile } from '@/components/SideBar/Profile.js';
import { Tooltip } from '@/components/Tooltip.js';
import { PageRoute } from '@/constants/enum.js';
import { DEFAULT_EXPLORE_TYPE, DEFAULT_SOCIAL_SOURCE } from '@/constants/index.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { isMatchedDiscoverPage } from '@/helpers/isMatchedDiscoverPage.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { resolveBookmarkUrl } from '@/helpers/resolveBookmarkUrl.js';
import { resolveExploreUrl } from '@/helpers/resolveExploreUrl.js';
import { resolveFollowingUrl } from '@/helpers/resolveFollowingUrl.js';
import { resolveNotificationUrl } from '@/helpers/resolveNotificationUrl.js';
import { useNavigatorState } from '@/store/useNavigatorStore.js';

interface MenuProps {
    collapsed?: boolean;
}

export const Menu = memo(function Menu({ collapsed = false }: MenuProps) {
    const pathname = usePathname();

    return (
        <nav className="relative flex flex-1 flex-col">
            <menu role="list" className="flex flex-1 flex-col gap-y-7">
                <li className="flex overflow-hidden">
                    <menu role="list" className="w-full overflow-hidden">
                        {[
                            {
                                href: PageRoute.Home,
                                name: <Trans>Discover</Trans>,
                                icon: DiscoverIcon,
                                selectedIcon: DiscoverSelectedIcon,
                                match: () => pathname === PageRoute.Home || isMatchedDiscoverPage(pathname),
                            },
                            {
                                href: resolveFollowingUrl(DEFAULT_SOCIAL_SOURCE),
                                name: <Trans>Following</Trans>,
                                icon: FollowingIcon,
                                selectedIcon: FollowingSelectedIcon,
                                match: () => pathname.startsWith(PageRoute.Following),
                            },
                            {
                                href: resolveExploreUrl(DEFAULT_EXPLORE_TYPE),
                                name: <Trans>Explore</Trans>,
                                icon: ExploreIcon,
                                selectedIcon: ExploreSelectedIcon,
                                match: () => pathname.startsWith(PageRoute.Explore),
                            },
                            {
                                href: resolveNotificationUrl(DEFAULT_SOCIAL_SOURCE),
                                name: <Trans>Notifications</Trans>,
                                icon: NotificationIcon,
                                selectedIcon: NotificationSelectedIcon,
                                match: () => pathname.startsWith(PageRoute.Notifications),
                            },
                            {
                                href: resolveBookmarkUrl(DEFAULT_SOCIAL_SOURCE),
                                name: <Trans>Bookmarks</Trans>,
                                icon: BookmarkIcon,
                                selectedIcon: BookmarkSelectedIcon,
                                match: () => pathname.startsWith(PageRoute.Bookmarks),
                            },
                            {
                                href: '/profile',
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
                                href: PageRoute.Events,
                                name: <Trans>Exclusive Events</Trans>,
                                icon: ActivityIcon,
                                selectedIcon: ActivityIcon,
                            },
                            {
                                href: PageRoute.Settings,
                                name: <Trans>Settings</Trans>,
                                icon: SettingsIcon,
                                selectedIcon: SettingsSelectedIcon,
                                match: () => isRoutePathname(pathname, PageRoute.Settings),
                            },
                        ].map((item) => {
                            const isSelected = Boolean(item.match?.());
                            const Icon = isSelected ? item.selectedIcon : item.icon;

                            return (
                                <li
                                    className="flex rounded-lg text-main outline-none"
                                    key={item.href}
                                    onClick={() => {
                                        useNavigatorState.getState().updateSidebarOpen(false);
                                    }}
                                >
                                    {{
                                        [PageRoute.ConnectWallet]: <ConnectWallet collapsed={collapsed} />,
                                        [PageRoute.Events]: <ExclusiveEvents />,
                                        [PageRoute.Profile]: <Profile collapsed={collapsed} />,
                                    }[item.href] ?? (
                                        <Link
                                            href={item.href}
                                            className={classNames(
                                                'flex w-full flex-grow-0 items-center gap-x-3 rounded-lg px-2 py-2.5 text-xl leading-6 outline-none hover:bg-bg md:w-auto md:px-4 md:py-3',
                                                { 'font-bold': isSelected },
                                            )}
                                        >
                                            {collapsed ? (
                                                <Tooltip content={item.name} placement="right">
                                                    <Icon width={20} height={20} />
                                                </Tooltip>
                                            ) : (
                                                <Icon width={20} height={20} />
                                            )}

                                            <span style={{ display: collapsed ? 'none' : 'inline' }}>{item.name}</span>
                                        </Link>
                                    )}
                                </li>
                            );
                        })}

                        <li className="md: hidden">
                            <OpenFireflyAppButton className="flex w-full items-center gap-x-3 px-2 py-2.5 text-fireflyBrand">
                                <CircleShareIcon width={20} height={20} />
                                <span className="text-xl font-bold leading-6">
                                    <Trans>Mobile App</Trans>
                                </span>
                            </OpenFireflyAppButton>
                        </li>
                        <Post collapsed={collapsed} />
                    </menu>
                </li>
            </menu>
            <Footer collapsed={collapsed} />
        </nav>
    );
});
