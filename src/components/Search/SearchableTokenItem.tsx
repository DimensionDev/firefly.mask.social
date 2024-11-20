import { Trans } from '@lingui/macro';

import PriceArrow from '@/assets/price-arrow.svg';
import { Image } from '@/components/Image.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { formatPrice, renderShrankPrice } from '@/helpers/formatPrice.js';
import { resolveTokenPageUrl } from '@/helpers/resolveTokenPageUrl.js';
import type { TokenWithMarket } from '@/services/searchTokens.js';

interface SearchableTokenItemProps {
    token: TokenWithMarket;
}

export function SearchableTokenItem({ token }: SearchableTokenItemProps) {
    const priceChange = token.market?.price_change_percentage_24h ?? 0;

    return (
        <Link
            className="flex items-center gap-x-2 border-b border-line p-3 hover:bg-bg"
            href={resolveTokenPageUrl(token.symbol)}
        >
            <Image
                className="h-11 w-11 shrink-0 rounded-full"
                width={44}
                height={44}
                src={token.large}
                alt={token.symbol}
            />
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-x-1 text-medium font-bold text-secondary">
                    <span className="truncate leading-6 text-lightMain">{token.name}</span>
                    <span>{token.symbol}</span>
                    {token.market_cap_rank ? (
                        <span className="whitespace-nowrap rounded bg-lightBg px-1 py-0.5 text-[10px]">
                            <Trans>Rank #{token.market_cap_rank}</Trans>
                        </span>
                    ) : null}
                </div>
                <div className="text-lg leading-[22px] text-lightMain">
                    ${renderShrankPrice(formatPrice(token.market?.current_price) ?? '')}
                </div>
            </div>
            <data
                className={classNames(
                    'flex h-8 shrink-0 items-center justify-center gap-x-1 rounded px-1 text-medium font-bold text-white max-md:h-auto max-md:w-auto max-md:min-w-[60px] max-md:px-2 max-md:py-1 max-md:text-[10px] max-md:leading-[12px]',
                    {
                        'bg-success': priceChange >= 0,
                        'bg-danger': priceChange < 0,
                    },
                )}
            >
                {priceChange !== 0 ? (
                    <PriceArrow
                        className={classNames(
                            'h-5 w-5 max-md:h-[10px] max-md:w-[10px]',
                            priceChange < 0 ? 'rotate-180' : '',
                        )}
                    />
                ) : null}
                {priceChange.toFixed(1).replace('-', '')}%
            </data>
        </Link>
    );
}
