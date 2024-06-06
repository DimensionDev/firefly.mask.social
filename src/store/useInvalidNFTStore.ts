import { ChainId } from '@masknet/web3-shared-evm';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type ContractAddress = string;
type TokenId = string | number;

export type NFTDetailKey = `${ChainId}:${ContractAddress}:${TokenId}`;

interface InvalidNFTStore {
    dataSet: Record<NFTDetailKey, true>;
    size: number;
    add: (chainId: ChainId, contractAddress: ContractAddress, tokenId: TokenId) => void;
    has: (chainId: ChainId, contractAddress: ContractAddress, tokenId: TokenId) => boolean;
}

function generateNFTDetailKey(chainId: ChainId, contractAddress: ContractAddress, tokenId: TokenId) {
    return `${chainId}:${contractAddress}:${tokenId}` as NFTDetailKey;
}

export const useInvalidNFTStore = create<InvalidNFTStore, [['zustand/immer', never]]>(
    immer((set, get) => ({
        dataSet: {},
        size: 0,
        add: (chainId, contractAddress, tokenId) => {
            return set((state) => {
                state.dataSet[generateNFTDetailKey(chainId, contractAddress, tokenId)] = true;
                state.size = state.size + 1;
            });
        },
        has: (chainId, contractAddress, tokenId) => {
            const state = get();
            return generateNFTDetailKey(chainId, contractAddress, tokenId) in state.dataSet;
        },
    })),
);
