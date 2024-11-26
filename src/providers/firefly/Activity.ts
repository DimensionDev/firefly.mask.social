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
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { CheckResponse, MintActivitySBTResponse, Provider } from '@/providers/types/Activity.js';
import type {
    ActivityInfoResponse,
    ActivityListItem,
    ActivityListResponse,
    GetAllConnectionsResponse,
    VotingResultResponse,
} from '@/providers/types/Firefly.js';
import { settings } from '@/settings/index.js';
import { SupportedMethod } from '@/types/bridge.js';

class FireflyActivity implements Provider {
    async getActivityClaimCondition(
        name: string,
        options: {
            address?: string;
            authToken?: string;
        } = {},
    ) {
        const { authToken, address = '0x' } = options;
        const url = urlcat(settings.FIREFLY_ROOT_URL, `/v1/activity/check/:name`, { name, address });
        const response = await fireflySessionHolder.fetch<CheckResponse>(url, {
            ...(authToken
                ? {
                      headers: {
                          Authorization: `Bearer ${authToken}`,
                      },
                  }
                : {}),
        });
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

    async claimActivitySBT(
        address: string,
        activityName: string,
        {
            authToken,
            claimApiExtraParams,
        }: {
            authToken?: string;
            claimApiExtraParams?: Record<string, unknown>;
        } = {},
    ) {
        let claimPlatform: 'web' | 'ios' | 'android' = 'web';
        if (fireflyBridgeProvider.supported) claimPlatform = IS_IOS ? 'ios' : 'android';
        const response = await fireflySessionHolder.fetch<MintActivitySBTResponse>(
            urlcat(settings.FIREFLY_ROOT_URL, '/v1/wallet_transaction/mint/activity/sbt'),
            {
                method: 'POST',
                body: JSON.stringify({
                    walletAddress: address,
                    claimPlatform,
                    activityName,
                    ...claimApiExtraParams,
                }),
                ...(authToken
                    ? {
                          headers: {
                              Authorization: `Bearer ${authToken}`,
                          },
                      }
                    : {}),
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

    async getAllConnections({
        authToken,
    }: {
        authToken?: string;
    } = {}) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/accountConnection');
        const headers: HeadersInit = {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
        };
        const response = await fireflySessionHolder.fetch<GetAllConnectionsResponse>(url, {
            method: 'GET',
            ...(authToken
                ? {
                      headers: {
                          Authorization: `Bearer ${authToken}`,
                          ...headers,
                      },
                  }
                : { headers }),
        });
        const connections = resolveFireflyResponseData(response);
        return {
            connected: formatWalletConnections(connections.wallet.connected, connections),
            related: formatWalletConnections(connections.wallet.unconnected, connections),
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
            authToken?: string;
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
                    break;
                case Source.Farcaster:
                    const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/farcaster-hub/follow');
                    await fireflySessionHolder.fetch(url, {
                        method: 'POST',
                        body: JSON.stringify({
                            targetFid: parseInt(profileId, 10),
                            sourceFid: options?.sourceFarcasterProfileId,
                        }),
                        ...(options?.authToken
                            ? {
                                  headers: {
                                      Authorization: `Bearer ${options.authToken}`,
                                  },
                              }
                            : {}),
                    });
                    break;
                default:
                    safeUnreachable(source);
                    return;
            }
            return;
        }
        await resolveSocialMediaProvider(source).follow(profileId);
    }
}

export const FireflyActivityProvider = new FireflyActivity();
