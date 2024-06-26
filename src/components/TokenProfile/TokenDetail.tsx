import { t, Trans } from '@lingui/macro';
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base';
import { useNetworkDescriptor } from '@masknet/web3-hooks-base';
import { formatEthereumAddress } from '@masknet/web3-shared-evm';
import { first, last } from 'lodash-es';
import { notFound } from 'next/navigation.js';
import { type HTMLProps, memo, type ReactNode, useMemo, useRef, useState } from 'react';

import DiscordRound from '@/assets/DiscordRound.svg';
import FacebookColored from '@/assets/FacebookColored.svg';
import GitHub from '@/assets/GitHub.svg';
import Instagram from '@/assets/Instagram.svg';
import Medium from '@/assets/Medium.svg';
import PriceArrow from '@/assets/price-arrow.svg';
import QuestionIcon from '@/assets/question.svg';
import RedditRound from '@/assets/RedditRound.svg';
import TelegramRound from '@/assets/TelegramRound.svg';
import TwitterXRound from '@/assets/TwitterXRound.svg';
import YouTube from '@/assets/YouTube.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { CopyButton } from '@/components/CopyButton.js';
import { Image } from '@/components/Image.js';
import { Loading } from '@/components/Loading.js';
import { ContractList } from '@/components/TokenProfile/ContractList.js';
import { Tooltip } from '@/components/Tooltip.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { formatNumber } from '@/helpers/formatNumber.js';
import { useCoinPriceStats } from '@/hooks/useCoinPriceStats.js';
import { useCoinTrending } from '@/hooks/useCoinTrending.js';
import type { Dimension } from '@/hooks/useLineChart.js';
import { usePriceLineChart } from '@/hooks/usePriceLineChart.js';
import { useTokenInfo } from '@/hooks/useTokenInfo.js';
import { useTokenPrice } from '@/hooks/useTokenPrice.js';

interface InfoRowProps {
    title: string;
    description?: ReactNode;
    value?: string | number;
    amount?: string | number;
    extra?: ReactNode;
}

function InfoRow({ title, description, amount, value, extra }: InfoRowProps) {
    return (
        <div className="flex items-center text-[15px]">
            <span color="text-second">{title}</span>
            {description ? (
                <Tooltip placement="top" content={description}>
                    <QuestionIcon className="ml-1" width={14} height={14} />
                </Tooltip>
            ) : null}
            {extra ? (
                <div className="ml-auto">{extra}</div>
            ) : (
                <div className="ml-auto">
                    {value !== undefined ? `$${formatNumber(+value)}` : formatNumber(amount) ?? '-'}
                </div>
            )}
        </div>
    );
}

interface Props extends HTMLProps<HTMLDivElement> {
    symbol: string;
}

const dimension: Dimension = {
    top: 32,
    right: 32,
    bottom: 32,
    left: 32,
    width: 543,
    height: 175,
};

const brands: Record<string, React.ReactNode> = {
    discord: <DiscordRound width={16} height={16} />,
    facebook: <FacebookColored width={16} height={16} />,
    github: <GitHub width={16} height={16} />,
    instagram: <Instagram width={16} height={16} />,
    medium: <Medium width={16} height={16} />,
    reddit: <RedditRound width={16} height={16} />,
    telegram: <TelegramRound width={16} height={16} />,
    twitter: <TwitterXRound width={16} height={16} />,
    youtube: <YouTube width={16} height={16} />,
    other: null,
};

function getHost(url: string) {
    try {
        return new URL(url).host;
    } catch {
        return url;
    }
}

