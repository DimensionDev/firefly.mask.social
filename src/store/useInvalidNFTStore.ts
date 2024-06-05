import { ChainId } from '@masknet/web3-shared-evm';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type ContractAddress = string;
type TokenId = string | number;
export type NFTDetailKey = `${ContractAddress}.${TokenId}.${ChainId}`;

interface InvalidNFTStore {
    dataSet: Record<NFTDetailKey, true>;
    size: number;
    registerNotFoundKey: (contractAddress: ContractAddress, tokenId: TokenId, chainId: ChainId) => void;
    has: (contractAddress: ContractAddress, tokenId: TokenId, chainId: ChainId) => boolean;
}

export const useInvalidNFTStore = create<InvalidNFTStore, [['zustand/immer', never]]>(
    immer((set, get) => ({
        dataSet: {},
        size: 0,
        registerNotFoundKey: (contractAddress, tokenId, chainId) => {
            return set((state) => {
                state.dataSet[`${contractAddress}.${tokenId}.${chainId}`] = true;
                state.size = state.size + 1;
            });
        },
        has: (contractAddress, tokenId, chainId) => {
            const state = get();
            return `${contractAddress}.${tokenId}.${chainId}` in state.dataSet;
        },
    })),
);
