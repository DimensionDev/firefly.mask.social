import type { SVGProps } from 'react';

import LimoIconLight from '@/assets/limo.svg';
import LimoIconDark from '@/assets/limo-dark.svg';
import { useIsDarkMode } from '@/hooks/useIsDarkMode.js';

interface LimoIconProps extends SVGProps<SVGSVGElement> {}

export function LimoIcon(props: LimoIconProps) {
    const isDark = useIsDarkMode();

    return isDark ? <LimoIconDark {...props} /> : <LimoIconLight {...props} />;
}
