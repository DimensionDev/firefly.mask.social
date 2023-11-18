'use client';

import { FarcasterStatusModal } from '@/components/FarcasterStatusModal.js';
import { LensStatusModal } from '@/components/LensStatusModal.js';
import { LoginModal } from '@/components/LoginModal.js';
import { LoginStatusBar } from '@/components/LoginStatusBar.js';
import { PageRoutes } from '@/constants/enum.js';
import { Image } from '@/esm/Image.js';
import { Link } from '@/esm/Link.js';
import { memo, useState } from 'react';
import { ConnectWalletNav } from './ConnectWalletNav.js';

const items = [
    { href: PageRoutes.Home, name: 'Discover', icon: '/svg/discover.svg', selectedIcon: '/svg/discover.selected.svg' },
    {
        href: PageRoutes.Following,
        name: 'Following',
        icon: '/svg/following.svg',
        selectedIcon: '/svg/following.selected.svg',
    },
    {
        href: PageRoutes.Notification,
        name: 'Notification',
        icon: '/svg/notification.svg',
        selectedIcon: '/svg/notification.selected.svg',
    },
    { href: PageRoutes.Profile, name: 'Profile', icon: '/svg/profile.svg', selectedIcon: '/svg/profile.selected.svg' },
    { href: '/connect-wallet', name: 'Connect Wallet', icon: '/svg/wallet.svg', selectedIcon: '/svg/wallet.svg' },
    { href: PageRoutes.Setting, name: 'Setting', icon: '/svg/setting.svg', selectedIcon: '/svg/setting.selected.svg' },
];

export const SideBar = memo(function SideBar() {
    const [loginOpen, setLoginOpen] = useState(false);
    const [lensStatusOpen, setLensStatusOpen] = useState(false);
    const [farcasterStatusOpen, setFarcasterStatusOpen] = useState(false);
    const isLogin = false;

    return (
        <>
            <div className="fixed inset-y-0 z-50 flex w-72 flex-col">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
                    <div className="flex h-16 shrink-0 items-center">
                        <Link href={PageRoutes.Home}>
                            <Image width={134} height={64} src="/logo.png" alt="Firefly" />
                        </Link>
                    </div>
                    <nav className="flex flex-1 flex-col">
                        <ul role="list" className="flex flex-1 flex-col gap-y-7">
                            <li>
                                <ul role="list" className="-mx-2 space-y-6">
                                    {items.map((item) => (
                                        <li className="hover:bg-bg px-4 py-3 text-main" key={item.name}>
                                            {item.href === '/connect-wallet' ? (
                                                <ConnectWalletNav />
                                            ) : (
                                                <Link href={item.href} className="flex gap-x-3 text-2xl/6">
                                                    <Image src={item.icon} width={24} height={24} alt={item.name} />
                                                    {item.name}
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                                    <li>
                                        <button
                                            onClick={() => {}}
                                            type="button"
                                            className="min-w-[150px] rounded-[16px] bg-main px-3 py-3 text-xl font-semibold leading-6 text-white shadow-sm hover:bg-main focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                        >
                                            Post
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
                                        className="min-w-[150px] rounded-[16px] bg-main px-3 py-3 text-xl font-semibold leading-6 text-white shadow-sm hover:bg-main focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                    >
                                        Login
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
