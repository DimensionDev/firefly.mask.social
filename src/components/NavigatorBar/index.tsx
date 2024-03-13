'use client';

import { NavigatorBarForMobile } from '@/components/NavigatorBar/NavigatorBarForMobile.js';
import { useIsSmall } from '@/hooks/useMediaQuery.js';
import { useNavigatorState } from '@/store/useNavigatorStore.js';

export function NavigatorBar() {
    const title = useNavigatorState.use.title();
    const isSmall = useIsSmall('max');

    return isSmall ? <NavigatorBarForMobile title={title} /> : null;
}
