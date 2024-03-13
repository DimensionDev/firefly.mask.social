import { memo } from 'react';

import { Menu } from '@/components/SideBar/Menu.js';

export const SideBarForMobile = memo(function SideBarForMobile() {
    return (
        <div className=" fixed inset-0 right-[35%] z-50 bg-white dark:bg-black ">
            <Menu />
        </div>
    );
});