export const TokenDetail = memo<Props>(function TokenDetail({ symbol, children, ...rest }) {
    const chartRef = useRef<SVGSVGElement>(null);
    const { data: token, isLoading } = useTokenInfo(symbol);
    const { data: price } = useTokenPrice(token?.id);
    const { data: trending } = useCoinTrending(token?.id);

    const ranges = [
        { label: t`24h`, days: 1 },
        { label: t`7d`, days: 7 },
        { label: t`1m`, days: 30 },
        { label: '1y', days: 365 },
        { label: 'Max', days: undefined },
    ] as const;

    const [days, setDays] = useState<number | undefined>(ranges[0].days);
    const { data: priceStats = EMPTY_LIST, isPending } = useCoinPriceStats(token?.id, days);
    const isUp = useMemo(() => {
        const startPrice = first(priceStats)?.value ?? 0;
        const endPrice = last(priceStats)?.value ?? 0;
        return endPrice > startPrice;
    }, [priceStats]);

    usePriceLineChart(chartRef, priceStats, dimension, `price-chart-${symbol}`, { color: 'currentColor' });
    const { market, coin, contracts } = trending ?? {};
    const chain = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, first(contracts)?.chainId);

    if (isLoading) {
        return <Loading />;
    }

    if (!token) {
        return notFound();
    }

    return (
        <div {...rest} className={classNames('flex flex-col gap-1.5 px-6 py-3', rest.className)}>
            <div className="flex items-center gap-2.5 text-second">
                <Image
                    className="overflow-hidden rounded-full"
                    src={token.logoURL}
                    alt={token.name}
                    width={40}
                    height={40}
                />
                <strong className="text-lg font-bold uppercase text-main">{token.symbol}</strong>
                <span className="font-inter text-[15px] font-bold">{token.name}</span>
            </div>
            <div className="line-height-[22px] flex items-center gap-1 text-[15px]">
                <Trans>
                    <span className="text-secondary">Price</span>
                    <strong className="font-bold">${formatNumber(price) ?? '-'}</strong>
                    <PriceArrow
                        width={16}
                        height={16}
                        className={classNames(isUp ? 'text-success' : 'rotate-180 text-fail')}
                    />
                    {market?.price_change_percentage_24h_in_currency !== undefined ? (
                        <span className={isUp ? 'text-success' : 'text-fail'}>
                            {market.price_change_percentage_24h_in_currency.toFixed(2)}%
                        </span>
                    ) : null}
                </Trans>
            </div>
            <div className="line-height-[22px] flex items-center gap-1">
                <Trans>
                    <span className="text-[15px] text-secondary">M.Capital</span>
                    <strong className="text-[15px] font-bold">
                        {market?.market_cap ? `$${formatNumber(market.market_cap)}` : '-'}
                    </strong>
                    <span className="inline-flex h-[14px] items-center rounded bg-[#8E96FF] px-1 py-0.5 text-[10px] text-white">
                        Rank #{token.rank}
                    </span>
                </Trans>
            </div>
            <div
                className={classNames(
                    'flex h-[175px] items-center justify-center overflow-auto',
                    isPending ? 'animate-pulse' : null,
                )}
            >
                {isPending ? (
                    <div className="mx-2 h-40 flex-grow rounded-lg bg-gray-100" />
                ) : (
                    <svg
                        ref={chartRef}
                        width="100%"
                        height={175}
                        viewBox="0 0 543 175"
                        className={isUp ? 'text-success' : 'text-fail'}
                    />
                )}
            </div>

            <div className="mt-4 flex gap-2.5 rounded-[28px] border border-line bg-input p-1">
                {ranges.map((range) => (
                    <ClickableButton
                        className={classNames(
                            'box-border block h-[34px] flex-grow px-3 py-2 text-sm text-main',
                            days === range.days
                                ? 'rounded-[18px] bg-primaryBottom font-bold shadow-[0px_2px_5px_1px_rgba(24,24,24,0.05)]'
                                : 'bg-transparent',
                        )}
                        key={range.label}
                        onClick={() => setDays(range.days)}
                    >
                        {range.label}
                    </ClickableButton>
                ))}
            </div>

            <div className="mt-3 py-3">
                <h2 className="font-inter font-bold text-main">{t`Statistic`}</h2>
                <div className="mt-3 flex flex-col gap-3">
                    <InfoRow
                        title={t`Market Capital`}
                        description={
                            <Trans>
                                <div>Market Cap = Current Price x Circulating Supply</div>
                                <div className="mt-2">
                                    Refers to the total market value of a cryptocurrency’s circulating supply. It is
                                    similar to the stock market’s measurement of multiplying price per share by shares
                                    readily available in the market (not held & locked by insiders, governments)
                                </div>
                            </Trans>
                        }
                        value={market?.market_cap}
                    />
                    <InfoRow
                        title={t`Fully Diluted Valuation`}
                        description={
                            <Trans>
                                <div>Fully Diluted Valuation (FDV) = Current Price x Total Supply</div>
                                <div className="mt-2">
                                    Fully Diluted Valuation (FDV) is the theoretical market capitalization of a coin if
                                    the entirety of its supply is in circulation, based on its current market price. The
                                    FDV value is theoretical as increasing the circulating supply of a coin may impact
                                    its market price. Also depending on the tokenomics, emission schedule or lock-up
                                    period of a coin&apos;s supply, it may take a significant time before its entire
                                    supply is released into circulation.
                                </div>
                            </Trans>
                        }
                        value={market?.fully_diluted_valuation}
                    />
                    <InfoRow
                        title={t`Market Capital / FDV`}
                        description={
                            <Trans>
                                <div>
                                    The proportion of current market capitalization compares to market capitalization
                                    when meeting max supply.
                                </div>
                                <div className="mt-2">
                                    The closer the Mkt Cap/FDV to 1, the closer the current market capitalization to its
                                    fully diluted valuation and vice versa.
                                </div>
                            </Trans>
                        }
                        amount={market?.market_cap_fdv_ratio}
                    />
                    <InfoRow
                        title={t`24 Hour Trading Vol`}
                        description="A measure of a cryptocurrency trading volume across all tracked platforms in the last 24 hours. This is tracked on a rolling 24-hour basis with no open/closing times."
                        value={market?.total_volume}
                    />
                    <InfoRow
                        title={t`Circulating Supply`}
                        description="The amount of coins that are circulating in the market and are tradeable by the public. It is comparable to looking at shares readily available in the market (not held & locked by insiders, governments)."
                        amount={market?.circulating_supply}
                    />
                    <InfoRow
                        title={t`Total Supply`}
                        description={
                            <Trans>
                                <div>
                                    Copy The amount of coins that have already been created, minus any coins that have
                                    been burned (removed from circulation). It is comparable to outstanding shares in
                                    the stock market.
                                </div>
                                <div className="mt-2">Total Supply = Onchain supply - burned tokens</div>
                            </Trans>
                        }
                        amount={market?.total_supply}
                    />
                    <InfoRow
                        title={t`Max Supply`}
                        description={
                            <Trans>
                                <div>
                                    The maximum number of coins coded to exist in the lifetime of the cryptocurrency. It
                                    is comparable to the maximum number of issuable shares in the stock market.
                                </div>
                                <div className="mt-2">Max Supply = Theoretical maximum as coded</div>
                            </Trans>
                        }
                        amount={market?.max_supply}
                    />
                </div>
                <h2 className="mt-3 font-inter font-bold text-main">{t`Info`}</h2>
                <div className="mt-3 flex flex-col gap-3">
                    {contracts?.length ? (
                        <InfoRow
                            title={t`Contract Address`}
                            extra={
                                <div className="flex items-center gap-1">
                                    {chain ? (
                                        <Image
                                            src={chain.icon}
                                            className="flex-shrink-0"
                                            alt={chain.name}
                                            width={16}
                                            height={16}
                                        />
                                    ) : null}
                                    <span className="text-[15px] font-bold text-main">
                                        {formatEthereumAddress(contracts[0].address, 4)}
                                    </span>
                                    <CopyButton value={contracts[0].address} />
                                    <ContractList contracts={contracts} />
                                </div>
                            }
                        />
                    ) : null}
                    {coin?.home_urls?.length ? (
                        <InfoRow
                            title={t`Website`}
                            extra={
                                <div>
                                    {coin.home_urls.map((url) => (
                                        <Link
                                            key={url}
                                            href={url}
                                            target="_blank"
                                            className="text-link hover:underline"
                                        >
                                            {getHost(url)}
                                        </Link>
                                    ))}
                                </div>
                            }
                        />
                    ) : null}
                    {coin?.community_urls?.length ? (
                        <InfoRow
                            title={t`Community`}
                            extra={
                                <div className="flex gap-2">
                                    {coin.community_urls.map((x) => (
                                        <Link key={x.link} href={x.link} target="_blank">
                                            {brands[x.type]}
                                        </Link>
                                    ))}
                                </div>
                            }
                        />
                    ) : null}
                </div>
            </div>
        </div>
    );
});
