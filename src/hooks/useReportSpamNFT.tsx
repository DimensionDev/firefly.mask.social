import { t, Trans } from '@lingui/macro';
import { type NonFungibleAsset } from '@masknet/web3-shared-base';
import { ChainId, SchemaType } from '@masknet/web3-shared-evm';
import { type Draft, produce } from 'immer';
import { useAsyncFn } from 'react-use';

import { queryClient } from '@/configs/queryClient.js';
import { Source } from '@/constants/enum.js';
import { enqueueMessageFromError, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { isSameEthereumAddress, isSameSolanaAddress } from '@/helpers/isSameAddress.js';
import { resolveSimpleHashChainId } from '@/helpers/resolveSimpleHashChain.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import type { FollowingNFT, NFTFeed } from '@/providers/types/NFTs.js';

interface PagesData {
    pages: Array<{ data: FollowingNFT[] | NFTFeed[] }>;
}

/**
 * Filter out activities by collection id of the target NFT.
 *
 * @param {string} collectionId
 */
function filterOutActivities(collectionId: string) {
    // To report an NFT collection, we need to get its collection id first.
    // Therefore, query data for the collection will exist
    const data = queryClient.getQueriesData<NonFungibleAsset<ChainId, SchemaType>>({ queryKey: ['nft-detail'] });
    const queryData = data.find(([queryKey, data]) => {
        if (queryKey.length !== 4) return false;
        return data?.collection?.id === collectionId;
    });
    const nftDetail = queryData?.[1];
    if (!nftDetail) return;

    const { address: contractAddress, chainId: nftChainId } = nftDetail;

    const patcher = (old: Draft<PagesData> | undefined) => {
        if (!old) return old;
        return produce(old, (draft) => {
            for (const page of draft.pages) {
                if (!page.data.length) continue;
                page.data = page.data.filter((nft) => {
                    if ('network' in nft) {
                        const chainId = resolveSimpleHashChainId(nft.network);
                        const action = nft.actions[0];
                        return (
                            (!isSameEthereumAddress(action.contract_address, contractAddress) &&
                                !isSameSolanaAddress(action.contract_address, contractAddress)) ||
                            chainId !== nftChainId
                        );
                    } else {
                        return (
                            !isSameEthereumAddress(nft.trans.token_address, nftDetail.address) &&
                            !isSameSolanaAddress(nft.trans.token_address, nftDetail.address)
                        );
                    }
                }) as FollowingNFT[] | NFTFeed[];
            }
        });
    };

    queryClient.setQueriesData<PagesData>({ queryKey: ['nfts', 'following', Source.NFTs] }, patcher);
    queryClient.setQueriesData<PagesData>({ queryKey: ['nfts', 'discover', Source.NFTs] }, patcher);
}

export function useReportSpamNFT() {
    return useAsyncFn(async (collectionId: string) => {
        const confirmed = await ConfirmModalRef.openAndWaitForClose({
            title: t`Report spam`,
            variant: 'normal',
            content: (
                <div className="text-main">
                    <Trans>Are you sure you want to report this collection?</Trans>
                </div>
            ),
        });
        if (!confirmed) return;
        try {
            await FireflyEndpointProvider.reportNFT(collectionId);
            filterOutActivities(collectionId);
            await FireflyEndpointProvider.muteNFT(collectionId);
            enqueueSuccessMessage(t`Report submitted`);
        } catch (error) {
            enqueueMessageFromError(error, t`Failed to report spam NFT.`);
            throw error;
        }
    }, []);
}
