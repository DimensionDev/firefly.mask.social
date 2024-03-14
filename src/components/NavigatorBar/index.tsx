'use client';

import { NavigatorBarForMobile } from '@/components/NavigatorBar/NavigatorBarForMobile.js';
import { useIsSmall } from '@/hooks/useMediaQuery.js';
import { useNavigatorState } from '@/store/useNavigatorStore.js';

interface NavigatorBarProps {
    enableSearch?: boolean;
}

export function NavigatorBar({ enableSearch }: NavigatorBarProps) {
    const title = useNavigatorState.use.title();
    const isSmall = useIsSmall('max');

    return isSmall ? <NavigatorBarForMobile title={title} enableSearch={enableSearch} /> : null;
}
