import { Trans } from '@lingui/macro';
import { usePathname } from 'next/navigation.js';
import { useRef } from 'react';
import { useHover } from 'usehooks-ts';

import { PageRoute } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { useDarkMode } from '@/hooks/useDarkMode.js';

export function ExclusiveEvents() {
    const pathname = usePathname();
    const isSelected = isRoutePathname(pathname, PageRoute.Events);
    const { isDarkMode } = useDarkMode();
    const linkRef = useRef<HTMLAnchorElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const isHovering = useHover(linkRef);

    return (
        <Link
            ref={linkRef}
            href={PageRoute.Events}
            className={classNames(
                'flex w-full flex-grow-0 items-center gap-x-3 rounded-lg px-2 py-2.5 text-xl leading-6 outline-none hover:bg-bg md:w-auto md:px-4 md:py-3',
                { 'font-bold': isSelected },
            )}
            onMouseEnter={() => videoRef.current?.play()}
        >
            <video
                ref={videoRef}
                src={isDarkMode ? '/webm/activity-icon-dark.webm' : '/webm/activity-icon-light.webm'}
                poster={isDarkMode ? '/webm/poster/activity-icon-dark.png' : '/webm/poster/activity-icon-light.png'}
                autoPlay
                muted
                loop={isHovering}
                playsInline
                width={20}
                height={20}
                className="h-5 w-5"
            />
            <Trans>Exclusive Events</Trans>
        </Link>
    );
}