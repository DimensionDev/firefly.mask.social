import { ChainId } from '@masknet/web3-shared-evm';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type ContractAddress = string;
type TokenId = string | number;
export type NFTDetailKey = `${ChainId}:${TokenId}:${ContractAddress}`;

interface InvalidNFTStore {
    dataSet: Record<NFTDetailKey, true>;
    size: number;
    registerNotFoundKey: (chainId: ChainId, tokenId: TokenId, contractAddress: ContractAddress) => void;
    has: (chainId: ChainId, tokenId: TokenId, contractAddress: ContractAddress) => boolean;
}

function generateNFTDetailKey(chainId: ChainId, tokenId: TokenId, contractAddress: ContractAddress) {
    return `${chainId}:${tokenId}:${contractAddress}` as NFTDetailKey;
}

export const useInvalidNFTStore = create<InvalidNFTStore, [['zustand/immer', never]]>(
    immer((set, get) => ({
        dataSet: {},
        size: 0,
        registerNotFoundKey: (chainId, tokenId, contractAddress) => {
            return set((state) => {
                state.dataSet[generateNFTDetailKey(chainId, tokenId, contractAddress)] = true;
                state.size = state.size + 1;
            });
        },
        has: (chainId, tokenId, contractAddress) => {
            const state = get();
            return generateNFTDetailKey(chainId, tokenId, contractAddress) in state.dataSet;
        },
    })),
);
