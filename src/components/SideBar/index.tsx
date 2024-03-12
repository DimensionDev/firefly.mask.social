'use client';

import { memo } from 'react';

import { SideBarForDesktop } from '@/components/SideBar/SideBarForDesktop.js';
import { SideBarForMobile } from '@/components/SideBar/SideBarForMobile.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';

export const SideBar = memo(function SideBar() {
    const isMedium = useIsMedium();
    return isMedium ? <SideBarForDesktop /> : <SideBarForMobile />;
});
