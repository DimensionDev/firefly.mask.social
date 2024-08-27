import { ChainId } from '@masknet/web3-shared-evm';

export function resolveEvmCAIP2(chainId: ChainId) {
    return `eip155:${chainId}`;
}
