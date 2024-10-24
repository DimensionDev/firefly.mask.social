'use client';

import { ComposeButtonForMobile } from '@/components/ComposeButton/ComposeButtonForMobile.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { useMounted } from '@/hooks/useMounted.js';

export function ComposeButton() {
    const isMedium = useIsMedium();
    const mounted = useMounted();
    if (!mounted) return null;
    return isMedium ? null : <ComposeButtonForMobile />;
}
