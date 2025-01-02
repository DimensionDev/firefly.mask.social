import { memo } from 'react';

import { Link } from '@/components/Link.js';
import { Menu } from '@/components/SideBar/Menu.js';
import { SideBarLogo } from '@/components/SideBar/SidebarLogo.js';
import { PageRoute } from '@/constants/enum.js';

export const SideBarForDesktop = memo(function SideBarForDesktop() {
    return (
        <aside className="fixed inset-y-0 z-40 flex h-[100svh] min-h-[626px] flex-col max-md:hidden md:w-[235px] lg:w-[289px]">
            <div className="flex grow flex-col gap-y-4 border-r border-line px-3 lg:px-6">
                <header className="-ml-1 flex h-16 shrink-0 items-center">
                    <Link href={PageRoute.Home}>
                        <SideBarLogo />
                    </Link>
                </header>
                <Menu />
            </div>
        </aside>
    );
});
