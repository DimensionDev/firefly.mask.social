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
import { XIcon } from '@/components/XIcon.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';

function SmallXIcon() {
    return (
        <div className="flex h-6 w-6 items-center justify-center">
            <XIcon width={23} height={23} />
        </div>
    );
}

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
                        title: <Trans>Privacy Policy</Trans>,
                        icon: <SecurityIcon width={24} height={24} />,
                    },
                    {
                        href: 'https://mask.notion.site/Terms-of-Service-bd035d18f7814a79b9d4d7682d9d2d30',
                        title: <Trans>Terms of Service</Trans>,
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
                        title: <Trans>Follow @thefireflyapp on X</Trans>,
                        link: 'https://x.com/intent/user?screen_name=thefireflyapp',
                        logo: SmallXIcon,
                    },
                    {
                        title: <Trans>Visit firefly.social</Trans>,
                        link: 'https://firefly.social',
                        logo: FireflyRoundIcon,
                    },
                    {
                        title: <Trans>Join our Discord</Trans>,
                        link: 'https://discord.com/invite/pufMbBGQZN',
                        logo: DiscordIcon,
                    },
                    {
                        title: <Trans>Join our Telegram</Trans>,
                        link: 'https://t.me/fireflyapp',
                        logo: TelegramIcon,
                    },
                ].map(({ title, link, logo }) => (
                    <LinkCard key={link} title={title} link={link} logo={logo} />
                ))}
            </div>

            <Subtitle>
                <Trans>Mask Network</Trans>
            </Subtitle>

            <div className="flex w-full flex-col gap-4">
                {[
                    {
                        title: <Trans>Follow @realMaskNetwork on X</Trans>,
                        link: 'https://x.com/intent/user?screen_name=realMaskNetwork',
                        logo: SmallXIcon,
                    },
                    {
                        title: <Trans>Visit mask.io</Trans>,
                        link: 'https://mask.io',
                        logo: MaskRoundIcon,
                    },
                    {
                        title: <Trans>Join our Discord</Trans>,
                        link: 'https://discord.com/invite/4SVXvj7',
                        logo: DiscordIcon,
                    },
                    {
                        title: <Trans>Join our Telegram</Trans>,
                        link: 'https://t.me/maskbook_group#telegram',
                        logo: TelegramIcon,
                    },
                ].map(({ title, link, logo }) => (
                    <LinkCard key={link} title={title} link={link} logo={logo} />
                ))}
            </div>
        </div>
    );
}
