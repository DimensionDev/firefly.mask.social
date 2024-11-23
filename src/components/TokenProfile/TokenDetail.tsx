'use client';

import { t, Trans } from '@lingui/macro';
import { first, isNumber } from 'lodash-es';
import { notFound } from 'next/navigation.js';
import { type HTMLProps, memo, type ReactNode } from 'react';

import QuestionIcon from '@/assets/question.svg';
import { CopyTextButton } from '@/components/CopyTextButton.js';
import { Image } from '@/components/Image.js';
import { Loading } from '@/components/Loading.js';
import { CommunityLink } from '@/components/TokenProfile/CommunityLink.js';
import { ContractList } from '@/components/TokenProfile/ContractList.js';
import { TokenMarketData } from '@/components/TokenProfile/TokenMarketData.js';
import { Tooltip } from '@/components/Tooltip.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { formatEthereumAddress } from '@/helpers/formatAddress.js';
import { formatPrice } from '@/helpers/formatPrice.js';
import { getChainInfo } from '@/helpers/getChainInfo.js';
import { useCoinTrending } from '@/hooks/useCoinTrending.js';
import { useTokenInfo } from '@/hooks/useTokenInfo.js';
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
        <div className="flex items-center text-medium">
            <span className="text-second">{title}</span>
            {description ? (
                <Tooltip placement="top" content={description}>
                    <QuestionIcon className="ml-1 cursor-pointer text-second" width={14} height={14} />
                </Tooltip>
            ) : null}
            {extra ? (
                <div className="ml-auto">{extra}</div>
            ) : (
                <div className="ml-auto font-inter text-medium font-bold text-main">
                    {asInfinite ? '∞' : isNumber(value) ? `$${formatPrice(+value)}` : (formatPrice(amount) ?? '-')}
                </div>
            )}
        </div>
    );
}

interface Props extends HTMLProps<HTMLDivElement> {
    symbol: string;
}

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
    const { data: token, isLoading } = useTokenInfo(symbol);
    const { data: trending } = useCoinTrending(token?.id);
    const { market, coin, contracts } = trending ?? {};

    const firstContract = first(contracts);
    const chain = getChainInfo(firstContract?.runtime, firstContract?.chainId);

    if (isLoading) {
        return <Loading />;
    }

    if (!token) {
        notFound();
    }

    return (
        <>
            <div {...rest} className={classNames('flex flex-col gap-1.5 px-3 py-3 sm:px-6', rest.className)}>
                <TokenMarketData token={token} />

                <div className="mt-3 py-3">
                    <h2 className="font-inter font-bold text-main">
                        <Trans>Statistic</Trans>
                    </h2>
                    <div className="mt-3 flex flex-col gap-3">
                        <InfoRow
                            title={t`Market Cap`}
                            description={
                                <Trans>
                                    <div>Market Cap = Current Price x Circulating Supply</div>
                                    <div className="mt-2">
                                        Refers to the total market value of a cryptocurrency’s circulating supply. It is
                                        similar to the stock market’s measurement of multiplying price per share by
                                        shares readily available in the market (not held & locked by insiders,
                                        governments)
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
                                        Fully Diluted Valuation (FDV) is the theoretical market capitalization of a coin
                                        if the entirety of its supply is in circulation, based on its current market
                                        price. The FDV value is theoretical as increasing the circulating supply of a
                                        coin may impact its market price. Also depending on the tokenomics, emission
                                        schedule or lock-up period of a coin&apos;s supply, it may take a significant
                                        time before its entire supply is released into circulation.
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
                                        The proportion of current market capitalization compares to market
                                        capitalization when meeting max supply.
                                    </div>
                                    <div className="mt-2">
                                        The closer the Mkt Cap/FDV to 1, the closer the current market capitalization to
                                        its fully diluted valuation and vice versa.
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
                                        The amount of coins that have already been created, minus any coins that have
                                        been burned (removed from circulation). It is comparable to outstanding shares
                                        in the stock market.
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
                                        The maximum number of coins coded to exist in the lifetime of the
                                        cryptocurrency. It is comparable to the maximum number of issuable shares in the
                                        stock market.
                                    </div>
                                    <div className="mt-2">Max Supply = Theoretical maximum as coded</div>
                                </Trans>
                            }
                            amount={market?.max_supply}
                            asInfinite={!market?.max_supply}
                        />
                    </div>
                    <h2 className="mt-3 font-inter font-bold text-main">
                        <Trans>Info</Trans>
                    </h2>
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
                                            <span className="overflow-hidden text-ellipsis text-medium font-bold text-main">
                                                {formatContractAddress(contracts[0])}
                                            </span>
                                        </Tooltip>
                                        <CopyTextButton text={contracts[0].address} />
                                        {contracts.length > 1 ? <ContractList contracts={contracts} /> : null}
                                    </div>
                                }
                            />
                        ) : null}
                        {coin?.home_urls?.length ? (
                            <InfoRow
                                title={t`Website`}
                                extra={
                                    <div className="flex gap-1">
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
        </>
    );
});
