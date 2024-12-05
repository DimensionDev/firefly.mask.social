import { t } from '@lingui/macro';
import { isValidChainId as isValidSolanaChainId } from '@masknet/web3-shared-solana';
import { memo, type ReactNode } from 'react';

import { Image } from '@/components/Image.js';
import { ChainIcon } from '@/components/NFTDetail/ChainIcon.js';
import { BookmarkButton } from '@/components/NFTs/BookmarkButton.js';
import { Link } from '@/esm/Link.js';
import { resolveNftUrl, resolveNftUrlByCollection } from '@/helpers/resolveNftUrl.js';
import { resolveSimpleHashChainId } from '@/helpers/resolveSimpleHashChain.js';
import { stopPropagation } from '@/helpers/stopEvent.js';
import type { NftPreview, NftPreviewCollection } from '@/providers/types/Firefly.js';

interface NFTPreviewProps {
    nft: NftPreview;
}

interface BasePreviewContentProps {
    image: string;
    footer: {
        name: string;
        image?: string;
        link?: string;
    };
    tags: ReactNode[];
    icon?: ReactNode;
    link?: string;
    bookmarkProps?: {
        nft: NftPreview;
    };
}

function BasePreviewContent(props: BasePreviewContentProps) {
    const footer = (
        <>
            {props.footer.image ? (
                <Image className="rounded-md" width={18} height={18} src={props.footer.image} alt={props.footer.name} />
            ) : null}
            <h2 className="min-w-0 flex-1 truncate text-medium font-bold text-lightMain">{props.footer.name}</h2>
        </>
    );
    const content = (
        <>
            <div className="relative h-[300px] w-[300px]">
                <Image className="h-full w-full" width={300} height={300} src={props.image} alt={props.image} />
                {props.icon ? (
                    <span className="absolute left-3.5 top-[18px] flex h-8 w-8 items-center justify-center rounded-xl bg-black/25">
                        {props.icon}
                    </span>
                ) : null}
                {props.bookmarkProps ? (
                    <BookmarkButton
                        {...props.bookmarkProps}
                        className="absolute right-5 top-[18px] flex h-8 w-8 items-center justify-center rounded-xl bg-black/25"
                    />
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
            {props.footer.link ? (
                <Link
                    className="flex h-[42px] items-center gap-2 bg-lightBg px-3"
                    href={props.footer.link}
                    onClick={stopPropagation}
                >
                    {footer}
                </Link>
            ) : (
                <div className="flex h-[42px] items-center gap-2 bg-lightBg px-3">{footer}</div>
            )}
        </>
    );

    return props.link ? (
        <Link className="block w-[300px] overflow-hidden rounded-xl text-left" href={props.link}>
            {content}
        </Link>
    ) : (
        <div className="w-[300px] overflow-hidden rounded-xl text-left">{content}</div>
    );
}

export const NFTPreviewer = memo(function NFTPreview({ nft }: NFTPreviewProps) {
    const chainId = resolveSimpleHashChainId(nft.chain);
    const collectionId = nft.collection.collection_id;
    const isSolanaChain = isValidSolanaChainId(chainId);

    return (
        <BasePreviewContent
            image={nft.image_url}
            icon={chainId ? <ChainIcon className="rounded-full" size={24} chainId={chainId} /> : undefined}
            link={
                chainId ? resolveNftUrl(chainId, nft.contract_address, isSolanaChain ? '0' : nft.token_id) : undefined
            }
            footer={{
                image: nft.collection.image_url,
                name: nft.collection.name,
                link: collectionId ? resolveNftUrlByCollection(collectionId) : undefined,
            }}
            tags={[`#${nft.name}`]}
            bookmarkProps={{ nft }}
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
