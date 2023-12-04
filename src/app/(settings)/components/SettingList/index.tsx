'use client';

import { t, Trans } from '@lingui/macro';

import RightArrowIcon from '@/assets/right-arrow.svg';
import { Link } from '@/esm/Link.js';
import { useLogin } from '@/hooks/useLogin.js';
import { usePathname } from 'next/navigation.js'

const settings = [
    { name: t`Display`, link: '/display' },
    { name: t`Connected Accounts`, link: '/connected' },
    { name: t`Communities`, link: '/communities' },
    { name: t`More`, link: '/more' },
];

export function SettingList() {
    const isLoggedIn = useLogin();
    const pathname = usePathname();
    return (
        <div className="flex min-h-full min-w-[280px] flex-col border-r border-line p-[24px]">
            <div className=" pb-[24px] text-[20px] font-bold leading-[24px] text-lightMain">
                <Trans>Settings</Trans>
            </div>
            {settings.map(({ name, link }) => {
                return link === '/connected' && !isLoggedIn ? null : (
                    <Link
                        className={`mb-[24px] flex items-center justify-between border-b border-line pb-[4px] text-[18px] leading-[24px] text-main ${pathname === `/settings${link}` ? 'font-bold' : 'font-normal'}`}
                        key={name}
                        href={`/settings${link}`}
                    >
                        {name} <RightArrowIcon width={20} height={20} />
                    </Link>)
            })}
        </div>
    );
}
