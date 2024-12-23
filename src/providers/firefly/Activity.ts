import { IS_IOS } from '@lexical/utils';
import { safeUnreachable } from '@masknet/kit';
import urlcat from 'urlcat';

import { type SocialSource, Source } from '@/constants/enum.js';
import { NotImplementedError } from '@/constants/error.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { formatWalletConnections } from '@/helpers/formatWalletConnection.js';
import {
    createIndicator,
    createNextIndicator,
    createPageable,
    type Pageable,
    type PageIndicator,
} from '@/helpers/pageable.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { farcasterSessionHolder } from '@/providers/farcaster/SessionHolder.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { CheckResponse, MintActivitySBTResponse, Provider } from '@/providers/types/Activity.js';
import type {
    ActivityInfoResponse,
    ActivityListItem,
    ActivityListResponse,
    FriendshipResponse,
    GetAllConnectionsResponse,
    VotingResultResponse,
} from '@/providers/types/Firefly.js';
import type { Friendship } from '@/providers/types/SocialMedia.js';
import { getProfileById } from '@/services/getProfileById.js';
import { settings } from '@/settings/index.js';
import { SupportedMethod } from '@/types/bridge.js';

class FireflyActivity implements Provider {
    async getActivityClaimCondition(
        name: string,
        address = '0x',
        options?: {
            premiumAddress?: string;
        },
    ) {
        const params =
            name === 'pengu'
                ? { name, solAddress: address || '0x', evmAddress: options?.premiumAddress || '0x' }
                : { name, address, ...options };
        const url = urlcat(settings.FIREFLY_ROOT_URL, `/v1/activity/check/:name`, params);
        const response = await fireflySessionHolder.fetchWithSession<CheckResponse>(url);
        return resolveFireflyResponseData(response);
    }

    async getFireflyActivityInfo(name: string) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/activity/info', {
            name,
        });
        const response = await fetchJSON<ActivityInfoResponse>(url);
        return resolveFireflyResponseData(response);
    }

    async getFireflyActivityList({ indicator, size }: { indicator?: PageIndicator; size?: number } = {}) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/activity/list', {
            cursor: indicator?.id,
            size,
        });
        const response = await fetchJSON<ActivityListResponse>(url);
        const data = resolveFireflyResponseData(response);
        if (!data.list) {
            return createPageable(EMPTY_LIST, createIndicator(indicator));
        }
        return createPageable(
            data.list,
            createIndicator(indicator),
            data.cursor ? createNextIndicator(indicator, `${data.cursor}`) : undefined,
        );
    }

    async claimActivitySBT(address: string, activityName: string, claimApiExtraParams?: Record<string, unknown>) {
        let claimPlatform: 'web' | 'ios' | 'android' = 'web';
        if (fireflyBridgeProvider.supported) claimPlatform = IS_IOS ? 'ios' : 'android';
        const response = await fireflySessionHolder.fetchWithSession<MintActivitySBTResponse>(
            urlcat(settings.FIREFLY_ROOT_URL, '/v1/wallet_transaction/mint/activity/sbt'),
            {
                method: 'POST',
                body: JSON.stringify({
                    walletAddress: address,
                    claimPlatform,
                    activityName,
                    ...claimApiExtraParams,
                }),
            },
        );
        const data = resolveFireflyResponseData(response);
        if (data.errormessage) {
            throw new Error(data.errormessage);
        }
        return data;
    }

    async getActivityInfo(name: string): Promise<ActivityInfoResponse['data']> {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/activity/info', {
            name,
        });
        const response = await fetchJSON<ActivityInfoResponse>(url);
        return resolveFireflyResponseData(response);
    }

    async getActivityList(
        indicator?: PageIndicator,
        size?: number,
    ): Promise<Pageable<ActivityListItem, PageIndicator>> {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/activity/list', {
            cursor: indicator?.id,
            size,
        });
        const response = await fetchJSON<ActivityListResponse>(url);
        const data = resolveFireflyResponseData(response);
        if (!data.list) {
            return createPageable(EMPTY_LIST, createIndicator(indicator));
        }
        return createPageable<ActivityListItem>(
            data.list,
            createIndicator(indicator),
            data.cursor ? createNextIndicator(indicator, `${data.cursor}`) : undefined,
        );
    }

    async getAllConnections() {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/accountConnection');
        const response = await fireflySessionHolder.fetchWithSession<GetAllConnectionsResponse>(url, {
            method: 'GET',
        });
        const connections = resolveFireflyResponseData(response);
        return {
            connected: formatWalletConnections(connections.wallet.connected, connections),
            related: formatWalletConnections(connections.wallet.unconnected, connections),
            rawConnections: connections,
        };
    }

    async getVotingResults() {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/wallet_transaction/elex24/activity/ratio');

        const response = await fetchJSON<VotingResultResponse>(url);
        return resolveFireflyResponseData(response);
    }

    async follow(
        source: SocialSource,
        profileId: string,
        options?: {
            sourceFarcasterProfileId?: number;
        },
    ) {
        if (fireflyBridgeProvider.supported) {
            switch (source) {
                case Source.Lens:
                    throw new NotImplementedError();
                case Source.Twitter:
                    await fireflyBridgeProvider.request(SupportedMethod.FOLLOW_TWITTER_USER, {
                        id: profileId,
                    });
                    return;
                case Source.Farcaster:
                    await fireflySessionHolder.fetchWithSession(
                        urlcat(settings.FIREFLY_ROOT_URL, '/v2/farcaster-hub/follow'),
                        {
                            method: 'POST',
                            body: JSON.stringify({
                                targetFid: parseInt(profileId, 10),
                                sourceFid: options?.sourceFarcasterProfileId,
                            }),
                        },
                    );
                    return;
                default:
                    safeUnreachable(source);
                    return;
            }
        }
        await resolveSocialMediaProvider(source).follow(profileId);
    }

    async isFollowed(
        source: SocialSource,
        profileId: string,
        options?: {
            sourceFarcasterProfileId?: number;
        },
    ) {
        switch (source) {
            case Source.Lens: {
                const profile = await getProfileById(source, profileId);
                return profile?.viewerContext?.following ?? false;
            }
            case Source.Farcaster: {
                return farcasterSessionHolder.withSession(async (session) => {
                    const response = await fireflySessionHolder.fetchWithSession<FriendshipResponse>(
                        urlcat(settings.FIREFLY_ROOT_URL, '/v2/farcaster-hub/user/friendship', {
                            sourceFid: options?.sourceFarcasterProfileId ?? session?.profileId,
                            destFid: profileId,
                        }),
                        {
                            method: 'GET',
                        },
                    );
                    return resolveFireflyResponseData<Friendship>(response)?.isFollowing;
                });
            }
            case Source.Twitter: {
                if (fireflyBridgeProvider.supported) {
                    return (
                        (await fireflyBridgeProvider.request(SupportedMethod.IS_TWITTER_USER_FOLLOWING, {
                            id: profileId,
                        })) === 'true'
                    );
                }
                const profile = await getProfileById(source, profileId);
                return profile?.viewerContext?.following ?? false;
            }
        }
    }
}

export const FireflyActivityProvider = new FireflyActivity();
