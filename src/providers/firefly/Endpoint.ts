import { compact } from 'lodash-es';
import urlcat from 'urlcat';
import { type Address, type Hex, isAddress } from 'viem';

import { queryClient } from '@/configs/queryClient.js';
import { DEBANK_CHAIN_TO_CHAIN_ID_MAP, DEBANK_CHAINS } from '@/constants/chain.js';
import { FireflyPlatform, Locale, NetworkType, type SocialSource, Source, SourceInURL } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { SetQueryDataForAddWallet } from '@/decorators/SetQueryDataForAddWallet.js';
import { SetQueryDataForMuteAllProfiles } from '@/decorators/SetQueryDataForBlockProfile.js';
import { SetQueryDataForBlockWallet, SetQueryDataForMuteAllWallets } from '@/decorators/SetQueryDataForBlockWallet.js';
import {
    SetQueryDataForDeleteWallet,
    SetQueryDataForReportAndDeleteWallet,
} from '@/decorators/SetQueryDataForDeleteWallet.js';
import { SetQueryDataForWatchWallet } from '@/decorators/SetQueryDataForWatchWallet.js';
import { getPublicKeyInHexFromSession } from '@/helpers/ed25519.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { formatFarcasterProfileFromSuggestedFollow } from '@/helpers/formatFarcasterProfileFromSuggestedFollow.js';
import { formatFireflyProfilesFromWalletProfiles } from '@/helpers/formatFireflyProfilesFromWalletProfiles.js';
import { formatLensProfileFromSuggestedFollow } from '@/helpers/formatLensProfile.js';
import { formatWalletConnections } from '@/helpers/formatWalletConnection.js';
import { getAddressType } from '@/helpers/getAddressType.js';
import { getPlatformQueryKey } from '@/helpers/getPlatformQueryKey.js';
import { isSameEthereumAddress } from '@/helpers/isSameAddress.js';
import { isZero } from '@/helpers/number.js';
import {
    createIndicator,
    createNextIndicator,
    createPageable,
    type Pageable,
    type PageIndicator,
} from '@/helpers/pageable.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
import { resolveSourceFromUrl } from '@/helpers/resolveSource.js';
import { resolveSourceInUrl } from '@/helpers/resolveSourceInUrl.js';
import { resolveValue } from '@/helpers/resolveValue.js';
import type { FarcasterSession } from '@/providers/farcaster/Session.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { Article } from '@/providers/types/Article.js';
import type { Token as DebankToken } from '@/providers/types/Debank.js';
import {
    type BindWalletResponse,
    type BlockedUsersResponse,
    type BlockFields,
    type BlockRelationResponse,
    type BlockUserResponse,
    type DebankTokensResponse,
    type EmptyResponse,
    type FireflyIdentity,
    type FireflyProfile,
    type FireflyWalletConnection,
    type GenerateFarcasterSignatureResponse,
    type GetAllConnectionsResponse,
    type GetFarcasterSuggestedFollowUserResponse,
    type GetLensSuggestedFollowUserResponse,
    type HexResponse,
    type IsMutedAllResponse,
    type LinkDigestResponse,
    type MuteAllResponse,
    type NFTCollectionsResponse,
    type PlatformIdentityKey,
    type PolymarketActivityTimeline,
    type ProjectResponse,
    type RelationResponse,
    type Response,
    type SearchNFTResponse,
    type SearchProfileResponse,
    type SearchTokenResponse,
    type TelegramLoginBotResponse,
    type TelegramLoginResponse,
    type TwitterUserInfoResponse,
    type TwitterUserV2Response,
    type WalletProfile,
    type WalletProfileResponse,
    type WalletsFollowStatusResponse,
    WatchType,
} from '@/providers/types/Firefly.js';
import type { DiscoverNFTResponseV2, GetFollowingNFTResponse } from '@/providers/types/NFTs.js';
import { getWalletProfileByAddressOrEns } from '@/services/getWalletProfileByAddressOrEns.js';
import { settings } from '@/settings/index.js';

function resolveDebankChain(debankChain: string) {
    const chain = DEBANK_CHAINS.find((chain) => chain.id === debankChain);
    if (chain) return { id: chain.community_id, logoUrl: chain.logo_url };

    if (debankChain in DEBANK_CHAIN_TO_CHAIN_ID_MAP) {
        return { id: DEBANK_CHAIN_TO_CHAIN_ID_MAP[debankChain] };
    }
    return;
}

