import { ChainId } from '@masknet/web3-shared-evm';

export function parseChainId(str?: string): ChainId | null {
    if (!str) return null;
    const chainId = Number.parseInt(str, 10);
    const isValidChainId = Object.keys(ChainId)
        .map((key) => ChainId[key as unknown as ChainId] as unknown as number)
        .includes(chainId);
    if (!isValidChainId) return null;
    return chainId;
}
