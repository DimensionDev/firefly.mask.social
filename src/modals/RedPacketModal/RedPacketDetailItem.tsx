import { Trans } from '@lingui/macro';
import { useRouter } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { memo } from 'react';
import urlcat from 'urlcat';

import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { FireflyPlatform, NetworkPluginID, type SocialSource } from '@/constants/enum.js';
import { SITE_URL, SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { Image } from '@/esm/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { formatBalance } from '@/helpers/formatBalance.js';
import { getNetworkDescriptor } from '@/helpers/getNetworkDescriptor.js';
import { resolveSourceFromFireflyPlatform } from '@/helpers/resolveSource.js';
import { useChainContext } from '@/hooks/useChainContext.js';
import { RedpacketAccountItem } from '@/modals/RedpacketModal/RedPacketAccountItem.js';
import { RedpacketActionButton } from '@/modals/RedpacketModal/RedPacketActionButton.js';
import { FireflyRedPacketAPI } from '@/providers/red-packet/types.js';

interface HistoryInfo {
    rp_msg: string;
    redpacket_id: string;
    received_time?: string;
    token_decimal: number;
    total_amounts?: string;
    token_symbol: string;
    token_amounts?: string;
    token_logo: string;
    chain_id: number;
    creator?: string;
    claim_numbers?: string;
    total_numbers?: string;
    claim_amounts?: string;
    create_time?: number;
    redpacket_status?: FireflyRedPacketAPI.RedPacketStatus;
    ens_name?: string;
    claim_strategy?: FireflyRedPacketAPI.StrategyPayload[];
    share_from?: string;
    theme_id?: string;
    post_on?: Array<{
        platform: FireflyPlatform;
        postId: string;
        handle?: string;
    }>;
}

interface Props {
    history: HistoryInfo;
    isDetail?: boolean;
}

const PlatformButton = memo(function PlatformButton(props: {
    platform: FireflyPlatform;
    postId: string;
    className: string;
}) {
    const { platform, postId, className } = props;
    const source = resolveSourceFromFireflyPlatform(platform);
    if (!SORTED_SOCIAL_SOURCES.find((x) => x === source)) return null;

    return (
        <a
            href={urlcat(SITE_URL, `/post/${platform}/${postId}`)}
            target="_blank"
            className={className}
            rel="noreferrer noopener"
        >
            <SocialSourceIcon source={source as SocialSource} />
        </a>
    );
});

export const RedpacketDetailItem = memo<Props>(function RedpacketDetailItem({
    isDetail,

    history: {
        creator,
        ens_name,
        chain_id,
        post_on,
        claim_amounts,
        redpacket_status,
        redpacket_id,
        rp_msg,
        token_symbol,
        token_decimal,
        total_amounts,
        create_time,
        received_time,
        claim_numbers,
        total_numbers,
        token_logo,
        token_amounts,
    },
}) {
    const { history } = useRouter();
    const { account } = useChainContext();
    const networkDescriptor = getNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, chain_id);

    return (
        <div className="mb-3 flex w-full flex-col rounded-lg bg-white p-0">
            <section className="flex items-center justify-between">
                <div
                    className={`relative h-auto w-full rounded-lg bg-gradient-to-b from-blue-100 to-blue-50 p-3 max-md:p-8`}
                    style={{
                        background:
                            networkDescriptor?.backgroundGradient ??
                            'linear-gradient(180deg, rgba(98, 126, 234, 0.15) 0%, rgba(98, 126, 234, 0.05) 100%)',
                    }}
                >
                    <div
                        className="absolute bottom-0 left-[400px] z-0 h-[61px] w-[114px] opacity-20"
                        style={{
                            background: networkDescriptor
                                ? `url(${networkDescriptor.icon}) 0% 0% / 114px 114px no-repeat`
                                : undefined,
                        }}
                    />
                    <div className="flex justify-between">
                        <div>
                            <div className="flex w-full">
                                <div className="truncate text-[14px] font-bold text-lightTextMain">
                                    {!rp_msg ? <Trans>Best Wishes!</Trans> : rp_msg}
                                </div>
                            </div>
                            <div className="flex w-full text-[14px] leading-[18px]">
                                <div className="mr-1 truncate text-lightSecond">
                                    {create_time ? <Trans>Create time:</Trans> : <Trans>Received time:</Trans>}
                                </div>
                                <div
                                    className={classNames('truncate text-lightTextMain', {
                                        hidden: !redpacket_id,
                                    })}
                                >
                                    {create_time ? (
                                        <Trans>{dayjs(create_time).format('M/d/yyyy HH:mm')} (UTC+8)</Trans>
                                    ) : null}
                                    {received_time ? (
                                        <Trans>
                                            {dayjs(Number.parseInt(received_time, 10)).format('M/d/yyyy HH:mm')} (UTC+8)
                                        </Trans>
                                    ) : null}
                                </div>
                            </div>

                            {creator ? (
                                <div className="flex items-center text-[14px] leading-[18px]">
                                    <div className="mr-1 text-lightSecond">
                                        <Trans>Creator:</Trans>
                                    </div>
                                    <RedpacketAccountItem
                                        address={creator}
                                        ens={ens_name}
                                        chainId={chain_id}
                                        isDarkFont
                                    />
                                </div>
                            ) : null}
                            {post_on?.length && isDetail ? (
                                <div className="flex items-center text-[14px] leading-[18px]">
                                    <div className="mr-1 text-lightSecond">
                                        <Trans>Post on</Trans>
                                    </div>
                                    <div className="flex text-lightTextMain">
                                        {post_on
                                            ?.sort((a, b) => {
                                                if (a.platform === b.platform) return 0;
                                                if (a.platform === FireflyPlatform.Lens) return 1;
                                                if (b.platform === FireflyPlatform.Lens) return -1;
                                                return 0;
                                            })
                                            .map((x) => (
                                                <PlatformButton
                                                    key={x.postId}
                                                    platform={x.platform}
                                                    postId={x.postId}
                                                    className="mr-2"
                                                />
                                            ))}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                        {redpacket_status ? (
                            <RedpacketActionButton
                                redpacketStatus={redpacket_status}
                                rpid={redpacket_id}
                                account={account}
                                chainId={chain_id}
                            />
                        ) : null}
                    </div>

                    <section className="mt-[15px] flex w-full flex-nowrap items-center justify-between">
                        {claim_numbers || total_numbers ? (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div className="flex items-center gap-x-[2px] text-[14px] text-lightTextMain">
                                    <Trans>
                                        <span className="text-lightSecond">Claimed: </span>
                                        <span>
                                            {claim_numbers}/{total_numbers}
                                        </span>{' '}
                                        <span>
                                            {formatBalance(claim_amounts, token_decimal, {
                                                significant: 2,
                                                isPrecise: true,
                                            })}
                                            /
                                            {formatBalance(total_amounts, token_decimal ?? 18, {
                                                significant: 2,
                                                isPrecise: true,
                                            })}
                                        </span>{' '}
                                        <span>{token_symbol}</span>
                                    </Trans>
                                </div>
                                {token_logo ? (
                                    <Image
                                        className="ml-[6px] rounded-full"
                                        alt={token_logo}
                                        src={token_logo}
                                        width={18}
                                        height={18}
                                    />
                                ) : null}
                            </div>
                        ) : null}
                        {token_amounts ? (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div className="flex items-center gap-x-[2px] text-[14px] text-lightTextMain">
                                    <span className="text-lightSecond">
                                        <Trans>Received</Trans>
                                    </span>
                                    {formatBalance(token_amounts, token_decimal, {
                                        significant: 2,
                                        isPrecise: true,
                                    })}{' '}
                                    {token_symbol}
                                </div>
                                {token_logo ? (
                                    <Image
                                        className="ml-[6px] rounded-full"
                                        alt={token_logo}
                                        src={token_logo}
                                        width={18}
                                        height={18}
                                    />
                                ) : null}
                            </div>
                        ) : null}
                        {!isDetail ? (
                            <button
                                className={
                                    'z-10 flex cursor-pointer items-center justify-center bg-none p-0 text-xs font-bold text-lightTextMain'
                                }
                                onClick={() => {
                                    history.push(
                                        urlcat('/detail', {
                                            rpid: redpacket_id,
                                        }),
                                    );
                                }}
                            >
                                <Trans>More details</Trans>
                            </button>
                        ) : null}
                    </section>
                </div>
            </section>
        </div>
    );
});
