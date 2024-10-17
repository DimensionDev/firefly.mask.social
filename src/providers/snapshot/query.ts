export const VotesQuery = {
    operationName: 'Votes',
    query: `query Votes($id: String!, $first: Int, $skip: Int, $orderBy: String, $orderDirection: OrderDirection, $reason_not: String, $voter: String, $space: String, $created_gte: Int) {
        votes(
            first: $first
            skip: $skip
            where: {proposal: $id, vp_gt: 0, voter: $voter, space: $space, reason_not: $reason_not, created_gte: $created_gte}
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
