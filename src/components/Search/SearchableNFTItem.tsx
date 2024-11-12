import { Trans } from '@lingui/macro';
import { ChainId } from '@masknet/web3-shared-evm';

import { Image } from '@/components/Image.js';
import { ChainIcon } from '@/components/NFTDetail/ChainIcon.js';
import { Link } from '@/esm/Link.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';
import { resolveNftUrl } from '@/helpers/resolveNftUrl.js';
import type { SearchableNFT } from '@/providers/types/Firefly.js';

interface NFTItemProps {
    nft: SearchableNFT;
}

export function SearchableNFTItem({ nft }: NFTItemProps) {
    return (
        <Link
            className="flex items-center gap-x-2.5 border-b border-line p-3 hover:bg-bg"
            href={resolveNftUrl(ChainId.Mainnet, nft.contract_address)}
        >
            <Image
                className="h-[50px] w-[50px] shrink-0 rounded-lg object-cover"
                width={50}
                height={50}
                alt={nft.description}
                src={nft.logo_url}
            />
            <div>
                <div className="flex items-center gap-x-1">
                    <span className="text-lg font-bold leading-6 text-lightMain">{nft.name}</span>
                    <ChainIcon size={18} className="shrink-0" chainId={ChainId.Mainnet} />
                </div>
                <div className="mt-1 flex items-center gap-x-2">
                    <span className="text-medium font-bold leading-[22px] text-lightMain">
                        <Trans>
                            {nFormatter(nft.items_total || 0)}
                            <span className="font-normal text-lightSecond"> Items</span>
                        </Trans>
                    </span>
                    {nft.floor_price && nft.price_symbol ? (
                        <>
                            <span className="text-lightSecond">·</span>
                            <span className="text-medium font-bold leading-[22px] text-lightMain">
                                <Trans>
                                    {nft.floor_price}
                                    {nft.price_symbol}
                                    <span className="font-normal text-lightSecond"> Floor</span>
                                </Trans>
                            </span>
                        </>
                    ) : null}
                </div>
            </div>
        </Link>
    );
}
