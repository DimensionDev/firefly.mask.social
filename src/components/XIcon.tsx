import XIconDark from '@/assets/x-circle-dark.svg';
import XIconLight from '@/assets/x-circle-light.svg';
import { useIsDarkMode } from '@/hooks/useIsDarkMode.js';

interface XIconProps extends React.SVGProps<SVGSVGElement> {}

export function XIcon(props: XIconProps) {
    const isDark = useIsDarkMode();

    return isDark ? <XIconDark {...props} /> : <XIconLight {...props} />;
}
