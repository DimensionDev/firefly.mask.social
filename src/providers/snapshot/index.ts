import urlcat from 'urlcat';

import { LinkDigestType } from '@/constants/enum.js';
import { SNAPSHOT_GRAPHQL_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { isSameEthereumAddress } from '@/helpers/isSameAddress.js';
import { plus } from '@/helpers/number.js';
import { createIndicator, createNextIndicator, createPageable, type PageIndicator } from '@/helpers/pageable.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { UsersQuery, VotesQuery } from '@/providers/snapshot/query.js';
import type { SnapshotUsers, SnapshotVote, SnapshotVotes } from '@/providers/snapshot/type.js';
import type { SnapshotLinkDigestedResponse } from '@/providers/types/Snapshot.js';
import { settings } from '@/settings/index.js';

export class Snapshot {
    static async getSnapshotByLink(link: string) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/misc/linkDigest');
        const response = await fireflySessionHolder.fetch<SnapshotLinkDigestedResponse>(url, {
            method: 'POST',
            body: JSON.stringify({ link }),
        });

        const data = resolveFireflyResponseData(response);

        if (data.type !== LinkDigestType.Snapshot || !data.snapshot) {
            return null;
        }
        return data.snapshot;
    }

    static async getVotesById(id: string, indicator?: PageIndicator) {
        const votesResponse = await fetchJSON<SnapshotVotes>(SNAPSHOT_GRAPHQL_URL, {
            method: 'POST',
            body: JSON.stringify({
                ...VotesQuery,
                variables: {
                    id,
                    first: 20,
                    orderBy: 'created',
                    orderDirection: 'desc',
                    skip: Number(indicator?.id ?? 0),
                },
            }),
        });

        const votes = votesResponse.data.votes;

        const usersResponse = await fetchJSON<SnapshotUsers>(SNAPSHOT_GRAPHQL_URL, {
            method: 'POST',
            body: JSON.stringify({
                ...UsersQuery,
                variables: {
                    addresses: votes.map((vote) => vote.voter),
                },
            }),
        });

        const results = votes.map<SnapshotVote>((vote) => {
            const user = usersResponse.data.users.find((user) => isSameEthereumAddress(user.id, vote.voter));
            return {
                ...vote,
                voterDetail: user,
            };
        });

        return createPageable(
            results,
            createIndicator(indicator),
            createNextIndicator(indicator, plus(indicator?.id ?? 0, 20).toString()),
        );
    }
}
