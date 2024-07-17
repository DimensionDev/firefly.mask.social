'use client';

import { Trans } from '@lingui/macro';
import { usePathname } from 'next/navigation.js';

import RightArrowIcon from '@/assets/right-arrow.svg';
import { Link } from '@/esm/Link.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';

export function ToolkitList() {
    const pathname = usePathname();

    return (
        <div className="flex min-h-full min-w-full flex-col p-6 md:min-w-[280px] md:border-r md:border-line">
            <div className="pb-6 text-[20px] font-bold leading-[24px] text-lightMain">
                <Trans>Developers</Trans>
            </div>
            {[
                { name: <Trans>Settings</Trans>, link: '/settings' },
                { name: <Trans>Blink Validator</Trans>, link: '/blink' },
                { name: <Trans>Frame Validator</Trans>, link: '/frame' },
                { name: <Trans>OpenGraph Validator</Trans>, link: '/og' },
            ].map(({ name, link }) => (
                <Link
                    className={`mb-6 flex items-center justify-between border-b border-line pb-1 text-[18px] leading-[24px] text-main hover:font-bold ${
                        isRoutePathname(pathname, `/developers${link}`) ? 'font-bold' : 'font-normal'
                    }`}
                    key={link}
                    href={`/developers${link}`}
                >
                    {name} <RightArrowIcon width={20} height={20} />
                </Link>
            ))}
        </div>
    );
}
