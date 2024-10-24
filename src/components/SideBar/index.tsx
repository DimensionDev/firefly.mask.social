import { memo } from 'react';

import { SideBarForDesktop } from '@/components/SideBar/SideBarForDesktop.js';
// import { SideBarForMobile } from '@/components/SideBar/SideBarForMobile.js';

export const SideBar = memo(function SideBar() {
    return (
        <>
            <SideBarForDesktop />
            {/* <SideBarForMobile /> */}
        </>
    );
});
