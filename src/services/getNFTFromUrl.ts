import { ChainId as EVMChainId } from '@masknet/web3-shared-evm';
import { ChainId as SolanaChainId, isValidChainId as isSolanaChainId } from '@masknet/web3-shared-solana';
import { first } from 'lodash-es';

import { LinkDigestType, NetworkType } from '@/constants/enum.js';
import { POAP_CONTRACT_ADDRESS } from '@/constants/index.js';
import { parseUrl } from '@/helpers/parseUrl.js';
import { resolveSimpleHashChain } from '@/helpers/resolveSimpleHashChain.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import { SimpleHashProvider } from '@/providers/simplehash/index.js';

const rules: Array<{
    hosts: string[];
    pathname: RegExp;
    network: NetworkType;
    chainId: number;
    isPoap?: boolean;
    address?: (matches: RegExpMatchArray) => string;
    tokenId?: (matches: RegExpMatchArray) => string;
}> = [
    // https://magiceden.io/item-details/2fsTwf4ZYHPRkfyYEAEr93hgq3qnpHZHTLQYQd92JP1E
    {
        hosts: ['magiceden.io', 'magiceden.us'],
        pathname: /^\/item-details\/([^/]+)$/,
        network: NetworkType.Solana,
        chainId: SolanaChainId.Mainnet,
    },
    // https://collectors.poap.xyz/token/6329208
    {
        hosts: ['collectors.poap.xyz', 'app.poap.xyz'],
        pathname: /^\/token\/(\d+)$/,
        network: NetworkType.Ethereum,
        chainId: EVMChainId.Mainnet,
        isPoap: true,
        address: () => POAP_CONTRACT_ADDRESS,
        tokenId: (matches) => matches[1],
    },
];

function resolveNFTData(url: string) {
    const parsed = parseUrl(url);
    if (!parsed) return null;

    const { hostname, pathname } = parsed;

    for (const rule of rules) {
        const isHostMatched = rule.hosts.includes(hostname);
        const matched = rule.pathname && pathname.match(rule.pathname);

        if (isHostMatched && matched) {
            return {
                chainId: rule.chainId,
                network: rule.network,
                isPoap: rule.isPoap,
                address: rule.address ? rule.address(matched) : matched[1],
                tokenId: rule.tokenId ? rule.tokenId(matched) : isSolanaChainId(rule.chainId) ? '0' : matched[2],
            };
        }
    }

    return null;
}

export async function getNFTFromUrl(url: string) {
    const nftParams = resolveNFTData(url);

    if (nftParams) {
        const chain = isSolanaChainId(nftParams.chainId) ? 'solana' : resolveSimpleHashChain(nftParams.chainId);
        const nft = !nftParams.isPoap
            ? await SimpleHashProvider.getNFTByAddress(nftParams.address, nftParams.tokenId, chain || 'ethereum')
            : first(
                  await SimpleHashProvider.getNFTByIds(
                      ['gnosis', 'ethereum'].map((chain) => `${chain}.${nftParams.address}.${nftParams.tokenId}`),
                  ),
              );
        return nft?.name ? nft : undefined;
    }

    const digest = await FireflyEndpointProvider.linkDigest(url);
    if (digest.type === LinkDigestType.NFT && digest.nft?.name) {
        return digest.nft;
    }

    return;
}
