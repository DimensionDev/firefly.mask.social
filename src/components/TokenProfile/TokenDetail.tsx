import { t, Trans } from '@lingui/macro';
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base';
import { useNetworkDescriptor } from '@masknet/web3-hooks-base';
import { formatEthereumAddress } from '@masknet/web3-shared-evm';
import { first, isNumber } from 'lodash-es';
import { notFound } from 'next/navigation.js';
import { type HTMLProps, memo, type ReactNode, useRef, useState } from 'react';

import PriceArrow from '@/assets/price-arrow.svg';
import QuestionIcon from '@/assets/question.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { CopyButton } from '@/components/CopyButton.js';
import { Image } from '@/components/Image.js';
import { Loading } from '@/components/Loading.js';
import { CommunityLink } from '@/components/TokenProfile/CommunityLink.js';
import { ContractList } from '@/components/TokenProfile/ContractList.js';
import { TokenSecurityBar } from '@/components/TokenProfile/TokenSecurity.js';
import { Tooltip } from '@/components/Tooltip.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { formatPrice, renderShrankPrice } from '@/helpers/formatPrice.js';
import { useCoinPrice24hStats, useCoinPriceStats } from '@/hooks/useCoinPriceStats.js';
import { useCoinTrending } from '@/hooks/useCoinTrending.js';
import type { Dimension } from '@/hooks/useLineChart.js';
import { usePriceLineChart } from '@/hooks/usePriceLineChart.js';
import { useTokenInfo } from '@/hooks/useTokenInfo.js';
import { useTokenPrice } from '@/hooks/useTokenPrice.js';
import { useTokenSecurity } from '@/hooks/useTokenSecurity.js';
import type { Contract } from '@/providers/types/Trending.js';

interface InfoRowProps {
    title: string;
    description?: ReactNode;
    value?: string | number;
    amount?: string | number;
    asInfinite?: boolean;
    extra?: ReactNode;
}

function InfoRow({ title, description, amount, asInfinite, value, extra }: InfoRowProps) {
    return (
        <div className="flex items-center text-[15px]">
            <span className="text-second">{title}</span>
            {description ? (
                <Tooltip placement="top" content={description}>
                    <QuestionIcon className="ml-1 cursor-pointer text-second" width={14} height={14} />
                </Tooltip>
            ) : null}
            {extra ? (
                <div className="ml-auto">{extra}</div>
            ) : (
                <div className="ml-auto font-inter text-[15px] font-bold text-main">
                    {asInfinite ? '∞' : isNumber(value) ? `$${formatPrice(+value)}` : formatPrice(amount) ?? '-'}
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

function getHost(url: string) {
    try {
        return new URL(url).host;
    } catch {
        return url;
    }
}

function formatContractAddress(contract: Contract) {
    if (contract.runtime === 'ethereum') formatEthereumAddress(contract.address, 4);
    return `${contract.address.slice(0, 6)}...${contract.address.slice(-4)}`;
}

export const TokenDetail = memo<Props>(function TokenDetail({ symbol, children, ...rest }) {
    const chartRef = useRef<SVGSVGElement>(null);
    const { data: token, isLoading } = useTokenInfo(symbol);
    const { data: price } = useTokenPrice(token?.id);
    const { data: trending } = useCoinTrending(token?.id);
    const { market, coin, contracts } = trending ?? {};
    const contract = first(contracts);
    const { data: security } = useTokenSecurity(contract?.chainId, contract?.address);

    const ranges = [
        { label: t`24h`, days: 1 },
        { label: t`7d`, days: 7 },
        { label: t`1m`, days: 30 },
        { label: t`1y`, days: 365 },
        { label: t`Max`, days: undefined },
    ] as const;

    const [days, setDays] = useState<number | undefined>(ranges[0].days);
    const { data: priceStats = EMPTY_LIST, isPending } = useCoinPriceStats(token?.id, days);
    const { isUp } = useCoinPrice24hStats(token?.id);

    usePriceLineChart(chartRef, priceStats, dimension, `price-chart-${symbol}`, { color: 'currentColor' });
    const chain = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, first(contracts)?.chainId);

    if (isLoading) {
        return <Loading />;
    }

    if (!token) {
        return notFound();
    }

    return (
        <div {...rest} className={classNames('flex flex-col gap-1.5 px-3 py-3 sm:px-6', rest.className)}>
            <div className="flex items-center gap-1 text-second">
                <Image
                    className="overflow-hidden rounded-full"
                    src={token.logoURL}
                    alt={token.name}
                    width={24}
                    height={24}
                />
                <strong className="ml-0.5 text-[15px] font-bold text-main">{token.name}</strong>
                <span className="font-inter text-[15px] font-bold uppercase">{token.symbol}</span>
                <span className="inline-flex h-[14px] items-center rounded bg-[#8E96FF] px-1 py-0.5 text-[10px] text-white">
                    <Trans>Rank #{token.rank}</Trans>
                </span>
            </div>
            <div className="line-height-[22px] flex items-center gap-1">
                <strong className="text-2xl font-bold">${renderShrankPrice(formatPrice(price) ?? '-')}</strong>
                <PriceArrow
                    width={20}
                    height={20}
                    className={classNames(isUp ? 'text-success' : 'rotate-180 text-fail')}
                />
                {market?.price_change_percentage_24h_in_currency !== undefined ? (
                    <span className={isUp ? 'text-[15px] text-success' : 'text-[15px] text-fail'}>
                        {market.price_change_percentage_24h_in_currency.toFixed(2)}%
                    </span>
                ) : null}
            </div>
            <TokenSecurityBar tokenSecurity={security} />
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
                        title={t`Market Cap`}
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
                        title={t`Market Cap / FDV`}
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
                        description={t`A measure of a cryptocurrency trading volume across all tracked platforms in the last 24 hours. This is tracked on a rolling 24-hour basis with no open/closing times.`}
                        value={market?.total_volume}
                    />
                    <InfoRow
                        title={t`Circulating Supply`}
                        description={t`The amount of coins that are circulating in the market and are tradeable by the public. It is comparable to looking at shares readily available in the market (not held & locked by insiders, governments).`}
                        amount={market?.circulating_supply}
                    />
                    <InfoRow
                        title={t`Total Supply`}
                        description={
                            <Trans>
                                <div>
                                    The amount of coins that have already been created, minus any coins that have been
                                    burned (removed from circulation). It is comparable to outstanding shares in the
                                    stock market.
                                </div>
                                <div className="mt-2">Total Supply = Onchain supply - burned tokens</div>
                            </Trans>
                        }
                        amount={market?.total_supply}
                        asInfinite={!market?.total_supply}
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
                        asInfinite={!market?.max_supply}
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
                                    <Tooltip content={contracts[0].address} placement="top">
                                        <span className="overflow-hidden text-ellipsis text-[15px] font-bold text-main">
                                            {formatContractAddress(contracts[0])}
                                        </span>
                                    </Tooltip>
                                    <CopyButton value={contracts[0].address} />
                                    {contracts.length > 1 ? <ContractList contracts={contracts} /> : null}
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
                                        <CommunityLink key={x.link} link={x} />
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
