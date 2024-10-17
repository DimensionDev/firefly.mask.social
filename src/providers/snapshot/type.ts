export type SnapshotVote = {
    ipfs: string;
    voter: string;
    choice: number;
    vp: number;
    vp_by_strategy: number[];
    reason: string;
    created: number;
    voterDetail?: SnapshotUser;
    proposal: {
        choices: string[];
        symbol: string;
    };
};

export type SnapshotUser = {
    about: string;
    avatar: string;
    created: number;
    id: string;
    name: string;
};

export interface SnapshotVotes {
    data: {
        votes: SnapshotVote[];
    };
}

export interface SnapshotUsers {
    data: {
        users: SnapshotUser[];
    };
}
