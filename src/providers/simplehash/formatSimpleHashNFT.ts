import { SourceType, TokenType } from '@masknet/web3-shared-base';
import { isENSContractAddress, isLens, SchemaType as EVMSchemaType, WNATIVE } from '@masknet/web3-shared-evm';
import {
    isValidChainId as isValidSolanaChainId,
    isValidDomain as isValidSolanaDomain,
    SchemaType as SolanaSchemaType,
} from '@masknet/web3-shared-solana';
import { first, isEmpty } from 'lodash-es';

import { resolveNFTImageUrl } from '@/helpers/resolveNFTImageUrl.js';
import { resolveSimpleHashChainId } from '@/helpers/resolveSimpleHashChain.js';
import { EVMChainResolver } from '@/mask/bindings/index.js';
import type { SimpleHash } from '@/providers/simplehash/type.js';
import type { NFTAsset } from '@/providers/types/Firefly.js';

export const SPAM_SCORE = 50;

export function getAssetFullName(contract_address: string, contractName = '', name?: string, tokenId?: string) {
    if (!name)
        return tokenId && contractName
            ? `${contractName} #${tokenId}`
            : !contractName && tokenId
              ? `#${tokenId}`
              : contractName;
    if (isENSContractAddress(contract_address)) return `ENS #${name}`;
    if (isLens(name)) return name;

    const [first, next] = name.split('#').map((x) => x.trim());
    if (first && next) return `${first} #${next}`;
    if (!first && next) return contractName ? `${contractName} #${next}` : `#${next}`;

    if (contractName && tokenId)
        return contractName.toLowerCase() === first.toLowerCase()
            ? `${contractName} #${tokenId}`
            : `${contractName} #${first}`;
    if (!contractName && !tokenId) return first;
    if (!contractName && tokenId) return `${first} #${tokenId}`;

    return `${contractName} #${first}`;
}

export function formatSimpleHashNFT(nft: SimpleHash.NFT, skipScoreCheck = false): NFTAsset | undefined {
    if (isEmpty(nft)) return;

    const chainId = resolveSimpleHashChainId(nft.chain);
    const address = nft.contract_address;
    const spam_score = nft.collection.spam_score;

    if (!chainId || !address || (spam_score !== null && spam_score >= SPAM_SCORE && !skipScoreCheck)) return;

    const isSolana = isValidSolanaChainId(chainId);
    const schema = isSolana
        ? SolanaSchemaType.NonFungible
        : ['ERC721', 'CRYPTOPUNKS'].includes(nft.contract.type)
          ? EVMSchemaType.ERC721
          : EVMSchemaType.ERC1155;
    const name = isSolana
        ? isValidSolanaDomain(nft.name)
            ? nft.name
            : getAssetFullName(nft.contract_address, nft.collection.name, nft.name, nft.token_id)
        : nft.name || getAssetFullName(nft.contract_address, nft.contract.name, nft.name, nft.token_id);
    const defaultImage = nft.image_url || nft.previews.image_large_url;

    return {
        id: address,
        chainId,
        link: '',
        externalUrl: nft.external_url,
        tokenId: nft.token_id,
        type: TokenType.NonFungible,
        address,
        schema,
        creator: {
            address: nft.contract.deployed_by,
        },
        owner: {
            address: first(nft.owners)?.owner_address,
        },
        priceInToken:
            nft.last_sale && !isSolana
                ? {
                      amount: nft.last_sale.total_price?.toString() || '',
                      token:
                          nft.last_sale.payment_token?.symbol === 'ETH'
                              ? (EVMChainResolver.nativeCurrency(chainId) ?? WNATIVE[chainId])
                              : WNATIVE[chainId],
                  }
                : undefined,
        metadata: {
            chainId,
            name,
            tokenId: nft.token_id,
            symbol: nft.contract.symbol,
            description: nft.description,
            imageURL: isSolana ? defaultImage : resolveNFTImageUrl(nft),
            previewImageURL: isSolana ? nft.previews.image_small_url : resolveNFTImageUrl(nft),
            blurhash: nft.previews.blurhash,
            mediaURL: defaultImage,
            eventId: nft.extra_metadata?.event_id,
            video:
                nft.video_url && nft.video_properties
                    ? { url: nft.video_url, properties: nft.video_properties }
                    : undefined,
        },
        contract: {
            chainId,
            schema,
            address: nft.contract_address,
            name: isSolana ? nft.collection.name : nft.contract.name || '',
            symbol: nft.contract.symbol,
        },
        collection: {
            id: nft.collection.collection_id,
            chainId,
            name: nft.collection.name || '',
            slug: nft.contract.name || '',
            description: nft.collection.description,
            address: nft.contract_address,
            iconURL: nft.collection.image_url,
            verified: Boolean(nft.collection.marketplace_pages?.some((x) => x.verified)),
            createdAt: new Date(nft.created_date).getTime(),
            floorPrices: nft.collection.floor_prices,
        },
        source: SourceType.SimpleHash,
        traits:
            nft.extra_metadata?.attributes.map((x) => ({
                type: x.trait_type,
                value: x.value,
                displayType: x.display_type,
            })) || [],
        tokenCount: nft.token_count,
    };
}
