import { isValidAddress, isValidChainId } from '@masknet/web3-shared-evm';
import { ChainId, isValidChainId as isValidSolanaChainId } from '@masknet/web3-shared-solana';
import { notFound, redirect } from 'next/navigation.js';

import { NFTCollectionPage } from '@/app/(normal)/nft/pages/NFTCollectionPage.js';
import { NFTDetailPage } from '@/app/(normal)/nft/pages/NFTDetailPage.js';
import { createMetadataNFT, createMetadataNFTCollection } from '@/helpers/createMetadataNFT.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { parseChainId } from '@/helpers/parseChainId.js';
import { resolveCollectionChain } from '@/helpers/resolveCollectionChain.js';
import { resolveNftUrl } from '@/helpers/resolveNftUrl.js';
import { resolveWalletProfileProvider } from '@/helpers/resolveWalletProfileProvider.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';

interface Props {
    params: {
        addressOrTokenId: string;
        chainIdOrCollectionId: string;
    };
}

function isNFTDetailPage(chainIdOrCollectionId: string, addressOrTokenId: string) {
    const isChainId = isValidChainId(+chainIdOrCollectionId) || isValidSolanaChainId(+chainIdOrCollectionId);
    const isAddress = isValidAddress(addressOrTokenId);

    return !isChainId && !isAddress;
}

export async function generateMetadata({ params: { addressOrTokenId, chainIdOrCollectionId } }: Props) {
    if (isNFTDetailPage(chainIdOrCollectionId, addressOrTokenId)) {
        const provider = resolveWalletProfileProvider(+chainIdOrCollectionId);
        const collection = await runInSafeAsync(() => provider.getCollectionById(chainIdOrCollectionId));
        if (collection) {
            const { address, chainId } = resolveCollectionChain(collection);
            return createMetadataNFT(address, addressOrTokenId, chainId);
        }
    }
    const chainId = parseChainId(chainIdOrCollectionId);
    if (chainId) return createMetadataNFTCollection(addressOrTokenId, chainId);
    return createSiteMetadata();
}

export default async function Page({ params: { addressOrTokenId, chainIdOrCollectionId } }: Props) {
    if (chainIdOrCollectionId === 'solana') {
        redirect(resolveNftUrl(ChainId.Mainnet, addressOrTokenId, '0'));
    }
    if (isNFTDetailPage(chainIdOrCollectionId, addressOrTokenId)) {
        const provider = resolveWalletProfileProvider(+chainIdOrCollectionId);
        const collection = await provider.getCollectionById(chainIdOrCollectionId);
        if (collection) {
            const { address, chainId } = resolveCollectionChain(collection);
            return <NFTDetailPage chainId={chainId} tokenId={addressOrTokenId} address={address} />;
        }
    }

    const chainId = parseChainId(chainIdOrCollectionId);
    if (!chainId) notFound();

    return <NFTCollectionPage chainId={chainId} address={addressOrTokenId} />;
}
