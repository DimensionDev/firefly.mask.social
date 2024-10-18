export const VotesQuery = {
    operationName: 'Votes',
    query: `query Votes($id: String, $ids: [String], $first: Int, $skip: Int, $orderBy: String, $orderDirection: OrderDirection, $reason_not: String, $voter: String, $space: String, $created_gte: Int) {
        votes(
            first: $first
            skip: $skip
            where: {proposal: $id, proposal_in: $ids, vp_gt: 0, voter: $voter, space: $space, reason_not: $reason_not, created_gte: $created_gte}
            orderBy: $orderBy
            orderDirection: $orderDirection
        ) {
            ipfs
            voter
            choice
            vp
            vp_by_strategy
            reason
            created
            metadata
            proposal {
                choices
                symbol
                id
                type
            }
        }
    }`,
};

export const UsersQuery = {
    operationName: 'Users',
    query: `query Users($addresses: [String]!, $first: Int, $skip: Int) {
        users(first: $first, skip: $skip, where: {id_in: $addresses}) {
            id
            name
            about
            avatar
            created
        }
    }`,
};

export const ProposalQuery = {
    operationName: 'Proposal',
    query: `query Proposal($id: String!) {
        proposal(id: $id) {
            id
            ipfs
            title
            body
            discussion
            choices
            start
            end
            snapshot
            state
            author
            link
            created
            plugins
            network
            type
            quorum
            quorumType
            symbol
            privacy
            validation {
                name
                params
            }
            strategies {
                name
                network
                params
            }
            space {
                id
                name
                avatar
            }
            scores_state
            scores
            scores_by_strategy
            scores_total
            votes
            flagged
    }
    }`,
};

export const ProposalsQuery = {
    operationName: 'Proposals',
    query: `query Proposals($first: Int, $state: String, $space_in: [String], $start_gte: Int, $id_in: [String]) {
        proposals(
            first: $first
            where: {state: $state, space_in: $space_in, start_gte: $start_gte, id_in: $id_in}
        ) {
            id
            ipfs
            title
            body
            discussion
            choices
            start
            end
            snapshot
            state
            author
            link
            created
            plugins
            network
            type
            quorum
            quorumType
            symbol
            privacy
            validation {
                name
                params
            }
            strategies {
                name
                network
                params
            }
            space {
                id
                name
                avatar
            }
            scores_state
            scores
            scores_by_strategy
            scores_total
            votes
            flagged
        }
    }`,
};
