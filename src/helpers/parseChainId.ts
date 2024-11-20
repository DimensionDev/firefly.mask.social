import { isValidChainId as isValidEVMChainId } from '@masknet/web3-shared-evm';
import { isValidChainId as isValidSolanaChainId } from '@masknet/web3-shared-solana';

export function parseChainId(str?: string) {
    if (!str) return null;
    const chainId = Number.parseInt(str, 10);
    if (!isValidEVMChainId(chainId) && !isValidSolanaChainId(chainId)) return null;
    return chainId;
}
