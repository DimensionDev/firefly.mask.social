'use client';

import { t, Trans } from '@lingui/macro';

import { AccountCard } from './AccountCard/index.js';

const fireflyCommunities = [
    {
        content: t`Follow @thefireflyapp on X`,
        link: 'https://twitter.com/intent/user?screen_name=thefireflyapp',
        logo: '/svg/x-light.svg',
    },
    {
        content: t`Visit firefly.land`,
        link: 'https://firefly.land',
        logo: '/svg/fireflyRound.svg'
    },
    {
        content: t`Join our Discord`,
        link: 'https://discord.com/invite/pufMbBGQZN',
        logo: '/svg/discord.svg'
    },
    {
        content: t`Join our Telegram`,
        link: 'https://t.me/+mz9T_4YOYhoyYmYx',
        logo: '/svg/telegram.svg'
    }
];

const maskCommunities = [
    {
        content: t`Follow @realMaskNetwork on X`,
        link: 'https://twitter.com/intent/user?screen_name=realMaskNetwork',
        logo: '/svg/x-light.svg',
    },
    {
        content: t`Visit mask.io`,
        link: 'https://mask.io',
        logo: '/svg/maskRound.svg'
    },
    {
        content: t`Join our Discord`,
        link: 'https://discord.com/invite/4SVXvj7',
        logo: '/svg/discord.svg'
    },
    {
        content: t`Join our Telegram`,
        link: 'https://t.me/maskbook_group#telegram',
        logo: '/svg/telegram.svg'
    }
]

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
            {fireflyCommunities.map(({ content, link, logo }) => (
                <AccountCard key={link} content={content} link={link} logo={logo} />
            ))}
            <div className="flex w-full items-center justify-between">
                <span className="text-base font-bold leading-[18px] text-main">
                    <Trans>Mask Network</Trans>
                </span>
            </div>
            {maskCommunities.map(({ content, link, logo }) => (
                <AccountCard key={link} content={content} link={link} logo={logo} />
            ))}
        </div>
    );
}
