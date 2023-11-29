'use client';

import { t, Trans } from '@lingui/macro';

import { AccountCard } from './AccountCard/index.js';

const communities = [
    {
        content: t`Follow @thefireflyapp on X`,
        link: 'https://twitter.com/thefireflyapp',
        logo: '/svg/x-light.svg',
    },
];

export default function Connected() {
    return (
        <div className="flex w-full flex-col items-center gap-[24px] p-[24px]">
            <div className="flex w-full items-center justify-between gap-[24px]">
                <span className="text-[18px] font-bold leading-[24px] text-main">
                    <Trans>Communities</Trans>
                </span>
            </div>
            <div className="flex w-full items-center justify-between">
                <span className="text-base font-bold leading-[18px] text-main">
                    <Trans>Firefly</Trans>
                </span>
            </div>
            {communities.map(({ content, link, logo }) => (
                <AccountCard key={link} content={content} link={link} logo={logo} />
            ))}
        </div>
    );
}
