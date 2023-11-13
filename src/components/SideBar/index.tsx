'use client';

import { ConnectWalletNav } from '@/components/SideBar/ConnectWalletNav';
import { PageRoutes } from '@/constants/enum';
import Image from 'next/image';
import Link from 'next/link';
import { memo } from 'react';

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
    return (
        <div className="absolute inset-y-0 z-50 flex w-72 flex-col">
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
                                    <li className="py-3 px-4 rounded-lg hover:bg-[#f9f9f9]" key={item.name}>
                                        {item.href === '/connect-wallet' ? (
                                            <ConnectWalletNav />
                                        ) : (
                                            <Link href={item.href} className="text-2xl/6 flex gap-x-3">
                                                <Image src={item.icon} width={24} height={24} alt={item.name} />
                                                {item.name}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                                <li>
                                    <button
                                        type="button"
                                        className="rounded-[16px] bg-main px-3 py-3 text-xl leading-6 min-w-[150px] font-semibold text-white shadow-sm hover:bg-main focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                    >
                                        Post
                                    </button>
                                </li>
                            </ul>
                        </li>
                        <li className="mt-auto mb-20">
                            <div className="flex gap-x-2 pl-2">
                                <Image src="/svg/lens.svg" width={40} height={40} alt="Lens" />
                                <Image src="/svg/farcaster.svg" width={40} height={40} alt="Farcaster" />
                            </div>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
});
