import { ComposeButtonForMobile } from '@/components/ComposeButton/ComposeButtonForMobile.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';

export function ComposeButton() {
    const isMedium = useIsMedium();

    return isMedium ? null : <ComposeButtonForMobile />;
}
