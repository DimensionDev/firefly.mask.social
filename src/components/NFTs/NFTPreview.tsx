import { t } from '@lingui/macro';
import { isValidChainId as isValidSolanaChainId } from '@masknet/web3-shared-solana';
import dayjs from 'dayjs';
import { compact, first } from 'lodash-es';
import { memo, type ReactNode } from 'react';

import CalendarIcon from '@/assets/calendar-small.svg';
import PoapIcon from '@/assets/poap.svg';
import { Image } from '@/components/Image.js';
import { ChainIcon } from '@/components/NFTDetail/ChainIcon.js';
import { BookmarkInIcon } from '@/components/NFTs/BookmarkButton.js';
import { POAP_CONTRACT_ADDRESS } from '@/constants/index.js';
import { Link } from '@/esm/Link.js';
import { isSameEthereumAddress } from '@/helpers/isSameAddress.js';
import { resolveNftUrl, resolveNftUrlByCollection } from '@/helpers/resolveNftUrl.js';
import { resolveSimpleHashChainId } from '@/helpers/resolveSimpleHashChain.js';
import { stopPropagation } from '@/helpers/stopEvent.js';
import type { NftPreview, NftPreviewCollection } from '@/providers/types/Firefly.js';

interface NFTPreviewProps {
    nft: NftPreview;
}

interface BasePreviewContentProps {
    image: string;
    footer?: {
        name: string;
        image?: string;
        link?: string;
    };
    tags: ReactNode[];
    icon?: ReactNode;
    link?: string;
    bookmarkProps?: {
        nftId: string;
        ownerAddress?: string;
    };
}

function formatDate(date: string) {
    return dayjs(date).format('MMM D, YYYY');
}

function BasePreviewContent(props: BasePreviewContentProps) {
    const footer = (
        <>
            {props.footer?.image ? (
                <Image
                    className="rounded-md object-cover"
                    width={18}
                    height={18}
                    src={props.footer.image}
                    alt={props.footer.name}
                />
            ) : null}
            <h2 className="min-w-0 flex-1 truncate text-medium font-bold text-lightMain">{props.footer?.name}</h2>
        </>
    );
    const content = (
        <>
            <div className="relative h-[300px] w-[300px]">
                <Image
                    className="h-full w-full object-cover"
                    width={300}
                    height={300}
                    src={props.image}
                    alt={props.image}
                />
                {props.icon ? (
                    <span className="absolute left-3.5 top-[18px] flex h-8 w-8 items-center justify-center rounded-xl bg-black/25">
                        {props.icon}
                    </span>
                ) : null}
                {props.tags.length ? (
                    <div className="absolute inset-x-3.5 bottom-2.5">
                        {props.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="inline-block rounded-md bg-black/25 p-1.5 text-xs font-bold text-white backdrop-blur-[3px]"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                ) : null}
            </div>
            {props.footer ? (
                props.footer.link ? (
                    <Link
                        className="flex h-[42px] items-center gap-2 px-3"
                        href={props.footer.link}
                        onClick={stopPropagation}
                    >
                        {footer}
                    </Link>
                ) : (
                    <div className="flex h-[42px] items-center gap-2 px-3">{footer}</div>
                )
            ) : null}
        </>
    );

    return (
        <div className="relative w-[300px] overflow-hidden rounded-xl bg-bg text-left" onClick={stopPropagation}>
            {props.link ? <Link href={props.link}>{content}</Link> : content}
            {props.bookmarkProps ? (
                <BookmarkInIcon {...props.bookmarkProps} className="absolute right-5 top-[18px]" />
            ) : null}
        </div>
    );
}

export const NFTPreviewer = memo(function NFTPreview({ nft }: NFTPreviewProps) {
    const chainId = resolveSimpleHashChainId(nft.chain);
    const collectionId = nft.collection.collection_id;
    const isSolanaChain = isValidSolanaChainId(chainId);

    const isPoap = isSameEthereumAddress(nft.contract_address, POAP_CONTRACT_ADDRESS);
    const startDate = isPoap
        ? nft.extra_metadata?.attributes?.find((attr) => attr.trait_type === 'startDate')?.value
        : undefined;
    const endDate = isPoap
        ? nft.extra_metadata?.attributes?.find((attr) => attr.trait_type === 'endDate')?.value
        : undefined;

    return (
        <BasePreviewContent
            image={nft.image_url}
            icon={
                isPoap ? (
                    <PoapIcon width={24} height={24} />
                ) : chainId ? (
                    <ChainIcon className="rounded-full" size={24} chainId={chainId} />
                ) : undefined
            }
            link={
                chainId ? resolveNftUrl(chainId, nft.contract_address, isSolanaChain ? '0' : nft.token_id) : undefined
            }
            footer={
                nft.collection?.collection_id
                    ? {
                          image: nft.collection.image_url,
                          name: isPoap ? nft.name : nft.collection.name,
                          link: isPoap ? undefined : collectionId ? resolveNftUrlByCollection(collectionId) : undefined,
                      }
                    : undefined
            }
            tags={
                isPoap
                    ? compact([
                          startDate && endDate ? (
                              <>
                                  <CalendarIcon className="mr-1 inline-block align-sub" width={15} height={15} />
                                  {formatDate(startDate)} - {formatDate(endDate)}
                              </>
                          ) : null,
                      ])
                    : [`#${nft.name}`]
            }
            bookmarkProps={{ nftId: nft.nft_id, ownerAddress: first(nft.owners)?.owner_address }}
        />
    );
});

export const CollectionPreviewer = memo(function CollectionPreviewer({
    collection,
}: {
    collection: NftPreviewCollection;
}) {
    const chainId = resolveSimpleHashChainId(collection.chains[0]);

    return (
        <BasePreviewContent
            image={collection.image_url}
            icon={chainId ? <ChainIcon className="rounded-full" size={24} chainId={chainId} /> : undefined}
            link={resolveNftUrlByCollection(collection.collection_id)}
            footer={{
                name: collection.name || t`Unknown Collection`,
            }}
            tags={[]}
        />
    );
});
