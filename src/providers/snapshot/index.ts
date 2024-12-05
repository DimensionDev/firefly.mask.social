import { t } from '@lingui/macro';
import { getAccount } from 'wagmi/actions';
import { last, omit } from 'lodash-es';

import { config } from '@/configs/wagmiClient.js';
import { SnapshotState } from '@/constants/enum.js';
import { SNAPSHOT_GRAPHQL_URL, SNAPSHOT_RELAY_URL, SNAPSHOT_SCORES_URL, SNAPSHOT_SEQ_URL } from '@/constants/index.js';
import { SNAPSHOT_NEW_PROPOSAL_REGEXP, SNAPSHOT_PROPOSAL_REGEXP } from '@/constants/regexp.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { isSameEthereumAddress } from '@/helpers/isSameAddress.js';
import { plus } from '@/helpers/number.js';
import { createIndicator, createNextIndicator, createPageable, type PageIndicator } from '@/helpers/pageable.js';
import { ProposalQuery, ProposalsQuery, UsersQuery, VotesQuery } from '@/providers/snapshot/query.js';
import {
    type SnapshotChoice,
    type SnapshotProposal,
    type SnapshotStrategy,
    type SnapshotUsers,
    type SnapshotVote,
    type SnapshotVotes,
    vote2Types,
    voteArray2Types,
    voteArrayTypes,
    voteString2Types,
    voteStringTypes,
    voteTypes,
} from '@/providers/snapshot/type.js';

const NAME = 'snapshot';
const VERSION = '0.1.4';

export class Snapshot {
    static getProposalLink(proposal: SnapshotProposal) {
        return `https://snapshot.box/#/s:${proposal.space.id}/proposal/${proposal.id}`;
    }

    static getProposalState(proposal: SnapshotProposal) {
        if (proposal.state === SnapshotState.Closed) {
            if (proposal.scores_total < proposal.quorum) return SnapshotState.Rejected;
            return proposal.type !== 'basic' || proposal.scores[0] > proposal.scores[1]
                ? SnapshotState.Passed
                : SnapshotState.Rejected;
        }

        return proposal.state;
    }

    static async getSnapshotByLink(link: string): Promise<SnapshotProposal | undefined> {
        if (!SNAPSHOT_PROPOSAL_REGEXP.test(link) && !SNAPSHOT_NEW_PROPOSAL_REGEXP.test(link)) return;
        const match = link.match(SNAPSHOT_PROPOSAL_REGEXP);
        const newMatch = link.match(SNAPSHOT_NEW_PROPOSAL_REGEXP);
        const id = match ? match[1] : newMatch ? newMatch[2] : null;
        if (!id) return;

        const response = await fetchJSON<{ data: { proposal: SnapshotProposal } }>(SNAPSHOT_GRAPHQL_URL, {
            method: 'POST',
            body: JSON.stringify({
                ...ProposalQuery,
                variables: {
                    id,
                },
            }),
        });

        if (!response.data.proposal) return;

        const account = getAccount(config);

        const proposal = {
            ...response.data.proposal,
            state: Snapshot.getProposalState(response.data.proposal),
        };
        if (!account.address) return proposal;

        const votes = await Snapshot.pathQueryVoteResultsByVoter([response.data.proposal.id], account.address);

        const target = last(votes.data);
        if (!target) return proposal;

        return {
            ...proposal,
            currentUserChoice: target.choice,
        };
    }

    static async getProposals(ids: string[]) {
        const response = await fetchJSON<{ data: { proposals: SnapshotProposal[] } }>(SNAPSHOT_GRAPHQL_URL, {
            method: 'POST',
            body: JSON.stringify({
                ...ProposalsQuery,
                variables: {
                    id_in: ids,
                    first: 20,
                },
            }),
        });

        if (!response.data.proposals) return [];

        const account = getAccount(config);

        if (!account.address) return response.data.proposals;

        const votes = await Snapshot.pathQueryVoteResultsByVoter(ids, account.address);

        const proposals = response.data.proposals.map((proposal) => {
            const target = votes.data.find((vote) => vote.proposal.id === proposal.id);
            return {
                ...proposal,
                state: Snapshot.getProposalState(proposal),
                currentUserChoice: target?.choice,
            };
        });

        return proposals;
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
            results.length ? createNextIndicator(indicator, plus(indicator?.id ?? 0, 20).toString()) : null,
        );
    }

    static async pathQueryVoteResultsByVoter(ids: string[], voter: string, indicator?: PageIndicator) {
        const votesResponse = await fetchJSON<SnapshotVotes>(SNAPSHOT_GRAPHQL_URL, {
            method: 'POST',
            body: JSON.stringify({
                ...VotesQuery,
                variables: {
                    ids,
                    voter,
                    first: 20,
                    skip: Number(indicator?.id ?? 0),
                },
            }),
        });

        const votes = votesResponse.data.votes;

        return createPageable(
            votes,
            createIndicator(indicator),
            createNextIndicator(indicator, plus(indicator?.id ?? 0, 20).toString()),
        );
    }

    static async getVotePower(
        address: string,
        network: string,
        strategies: SnapshotStrategy[],
        snapshot: number | 'latest',
        space: string,
        delegation: boolean,
    ) {
        const response = await fetchJSON<{ result: { vp: number; vp_by_strategy: number[]; vp_state: string } }>(
            SNAPSHOT_SCORES_URL,
            {
                method: 'POST',
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'get_vp',
                    params: {
                        address,
                        network,
                        strategies,
                        snapshot,
                        space,
                        delegation,
                    },
                }),
            },
        );

        return response.result;
    }

    static async vote(payload: {
        from: string;
        space: string;
        proposal: string;
        type: string;
        choice: SnapshotChoice;
        privacy?: string;
        reason?: string;
        app?: string;
        metadata?: string;
    }) {
        const isShutter = payload.privacy === 'shutter';

        const isType2 = payload.proposal.startsWith('0x');

        let types = isType2 ? vote2Types : voteTypes;
        if (['approval', 'ranked-choice'].includes(payload.type)) types = isType2 ? voteArray2Types : voteArrayTypes;
        if (!isShutter && ['quadratic', 'weighted'].includes(payload.type)) {
            types = isType2 ? voteString2Types : voteStringTypes;
            payload.choice = JSON.stringify(payload.choice);
        }

        if (isShutter) types = isType2 ? voteString2Types : voteStringTypes;

        const walletClient = await getWalletClientRequired(config);

        const message = omit(payload, 'privacy', 'type');

        const messageData = {
            timestamp: parseInt((Date.now() / 1e3).toFixed(), 10),
            ...message,
            choice:
                isShutter && ['quadratic', 'weighted'].includes(payload.type)
                    ? JSON.stringify(payload.choice)
                    : payload.choice,
            reason: message.reason ?? '',
            app: message.app ?? '',
            metadata: message.metadata ?? '{}',
        };

        const signedTypedData = await walletClient.signTypedData({
            domain: {
                name: NAME,
                version: VERSION,
            },
            types,
            primaryType: 'Vote',
            message: messageData,
        });

        const response = await fetchJSON<{ id?: string; ipfs?: string; error_description?: string }>(
            signedTypedData === '0x' ? SNAPSHOT_RELAY_URL : SNAPSHOT_SEQ_URL,
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    address: payload.from,
                    sig: signedTypedData,
                    data: {
                        domain: {
                            name: NAME,
                            version: VERSION,
                        },
                        message: messageData,
                        types,
                    },
                }),
            },
        );

        if (!response.ipfs) throw new Error(t`Failed to vote. ${response.error_description}`);

        return response.ipfs;
    }
}
