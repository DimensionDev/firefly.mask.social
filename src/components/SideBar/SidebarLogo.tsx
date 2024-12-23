import { memo } from 'react';

import DarkLogo from '@/assets/logo.dark.svg';
import LightLogo from '@/assets/logo.light.svg';
import MiniLogo from '@/assets/miniLogo.svg';

export const SideBarLogo = memo(function SideBarLogo() {
    return (
        <>
            <LightLogo width={169} height={80} className="sidebar-light-logo max-md:hidden" />
            <DarkLogo width={169} height={80} className="sidebar-dark-logo max-md:hidden" />
            <MiniLogo className="ml-5 md:hidden" width={33} height={43} />
        </>
    );
});
