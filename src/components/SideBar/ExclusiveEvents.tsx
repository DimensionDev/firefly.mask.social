import { Trans } from '@lingui/macro';
import { DotLottie, DotLottieReact } from '@lottiefiles/dotlottie-react';
import { usePathname } from 'next/navigation.js';
import { useRef } from 'react';
import { useDarkMode } from 'usehooks-ts';

import { PageRoute } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';

export function ExclusiveEvents() {
    const pathname = usePathname();
    const isSelected = isRoutePathname(pathname, PageRoute.Events);
    const ref = useRef<DotLottie | null>(null);
    const { isDarkMode } = useDarkMode();

    return (
        <Link
            href={PageRoute.Events}
            className={classNames(
                'flex w-full flex-grow-0 items-center gap-x-3 rounded-lg px-2 py-2.5 text-xl leading-6 outline-none hover:bg-bg md:w-auto md:px-4 md:py-3',
                { 'font-bold': isSelected },
            )}
        >
            <DotLottieReact
                dotLottieRefCallback={(x) => {
                    ref.current = x;
                }}
                renderConfig={{}}
                src={
                    isDarkMode
                        ? '/lottie-files/discover_right_top_activity_icon_light.json'
                        : '/lottie-files/discover_right_top_activity_icon_dark.json'
                }
                autoplay
                width={20}
                height={20}
                className="h-5 w-5"
            />
            <Trans>Exclusive Events</Trans>
        </Link>
    );
}
