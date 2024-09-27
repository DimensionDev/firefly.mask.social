'use client';

import { PlusIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { t, Trans } from '@lingui/macro';
import { delay } from '@masknet/kit';
import { usePathname } from 'next/navigation.js';
import { memo } from 'react';

import BookmarkSelectedIcon from '@/assets/bookmark.selected.svg';
import BookmarkIcon from '@/assets/bookmark.svg';
import CircleShareIcon from '@/assets/circle-share.svg';
import DiscoverSelectedIcon from '@/assets/discover.selected.svg';
import DiscoverIcon from '@/assets/discover.svg';
import FollowingSelectedIcon from '@/assets/following.selected.svg';
import FollowingIcon from '@/assets/following.svg';
import LoadingIcon from '@/assets/loading.svg';
import NotificationSelectedIcon from '@/assets/notification.selected.svg';
import NotificationIcon from '@/assets/notification.svg';
import ProfileSelectedIcon from '@/assets/profile.selected.svg';
import ProfileIcon from '@/assets/profile.svg';
import SettingsSelectedIcon from '@/assets/setting.selected.svg';
import SettingsIcon from '@/assets/setting.svg';
import WalletIcon from '@/assets/wallet.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { ActivityMenuIcon } from '@/components/CZ/ActivityMenuIcon.js';
import { LoginStatusBar } from '@/components/Login/LoginStatusBar.js';
import { OpenFireflyAppButton } from '@/components/OpenFireflyAppButton.js';
import { ConnectWallet } from '@/components/SideBar/ConnectWallet.js';
import { Tooltip } from '@/components/Tooltip.js';
import { PageRoute } from '@/constants/enum.js';
import { DEFAULT_SOCIAL_SOURCE } from '@/constants/index.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { isMatchedDiscoverPage } from '@/helpers/isMatchedDiscoverPage.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { isSameFireflyIdentity } from '@/helpers/isSameFireflyIdentity.js';
import { parseProfileUrl } from '@/helpers/parseProfileUrl.js';
import { resolveBookmarkUrl } from '@/helpers/resolveBookmarkUrl.js';
import { resolveFollowingUrl } from '@/helpers/resolveFollowingUrl.js';
import { resolveNotificationUrl } from '@/helpers/resolveNotificationUrl.js';
import { useAsyncStatusAll } from '@/hooks/useAsyncStatus.js';
import { useCurrentFireflyProfilesAll } from '@/hooks/useCurrentFireflyProfiles.js';
import { useCurrentProfileFirstAvailable } from '@/hooks/useCurrentProfile.js';
import { useCurrentVisitingChannel } from '@/hooks/useCurrentVisitingChannel.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { ComposeModalRef, CZActivityModalRef, LoginModalRef } from '@/modals/controls.js';
import { useNavigatorState } from '@/store/useNavigatorStore.js';

interface MenuProps {
    collapsed?: boolean;
}

export const Menu = memo(function Menu({ collapsed = false }: MenuProps) {
    const currentChannel = useCurrentVisitingChannel();
    const isMedium = useIsMedium();
    const { updateSidebarOpen } = useNavigatorState();

    const profile = useCurrentProfileFirstAvailable();
    const profiles = useCurrentFireflyProfilesAll();

    const isLogin = useIsLogin();
    const pathname = usePathname();

    const isLoading = useAsyncStatusAll();

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
                                href: profile ? getProfileUrl(profile) : PageRoute.Profile,
                                name: <Trans>Profile</Trans>,
                                icon: ProfileIcon,
                                selectedIcon: ProfileSelectedIcon,
                                match: () => {
                                    const parsedProfileUrl = parseProfileUrl(pathname);
                                    if (!parsedProfileUrl) return false;
                                    return profiles.some((x) =>
                                        isSameFireflyIdentity(x.identity, {
                                            source: parsedProfileUrl.source,
                                            id: parsedProfileUrl.id,
                                        }),
                                    );
                                },
                            },
                            {
                                href: '/connect-wallet',
                                name: <Trans>Connect</Trans>,
                                icon: WalletIcon,
                                selectedIcon: WalletIcon,
                            },
                            {
                                href: '/welcome-cz',
                                name: <Trans>Welcome Back CZ</Trans>,
                                icon: ActivityMenuIcon,
                                selectedIcon: ActivityMenuIcon,
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
                                    onClick={() => updateSidebarOpen(false)}
                                >
                                    {{
                                        ['/connect-wallet']: <ConnectWallet collapsed={collapsed} />,
                                        ['/welcome-cz']: (
                                            <button
                                                className="flex w-full flex-grow-0 items-center gap-x-3 rounded-lg px-2 py-2.5 text-xl leading-6 outline-none hover:bg-bg md:w-auto md:px-4 md:py-3"
                                                onClick={() => CZActivityModalRef.open()}
                                            >
                                                {collapsed ? (
                                                    <Tooltip content={item.name} placement="right">
                                                        <Icon width={20} height={20} />
                                                    </Tooltip>
                                                ) : (
                                                    <Icon width={20} height={20} />
                                                )}
                                                <span style={{ display: collapsed ? 'none' : 'inline' }}>
                                                    {item.name}
                                                </span>
                                            </button>
                                        ),
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
                        {!isMedium ? (
                            <li>
                                <OpenFireflyAppButton className="flex w-full items-center gap-x-3 px-2 py-2.5 text-fireflyBrand">
                                    <CircleShareIcon width={20} height={20} />
                                    <span className="text-xl font-bold leading-6">
                                        <Trans>Mobile App</Trans>
                                    </span>
                                </OpenFireflyAppButton>
                            </li>
                        ) : null}
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
                                        className="mt-6 hidden w-[200px] rounded-2xl bg-main p-2 text-xl font-bold leading-6 text-primaryBottom md:block"
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
                    </menu>
                </li>
            </menu>
            <footer
                className={classNames('absolute -left-2 -right-2 bottom-20', {
                    'flex justify-center text-center': !isLogin,
                })}
            >
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
                        disabled={isLoading}
                        onClick={async () => {
                            updateSidebarOpen(false);
                            await delay(300);
                            LoginModalRef.open();
                        }}
                        className="flex w-[200px] items-center justify-center rounded-2xl bg-main p-2 text-xl font-bold leading-6 text-primaryBottom"
                    >
                        {isLoading ? (
                            <LoadingIcon className="mr-2 animate-spin" width={24} height={24} />
                        ) : (
                            <Trans>Login</Trans>
                        )}
                    </ClickableButton>
                )}
            </footer>
        </nav>
    );
});
