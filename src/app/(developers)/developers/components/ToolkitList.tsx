'use client';

import { Trans } from '@lingui/macro';
import { usePathname } from 'next/navigation.js';

import RightArrowIcon from '@/assets/right-arrow.svg';
import { Link } from '@/esm/Link.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';

const toolkit = [
    { name: <Trans>Frame Validator</Trans>, link: '/frame' },
    { name: <Trans>OpenGraph Validator</Trans>, link: '/og' },
];

export function ToolkitList() {
    const pathname = usePathname();

    return (
        <div className="flex min-h-full min-w-[280px] flex-col border-r border-line p-[24px]">
            <div className=" pb-[24px] text-[20px] font-bold leading-[24px] text-lightMain">
                <Trans>Developers</Trans>
            </div>
            {toolkit.map(({ name, link }) => (
                <Link
                    className={`mb-[24px] flex items-center justify-between border-b border-line pb-[4px] text-[18px] leading-[24px] text-main hover:font-bold ${
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
