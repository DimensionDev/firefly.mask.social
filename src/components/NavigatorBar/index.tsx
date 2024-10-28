'use client';

import { NavigatorBarForMobile } from '@/components/NavigatorBar/NavigatorBarForMobile.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { useMounted } from '@/hooks/useMounted.js';
import { useNavigatorState } from '@/store/useNavigatorStore.js';

interface NavigatorBarProps {
    enableSearch?: boolean;
    enableFixedBack?: boolean;
}

export function NavigatorBar(props: NavigatorBarProps) {
    const title = useNavigatorState.use.title();
    const isMedium = useIsMedium();
    const mounted = useMounted();

    if (!mounted) return null;

    return isMedium ? null : <NavigatorBarForMobile title={title} {...props} />;
}
