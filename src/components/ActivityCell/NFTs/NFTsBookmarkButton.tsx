import { ChainId } from '@masknet/web3-shared-evm';

import BookmarkIcon from '@/assets/bookmark.svg';
import LoadingIcon from '@/assets/loading.svg';
import { BookmarkButton } from '@/components/NFTs/BookmarkButton.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveNFTId } from '@/helpers/resolveNFTIdFromAsset.js';

interface Props {
    address: string;
    tokenId: string;
    chainId: ChainId;
    ownerAddress: string;
}

export function NFTsBookmarkButton({ address, tokenId, chainId, ownerAddress }: Props) {
    return (
        <BookmarkButton nftId={resolveNFTId(chainId, address, tokenId)} ownerAddress={ownerAddress}>
            {(bookmarked: boolean, isLoading: boolean, fetching: boolean) => (
                <span
                    className={classNames(
                        'flex size-8 items-center justify-center rounded-xl bg-black/25 text-white',
                        bookmarked
                            ? 'text-warn'
                            : 'hover:bg-warn/20 hover:text-warn active:bg-black/25 active:text-warn',
                    )}
                >
                    {isLoading || fetching ? (
                        <LoadingIcon className="animate-spin" width={20} height={20} />
                    ) : (
                        <BookmarkIcon
                            fill={bookmarked ? 'rgb(var(--color-warn))' : 'none'}
                            width={20}
                            height={20}
                            className="size-5"
                        />
                    )}
                </span>
            )}
        </BookmarkButton>
    );
}
