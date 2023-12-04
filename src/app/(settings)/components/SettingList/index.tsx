'use client';

import { t, Trans } from '@lingui/macro';

import RightArrow from '@/assets/rightArrow.svg';
import { Link } from '@/esm/Link.js';

const settings = [
    { name: t`Display`, link: '/display' },
    { name: t`Connected Accounts`, link: '/connected' },
    { name: t`Communities`, link: '/communities' },
    { name: t`More`, link: '/more' },
];

export function SettingList() {
    return (
        <div className="flex min-h-full min-w-[280px] flex-col border-r border-line p-[24px]">
            <div className=" pb-[24px] text-[20px] font-bold leading-[24px] text-lightMain">
                <Trans>Settings</Trans>
            </div>
            {settings.map(({ name, link }) => (
                <Link
                    className="mb-[24px] flex items-center justify-between border-b border-line pb-[4px] text-[18px] leading-[24px] text-main"
                    key={name}
                    href={`/settings${link}`}
                >
                    {name} <RightArrow width={20} height={20} />
                </Link>
            ))}
        </div>
    );
}
