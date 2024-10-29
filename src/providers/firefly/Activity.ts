import { IS_IOS } from '@lexical/utils';
import type { Pageable } from '@masknet/shared-base';
import urlcat from 'urlcat';

import { EMPTY_LIST } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { formatWalletConnections } from '@/helpers/formatWalletConnection.js';
import { createIndicator, createNextIndicator, createPageable, type PageIndicator } from '@/helpers/pageable.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
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
        const response = await fireflySessionHolder.fetch<GetAllConnectionsResponse>(url, {
            method: 'GET',
            ...(authToken
                ? {
                      headers: {
                          Authorization: `Bearer ${authToken}`,
                      },
                  }
                : {}),
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
}

export const FireflyActivityProvider = new FireflyActivity();
