import { Trans } from '@lingui/macro';
import { notFound } from 'next/navigation.js';
import type { PropsWithChildren } from 'react';

import { ChannelInfo } from '@/components/Channel/ChannelInfo.js';
import { ChannelProvider } from '@/components/Channel/ChannelProvider.js';
import { Title } from '@/components/Channel/Title.js';
import { NoSSR } from '@/components/NoSSR.js';
import { ChannelTabType, Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { createMetadataChannel } from '@/helpers/createMetadataChannel.js';
import { resolveChannelUrl } from '@/helpers/resolveChannelUrl.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { setupLocaleForSSR } from '@/i18n/index.js';

export const revalidate = 60;

type Props = PropsWithChildren<{
    params: {
        id: string;
        type: ChannelTabType;
    };
}>;

export async function generateMetadata({ params }: Props) {
    return createMetadataChannel(params.id);
}

export default async function Layout({ params, children }: Props) {
    const source = Source.Farcaster; // TODO: channel only farcaster
    const provider = resolveSocialMediaProvider(source);
    const channel = await provider.getChannelById(params.id).catch(() => null);

    if (!channel) notFound();

    setupLocaleForSSR();

    const id = params.id;
    const type = params.type;

    return (
        <>
            <Title channel={channel} />
            <ChannelInfo channel={channel} source={channel.source} isChannelPage />
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