async function block(field: BlockFields, profileId: string): Promise<boolean> {
    const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/user/mute');
    const response = await fireflySessionHolder.fetch<BlockUserResponse>(url, {
        method: 'POST',
        body: JSON.stringify({
            [field]: profileId,
        }),
    });
    if (response) return true;
    throw new Error('Failed to block user');
}

async function unblock(field: BlockFields, profileId: string): Promise<boolean> {
    const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/user/unmute');
    const response = await fireflySessionHolder.fetch<BlockUserResponse>(url, {
        method: 'POST',
        body: JSON.stringify({
            [field]: profileId,
        }),
    });
    if (response) return true;
    throw new Error('Failed to mute user');
}

@SetQueryDataForBlockWallet()
@SetQueryDataForAddWallet()
@SetQueryDataForDeleteWallet()
@SetQueryDataForReportAndDeleteWallet()
@SetQueryDataForWatchWallet()
@SetQueryDataForMuteAllProfiles()
@SetQueryDataForMuteAllWallets()
export class FireflyEndpoint {
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
            {
                withSession: true,
            },
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
            {
                withSession: true,
            },
        );
    }

    async reportArticle(article: Article) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/report/post/create');
        return fireflySessionHolder.fetch<string>(url, {
            method: 'POST',
            body: JSON.stringify({
                platform: FireflyPlatform.Article,
                platform_id: article.author.id,
                post_type: 'text',
                post_id: article.id,
            }),
        });
    }

    /**
     * Kick off the process of connecting particle wallets with firefly account.
     * @returns
     */
    async reportParticle() {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/user/report/particle/user');
        return fireflySessionHolder.fetch<void>(url, {
            method: 'GET',
        });
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

    async reportFarcasterSigner(session: FarcasterSession, signal?: AbortSignal) {
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
            signal,
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
                    return /^\d+$/.test(identity.id) ? 'twitterId' : 'twitterHandle';
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

        return FireflyEndpointProvider.getAllRelatedProfiles(
            {
                [`${queryKey}`]: identity.id,
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
            const chain = resolveDebankChain(token.chain);
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

    async getMessageToSignForBindWallet(address: string) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/wallet/messageToSign', {
            address,
        });

        const response = await fireflySessionHolder.fetch<Response<{ message: Hex }>>(url, {
            method: 'GET',
        });

        const { message } = resolveFireflyResponseData(response);
        if (!message) throw new Error('Failed to get message to sign');

        return message;
    }

    async getAllPlatformProfileByIdentity(
        identity: FireflyIdentity,
        isTokenRequired: boolean,
    ): Promise<FireflyProfile[]> {
        const response = await FireflyEndpointProvider.getAllPlatformProfileFromFirefly(identity, isTokenRequired);
        const profiles = resolveFireflyResponseData(response);
        return formatFireflyProfilesFromWalletProfiles(profiles);
    }

    async getAllPlatformProfiles(lensHandle?: string, fid?: string, twitterId?: string): Promise<FireflyProfile[]> {
        const isTwitterId = /^\d+$/.test(twitterId || '');
        const response = await FireflyEndpointProvider.getAllRelatedProfiles({
            twitterId: isTwitterId ? twitterId : undefined,
            twitterHandle: isTwitterId ? undefined : twitterId,
            lensHandle,
            fid,
        });

        const profiles = resolveFireflyResponseData(response);
        return formatFireflyProfilesFromWalletProfiles(profiles);
    }

    async getAllRelatedProfiles(options?: Partial<Record<PlatformIdentityKey, string>>, isTokenRequired?: boolean) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/wallet/profile', { ...options });
        return fireflySessionHolder.fetch<WalletProfileResponse>(
            url,
            {
                method: 'GET',
            },
            {
                withSession: isTokenRequired,
            },
        );
    }

    async getNextIDRelations(platform: string, identity: string) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/wallet/relations', {
            platform,
            identity,
        });

        const response = await fireflySessionHolder.fetch<RelationResponse>(url, {
            method: 'GET',
        });

        const relations = resolveFireflyResponseData(response);
        return relations;
    }

    async verifyAndBindWallet(signMessage: string, signature: string) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/wallet/verify');
        const response = await fireflySessionHolder.fetch<BindWalletResponse>(url, {
            method: 'POST',
            body: JSON.stringify({
                signMessage,
                signature,
            }),
        });

        const data = resolveFireflyResponseData(response);
        return data;
    }

    async getMessageToSignMessageForBindSolanaWallet(address: string) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/solana/solana/signMessage', {
            address,
        });

        const response = await fireflySessionHolder.fetch<HexResponse>(url, {
            method: 'GET',
        });

        const data = resolveFireflyResponseData(response);
        if (!data) throw new Error('Failed to get message to sign');

        return data;
    }

    async verifyAndBindSolanaWallet(address: string, messageToSign: string, signature: string) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/solana/solana/verify');
        const response = await fireflySessionHolder.fetch<BindWalletResponse>(url, {
            method: 'POST',
            body: JSON.stringify({
                address,
                messageToSign,
                signature,
            }),
        });

        return resolveFireflyResponseData(response);
    }

    async watchWallet(address: string) {
        if (!isAddress(address)) throw new Error(`Invalid address: ${address}`);
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/user/follow', {
            type: WatchType.Wallet,
            toObjectId: address,
        });
        await fireflySessionHolder.fetch<Response<void>>(url, { method: 'PUT' });
        return true;
    }

    async unwatchWallet(address: string) {
        if (!isAddress(address)) throw new Error(`Invalid address: ${address}`);
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/user/follow', {
            type: WatchType.Wallet,
            toObjectId: address,
        });
        await fireflySessionHolder.fetch<Response<void>>(url, { method: 'DELETE' });
        return true;
    }

    async reportProfile(profileId: string): Promise<boolean> {
        // TODO Mocking result for now.
        return true;
    }

    async searchIdentity(
        keyword: string,
        {
            platforms,
            size = 100,
            indicator,
        }: {
            platforms?: SocialSource[];
            size?: number;
            indicator?: PageIndicator;
        } = {},
    ) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/search/identity', {
            keyword,
            size,
            cursor: indicator?.id,
        });
        const platform = platforms?.map((x) => resolveSourceInUrl(x)).join(','); // There are commas here, without escaping
        const response = await fireflySessionHolder.fetch<SearchProfileResponse>(
            platform ? `${url}&platform=${platform}` : url,
            {
                method: 'GET',
            },
        );
        const data = resolveFireflyResponseData(response);
        return createPageable(
            data.list,
            indicator,
            data.cursor ? createNextIndicator(indicator, `${data.cursor}`) : undefined,
        );
    }

    async discoverNFTs({
        indicator,
        limit = 40,
    }: {
        indicator?: PageIndicator;
        limit?: number;
    } = {}) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/discover/nft', {
            size: limit,
            cursor: indicator?.id,
        });
        const response = await fireflySessionHolder.fetch<DiscoverNFTResponseV2>(url, {
            method: 'GET',
        });
        const data = resolveFireflyResponseData(response);

        return createPageable(
            data.nfts,
            indicator,
            data.hasMore && data.cursor ? createIndicator(undefined, data.cursor) : undefined,
        );
    }

    async getFollowingNFTs({
        limit = 40,
        indicator,
        walletAddresses,
    }: {
        limit?: number;
        indicator?: PageIndicator;
        walletAddresses?: string[];
    } = {}) {
        const url = urlcat(
            settings.FIREFLY_ROOT_URL,
            walletAddresses && walletAddresses.length > 0 ? '/v2/user/timeline/nft' : '/v2/timeline/nft',
        );
        const response = await fireflySessionHolder.fetch<GetFollowingNFTResponse>(
            url,
            {
                method: 'POST',
                body: JSON.stringify({
                    size: limit,
                    cursor: indicator?.id && !isZero(indicator.id) ? indicator.id : undefined,
                    walletAddresses,
                }),
            },
            {
                withSession: !(walletAddresses && walletAddresses.length > 0),
            },
        );
        return createPageable(
            response.data.result,
            indicator,
            response.data.cursor ? createIndicator(undefined, response.data.cursor) : undefined,
        );
    }

    async getBlockRelation(conditions: Array<{ snsPlatform: FireflyPlatform; snsId: string }>) {
        return fireflySessionHolder.withSession(async (session) => {
            if (!session) return [];
            const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/user/blockRelation');
            const response = await fireflySessionHolder.fetch<BlockRelationResponse>(url, {
                method: 'POST',
                body: JSON.stringify({
                    conditions,
                }),
            });
            return response.data ?? [];
        });
    }

    async disconnectAccount(identity: FireflyIdentity) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/accountConnection');
        await fireflySessionHolder.fetch<EmptyResponse>(url, {
            method: 'DELETE',
            body: JSON.stringify({
                connectionPlatform: resolveSourceInUrl(identity.source),
                connectionId: identity.id,
            }),
        });
    }

    async disconnectWallet(address: string) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/wallet');
        await fireflySessionHolder.fetch<EmptyResponse>(url, {
            method: 'DELETE',
            body: JSON.stringify({
                addresses: [address],
            }),
        });
    }

    async isProfileMuted(platform: FireflyPlatform, profileId: string): Promise<boolean> {
        const blockRelationList = await this.getBlockRelation([
            {
                snsPlatform: platform,
                snsId: profileId,
            },
        ]);
        return !!blockRelationList.find((x) => x.snsId === profileId)?.blocked;
    }

    async isProfileMutedAll(identity: FireflyIdentity) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/user/isMuteAll', {
            [getPlatformQueryKey(identity.source)]: identity.id,
        });

        const response = await fireflySessionHolder.fetch<IsMutedAllResponse>(url);
        const data = resolveFireflyResponseData(response);
        return data?.isBlockAll ?? false;
    }

    async reportAndDeleteWallet(connection: FireflyWalletConnection, reason: string) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/wallet/twitter/wallet/report');

        await fireflySessionHolder.fetch<EmptyResponse>(url, {
            method: 'POST',
            body: JSON.stringify({
                twitterId: connection.twitterId,
                walletAddress: connection.address,
                reportReason: reason,
                sources: connection.sources.map((x) => x.source).join(','),
            }),
        });
    }

    async muteProfileAll(identity: FireflyIdentity) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/user/muteAll', {
            [getPlatformQueryKey(identity.source)]: identity.id,
        });

        const response = await fireflySessionHolder.fetch<MuteAllResponse>(url, {
            method: 'POST',
            body: JSON.stringify({
                [getPlatformQueryKey(identity.source)]: identity.id,
            }),
        });

        return resolveFireflyResponseData(response);
    }

    async getAllConnections() {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/accountConnection');
        const response = await fireflySessionHolder.fetch<GetAllConnectionsResponse>(url, {
            method: 'GET',
        });
        return resolveFireflyResponseData(response);
    }

    async getAllConnectionsFormatted() {
        const connections = await this.getAllConnections();

        return {
            connected: formatWalletConnections(connections.wallet.connected, connections),
            related: formatWalletConnections(connections.wallet.unconnected, connections),
        };
    }

    async getTwitterUserInfo(screenName: string) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/twitter/userinfo', {
            screenName,
        });
        const response = await fetchJSON<TwitterUserInfoResponse>(url, {
            method: 'GET',
        });
        return resolveFireflyResponseData(response);
    }

    async getUserInfoById(userId: string) {
        if (!userId) return null;
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/api/twitter/user/:userId', {
            userId,
        });
        const response = await fetchJSON<TwitterUserV2Response>(url);
        return resolveFireflyResponseData(response);
    }

    async blockWallet(address: string) {
        return block('address', address);
    }

    async unblockWallet(address: string) {
        return unblock('address', address);
    }

    async blockProfileFor(source: FireflyPlatform, profileId: string): Promise<boolean> {
        return block(getPlatformQueryKey(resolveSourceFromUrl(source)), profileId);
    }

    async unblockProfileFor(source: FireflyPlatform, profileId: string): Promise<boolean> {
        return unblock(getPlatformQueryKey(resolveSourceFromUrl(source)), profileId);
    }

    async getBlockedWallets(indicator?: PageIndicator): Promise<Pageable<WalletProfile, PageIndicator>> {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/user/mutelist', {
            size: 20,
            page: indicator?.id ?? 1,
            platform: SourceInURL.Wallet,
        });
        const response = await fireflySessionHolder.fetch<BlockedUsersResponse>(url);

        const data = await Promise.all(
            (response.data?.blocks ?? []).map(async (item) => {
                const walletProfile = await getWalletProfileByAddressOrEns(item.address, true);
                return {
                    ...(walletProfile || {
                        address: item.address as Address,
                        blockchain: NetworkType.Ethereum,
                        is_connected: false,
                        verifiedSources: [],
                    }),
                    blocked: true,
                };
            }),
        );

        return createPageable(
            data,
            createIndicator(indicator),
            response.data?.nextPage ? createNextIndicator(indicator, `${response.data?.nextPage}`) : undefined,
        );
    }

    async isFollowingWallet(address: string) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/user/follow/wallet');
        const response = await fireflySessionHolder.fetch<WalletsFollowStatusResponse>(url, {
            method: 'POST',
            body: JSON.stringify({
                addresses: [address],
            }),
        });
        if (!response.data) return false;
        return response.data.some((x) => x.is_followed && isSameEthereumAddress(x.address, address));
    }

    async getProfilePolymarketTimeline(
        address: string,
        platformFollowing: SourceInURL | 'all' = 'all',
        indicator?: PageIndicator,
    ) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/user/timeline/polymarket');

        const response = await fireflySessionHolder.fetch<PolymarketActivityTimeline>(url, {
            method: 'POST',
            body: JSON.stringify({
                platformFollowing,
                walletAddresses: [address],
                size: 25,
                cursor: indicator?.id,
            }),
        });
        const data = resolveFireflyResponseData(response);

        return createPageable(
            data?.result || EMPTY_LIST,
            createIndicator(indicator),
            data?.cursor ? createNextIndicator(indicator, data.cursor) : undefined,
        );
    }

    async getFollowingPolymarketTimeline(platformFollowing: SourceInURL | 'all' = 'all', indicator?: PageIndicator) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/timeline/polymarket');

        const response = await fireflySessionHolder.fetch<PolymarketActivityTimeline>(url, {
            method: 'POST',
            body: JSON.stringify({
                platformFollowing,
                size: 25,
                cursor: indicator?.id,
            }),
        });
        const data = resolveFireflyResponseData(response);

        return createPageable(
            data?.result || EMPTY_LIST,
            createIndicator(indicator),
            data?.cursor ? createNextIndicator(indicator, data.cursor) : undefined,
        );
    }

    async searchTokens(query: string) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/token/search_data', {
            query,
        });
        const response = await fireflySessionHolder.fetch<SearchTokenResponse>(url);
        const data = resolveFireflyResponseData(response);

        return createPageable(data.coins ?? EMPTY_LIST, createIndicator(undefined));
    }

    async searchNFTs(keyword: string) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/search/collectible', {
            keyword,
        });

        const response = await fireflySessionHolder.fetch<SearchNFTResponse>(url, {
            method: 'GET',
        });
        const data = resolveFireflyResponseData(response);

        return createPageable(data.list ?? EMPTY_LIST, createIndicator(undefined));
    }

    async generateFarcasterSignatures(key: Hex, deadline: number, jwt: string, signal?: AbortSignal) {
        const response = await fetchJSON<GenerateFarcasterSignatureResponse>(
            urlcat(settings.FIREFLY_ROOT_URL, '/v3/auth/v1/farcaster/generate-signatures'),
            {
                method: 'POST',
                body: JSON.stringify({ key, deadline }),
                headers: {
                    authorization: `Bearer ${jwt}`,
                },
                signal,
            },
        );
        return resolveFireflyResponseData(response);
    }

    async getTelegramLoginUrl() {
        const response = await fetchJSON<TelegramLoginBotResponse>(
            urlcat(settings.FIREFLY_ROOT_URL, '/v3/auth/get/telegram/bot/url', { os: 'web' }),
        );

        const data = resolveFireflyResponseData(response);

        return data.url;
    }

    async loginTelegram(telegramToken: string) {
        const response = await fetchJSON<TelegramLoginResponse>(
            urlcat(settings.FIREFLY_ROOT_URL, '/v3/auth/telegram/login'),
            {
                method: 'POST',
                body: JSON.stringify({ telegramToken }),
            },
        );

        const data = resolveFireflyResponseData(response);

        return data;
    }

    async linkDigest(link: string) {
        const response = await fetchJSON<LinkDigestResponse>(urlcat(settings.FIREFLY_ROOT_URL, '/v2/misc/linkDigest'), {
            method: 'POST',
            body: JSON.stringify({ link }),
        });
        const data = resolveFireflyResponseData(response);

        return data;
    }
    async getTopProjects(locale: Locale) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/search/project/top100', {
            days: 1,
            language: locale === Locale.en ? 'en' : 'cn',
        });
        const response = await fetchJSON<ProjectResponse>(url, { method: 'GET' });

        return resolveFireflyResponseData(response);
    }
}

export const FireflyEndpointProvider = new FireflyEndpoint();
