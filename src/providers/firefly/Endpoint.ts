import { compact } from 'lodash-es';
import urlcat from 'urlcat';

import { queryClient } from '@/configs/queryClient.js';
import { DEBANK_CHAIN_TO_CHAIN_ID_MAP, DEBANK_CHAINS } from '@/constants/chain.js';
import { NetworkType, Source } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { getPublicKeyInHexFromSession } from '@/helpers/ed25519.js';
import { formatFarcasterProfileFromSuggestedFollow } from '@/helpers/formatFarcasterProfileFromSuggestedFollow.js';
import { formatLensProfileFromSuggestedFollow } from '@/helpers/formatLensProfile.js';
import { getAddressType } from '@/helpers/getAddressType.js';
import { createIndicator, createNextIndicator, createPageable, type PageIndicator } from '@/helpers/pageable.js';
import { resolveValue } from '@/helpers/resolveValue.js';
import type { FarcasterSession } from '@/providers/farcaster/Session.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { Token as DebankToken } from '@/providers/types/Debank.js';
import type {
    DebankTokensResponse,
    FireflyIdentity,
    GetFarcasterSuggestedFollowUserResponse,
    GetLensSuggestedFollowUserResponse,
    NFTCollectionsResponse,
    WalletProfileResponse,
} from '@/providers/types/Firefly.js';
import { settings } from '@/settings/index.js';

function resolveDeBankChain(deBankChain: string) {
    const chain = DEBANK_CHAINS.find((chain) => chain.id === deBankChain);
    if (chain) return { id: chain.community_id, logoUrl: chain.logo_url };

    if (deBankChain in DEBANK_CHAIN_TO_CHAIN_ID_MAP) {
        return { id: DEBANK_CHAIN_TO_CHAIN_ID_MAP[deBankChain] };
    }
    return;
}

class EndpointProvider {
    async muteNFT(collectionId: string) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/mute/collection');
        await fireflySessionHolder.fetch(
            url,
            {
                method: 'POST',
                body: JSON.stringify({
                    collection_id: collectionId,
                }),
            },
            true,
        );
    }

    /**
     * Reports a scam NFT collection based on the provided collectionId.
     *
     * @param {string} collectionId - collection id from Simplehash
     */
    async reportNFT(collectionId: string) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/misc/reportNFT');
        await fireflySessionHolder.fetch(
            url,
            {
                method: 'POST',
                body: JSON.stringify({
                    collection_id: collectionId,
                }),
            },
            true,
        );
    }

    /**
     * Retrieve all NFT collections from the linked wallets associated with a particular user.
     *
     * @param params
     * @returns
     */
    async getWalletsNFTCollections(params: { limit?: number; indicator?: PageIndicator; walletAddress: string }) {
        const { indicator, walletAddress, limit } = params ?? {};
        const url = urlcat(settings.FIREFLY_ROOT_URL, 'v2/user/walletsNftCollections', {
            walletAddresses: walletAddress,
            size: limit || 25,
            cursor: indicator?.id || undefined,
        });
        const response = await fireflySessionHolder.fetch<NFTCollectionsResponse>(url);
        return createPageable(
            response.data?.collections ?? EMPTY_LIST,
            createIndicator(indicator),
            response.data?.cursor ? createNextIndicator(indicator, `${response.data.cursor}`) : undefined,
        );
    }

    async reportFarcasterSigner(session: FarcasterSession) {
        // ensure session is available
        fireflySessionHolder.assertSession('[reportFarcasterSigner] firefly session required');

        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/farcaster_account/upSignerConfig');

        await fireflySessionHolder.fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                fid: session.profileId,
                signerPublickey: await getPublicKeyInHexFromSession(session),
                signerPrivatekey: session.token,
            }),
        });
    }

    async getAllPlatformProfileFromFirefly(identity: FireflyIdentity, isTokenRequired: boolean) {
        const queryKey = resolveValue(() => {
            switch (identity.source) {
                case Source.Lens:
                    return 'lensHandle';
                case Source.Farcaster:
                    return 'fid';
                case Source.Twitter:
                    return 'twitterId';
                case Source.Wallet:
                    switch (getAddressType(identity.id)) {
                        case NetworkType.Ethereum:
                            return 'walletAddress';
                        case NetworkType.Solana:
                            return 'solanaAddress';
                        default:
                            return 'walletAddress';
                    }
                default:
                    return '';
            }
        });

        const url = urlcat(
            settings.FIREFLY_ROOT_URL,
            '/v2/wallet/profile',
            queryKey ? { [`${queryKey}`]: identity.id } : {},
        );

        return fireflySessionHolder.fetch<WalletProfileResponse>(
            url,
            {
                method: 'GET',
            },
            isTokenRequired,
        );
    }

    async getAllTokenList(address: string) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, 'v1/misc/all_token_list', {
            address,
        });
        const result = await fireflySessionHolder.fetch<DebankTokensResponse>(url);
        return result.data?.list ?? [];
    }

    async getTokensByAddress(address: string): Promise<
        Array<
            DebankToken & {
                chainId?: number;
                chainLogoUrl?: string;
            }
        >
    > {
        const tokens = await queryClient.fetchQuery({
            queryKey: ['debank', 'tokens', address],
            queryFn: () => this.getAllTokenList(address),
            staleTime: 1000 * 60 * 1,
        });

        return tokens.map((token) => {
            const chain = resolveDeBankChain(token.chain);
            return {
                ...token,
                chainId: chain?.id,
                chainLogoUrl: chain?.logoUrl,
            };
        });
    }

    async getLensSuggestFollows(indicator?: PageIndicator) {
        const response = await fireflySessionHolder.fetch<GetLensSuggestedFollowUserResponse>(
            urlcat(settings.FIREFLY_ROOT_URL, `/v1/lens/suggested_follow_list`, {
                cursor: indicator?.id,
            }),
        );
        if (!response.data) return createPageable(EMPTY_LIST, indicator);
        const profiles = compact(response.data.suggestedFollowList.map((x) => x[0])).map((user) =>
            formatLensProfileFromSuggestedFollow(user),
        );
        return createPageable(profiles, indicator, createIndicator(indicator, `${response.data.cursor}`));
    }

    async getFarcasterSuggestFollows(indicator?: PageIndicator) {
        const response = await fireflySessionHolder.fetch<GetFarcasterSuggestedFollowUserResponse>(
            urlcat(settings.FIREFLY_ROOT_URL, `/v2/farcaster-hub/suggested_follow_list`, {
                cursor: indicator?.id,
            }),
        );
        if (!response.data) return createPageable(EMPTY_LIST, indicator);
        const profiles =
            response.data?.suggestedFollowList.map((user) => formatFarcasterProfileFromSuggestedFollow(user)) ?? [];
        return createPageable(profiles, indicator, createIndicator(indicator, `${response.data.cursor}`));
    }
}

export const FireflyEndpointProvider = new EndpointProvider();
