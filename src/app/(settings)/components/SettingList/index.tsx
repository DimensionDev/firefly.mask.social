'use client';

import { i18n } from '@lingui/core';
import { Trans } from '@lingui/react';

import { Image } from '@/esm/Image.js';
import { Link } from '@/esm/Link.js';

const settings = [
    { name: i18n.t('Display'), link: '/display' },
    { name: i18n.t('Associated Wallets'), link: '/associated' },
    { name: i18n.t('Connected Accounts'), link: '/connected' },
    { name: i18n.t('Communities'), link: '/communities' },
    { name: i18n.t('More'), link: '/more' },
];

export function SettingList() {
    return (
        <div className="flex min-h-full min-w-[280px] flex-col border-r border-gray-200 p-[24px]">
            <div className=" pb-[24px] text-[20px] font-bold leading-[24px] text-lightMain">
                <Trans id="Settings" />
            </div>
            {settings.map(({ name, link }) => (
                <Link
                    className="mb-[24px] flex items-center justify-between border-b border-gray-200 pb-[4px] text-[18px] leading-[24px] text-main"
                    key={name}
                    href={`/settings${link}`}
                >
                    {name} <Image src="/svg/rightArrow.svg" width={20} height={20} alt="right arrow" />
                </Link>
            ))}
        </div>
    );
}
