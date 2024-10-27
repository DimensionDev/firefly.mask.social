import { Trans } from '@lingui/macro';
import type { PropsWithChildren } from 'react';

import { ChannelProvider } from '@/components/Channel/ChannelProvider.js';
import { Info } from '@/components/Channel/Info.js';
import { Title } from '@/components/Channel/Title.js';
import { NoSSR } from '@/components/NoSSR.js';
import { ChannelTabType } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveChannelUrl } from '@/helpers/resolveChannelUrl.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

export async function ChannelLayout({
    channel,
    type,
    id,
    children,
}: PropsWithChildren<{ channel: Channel; type: ChannelTabType; id: string }>) {
    return (
        <>
            <Title channel={channel} />
            <Info channel={channel} source={channel.source} isChannelPage />
            <hr className="divider w-full border-line" />
            <nav className="scrollable-tab flex justify-evenly border-b border-line px-5">
                {[
                    {
                        type: ChannelTabType.Recent,
                        title: <Trans>Recent</Trans>,
                    },
                    {
                        type: ChannelTabType.Trending,
                        title: <Trans>Trending</Trans>,
                    },
                ].map(({ type: x, title }) => (
                    <div key={x} className="flex flex-col">
                        <Link
                            className={classNames(
                                'flex h-[55px] items-center px-[14px] font-extrabold transition-all',
                                x === type ? 'text-main' : 'text-third hover:text-main',
                            )}
                            href={resolveChannelUrl(id, x)}
                        >
                            {title}
                        </Link>
                        <span
                            className={classNames(
                                'h-1 w-full rounded-full bg-fireflyBrand transition-all',
                                x !== type ? 'hidden' : '',
                            )}
                        />
                    </div>
                ))}
            </nav>
            <NoSSR>
                <ChannelProvider channel={channel}>{children}</ChannelProvider>
            </NoSSR>
        </>
    );
}
