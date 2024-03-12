'use client';

import { NavigatorBarForMobile } from '@/components/NavigatorBar/NavigatorBarForMobile.js';
import { useIsSmall } from '@/hooks/useMediaQuery.js';

export function NavigatorBar() {
    const isSmall = useIsSmall('max');
    return isSmall ? <NavigatorBarForMobile /> : null;
}
