'use client';

import { t, Trans } from '@lingui/macro';

import { DocumentCard } from '@/app/(settings)/components/DocumentCard.js';
import { Headline } from '@/app/(settings)/components/Headline.js';
import { LinkCard } from '@/app/(settings)/components/LinkCard.js';
import { Subtitle } from '@/app/(settings)/components/Subtitle.js';
import DiscordIcon from '@/assets/discord.svg';
import DocumentsIcon from '@/assets/documents.svg';
import FireflyRoundIcon from '@/assets/firefly.round.svg';
import MaskRoundIcon from '@/assets/mask.round.svg';
import SecurityIcon from '@/assets/security.svg';
import TelegramIcon from '@/assets/telegram.svg';
import XLightIcon from '@/assets/x-light.svg';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';

export default function More() {
    useNavigatorTitle(t`More`);

    return (
        <div className="flex w-full flex-col items-center gap-6 p-6">
            <Headline>
                <Trans>More</Trans>
            </Headline>

            <div className="flex w-full flex-col gap-4">
                {[
                    {
                        href: 'https://mask.notion.site/Privacy-Policy-2e903bb2220e4dcfb7c3e8fcbd983d2a',
                        title: t`Privacy Policy`,
                        icon: <SecurityIcon width={24} height={24} />,
                    },
                    {
                        href: 'https://mask.notion.site/Terms-of-Service-bd035d18f7814a79b9d4d7682d9d2d30',
                        title: t`Terms of Service`,
                        icon: <DocumentsIcon width={24} height={24} />,
                    },
                ].map((document) => (
                    <DocumentCard key={document.href} {...document} />
                ))}
            </div>

            <Subtitle>
                <Trans>Firefly</Trans>
            </Subtitle>

            <div className="flex w-full flex-col gap-4">
                {[
                    {
                        content: t`Follow @thefireflyapp on X`,
                        link: 'https://x.com/intent/user?screen_name=thefireflyapp',
                        logo: XLightIcon,
                    },
                    {
                        content: t`Visit firefly.social`,
                        link: 'https://firefly.social',
                        logo: FireflyRoundIcon,
                    },
                    {
                        content: t`Join our Discord`,
                        link: 'https://discord.com/invite/pufMbBGQZN',
                        logo: DiscordIcon,
                    },
                    {
                        content: t`Join our Telegram`,
                        link: 'https://t.me/+mz9T_4YOYhoyYmYx',
                        logo: TelegramIcon,
                    },
                ].map(({ content, link, logo }) => (
                    <LinkCard key={link} content={content} link={link} logo={logo} />
                ))}
            </div>

            <Subtitle>
                <Trans>Mask Network</Trans>
            </Subtitle>

            <div className="flex w-full flex-col gap-4">
                {[
                    {
                        content: t`Follow @realMaskNetwork on X`,
                        link: 'https://x.com/intent/user?screen_name=realMaskNetwork',
                        logo: XLightIcon,
                    },
                    {
                        content: t`Visit mask.io`,
                        link: 'https://mask.io',
                        logo: MaskRoundIcon,
                    },
                    {
                        content: t`Join our Discord`,
                        link: 'https://discord.com/invite/4SVXvj7',
                        logo: DiscordIcon,
                    },
                    {
                        content: t`Join our Telegram`,
                        link: 'https://t.me/maskbook_group#telegram',
                        logo: TelegramIcon,
                    },
                ].map(({ content, link, logo }) => (
                    <LinkCard key={link} content={content} link={link} logo={logo} />
                ))}
            </div>
        </div>
    );
}
