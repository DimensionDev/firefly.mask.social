import { Trans } from '@lingui/macro';
import { notFound } from 'next/navigation.js';
import type { PropsWithChildren } from 'react';

import { ChannelInfo } from '@/components/Channel/ChannelInfo.js';
import { ChannelProvider } from '@/components/Channel/ChannelProvider.js';
import { Title } from '@/components/Channel/Title.js';
import { NoSSR } from '@/components/NoSSR.js';
import { ChannelTabType, type SocialSourceInURL, Source } from '@/constants/enum.js';
import { CHANNEL_TAB_TYPE } from '@/constants/index.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { createMetadataChannel } from '@/helpers/createMetadataChannel.js';
import { isSocialSourceInUrl } from '@/helpers/isSocialSource.js';
import { resolveChannelUrl } from '@/helpers/resolveChannelUrl.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';
import { setupLocaleForSSR } from '@/i18n/index.js';

export const revalidate = 60;

type Props = PropsWithChildren<{
    params: {
        id: string;
        type: ChannelTabType;
        source: SocialSourceInURL;
    };
}>;

export async function generateMetadata({ params }: Props) {
    return createMetadataChannel(params.source, params.id);
}

export default async function Layout({ params, children }: Props) {
    const source = isSocialSourceInUrl(params.source) ? resolveSocialSource(params.source) : Source.Farcaster;
    const provider = resolveSocialMediaProvider(source);
    const channel = await provider.getChannelById(params.id).catch(() => null);

    if (!channel) notFound();

    setupLocaleForSSR();

    const id = params.id;
    const type = params.type;

    const tabs = CHANNEL_TAB_TYPE[source];

    return (
        <>
            <Title channel={channel} />
            <ChannelInfo channel={channel} source={channel.source} isChannelPage />
            <hr className="divider w-full border-line" />
            {tabs.length > 1 ? (
                <nav className="scrollable-tab flex justify-evenly border-b border-line px-5">
                    {tabs.map((x) => (
                        <div key={x} className="flex flex-col">
                            <Link
                                className={classNames(
                                    'flex h-[55px] items-center px-[14px] font-extrabold transition-all',
                                    x === type ? 'text-main' : 'text-third hover:text-main',
                                )}
                                href={resolveChannelUrl(id, x, channel.source)}
                            >
                                {
                                    {
                                        [ChannelTabType.Recent]: <Trans>Recent</Trans>,
                                        [ChannelTabType.Trending]: <Trans>Trending</Trans>,
                                    }[x]
                                }
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
            ) : null}
            <NoSSR>
                <ChannelProvider channel={channel}>{children}</ChannelProvider>
            </NoSSR>
        </>
    );
}
