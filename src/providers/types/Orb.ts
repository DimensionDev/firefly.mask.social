interface ClubMember {
    id: string;
    name: string;
    handle: string;
    namespace: string;
    picture: string;
}

export interface OrbResponse<T = unknown> {
    success: boolean;
    data: T;
    error?: string;
    msg?: string;
}

export interface Club {
    id: string;
    name: string;
    handle: string;
    logo: string;
    cover: string;
    description: string;
    categories: string[];
    totalMembers: number;
    admins: ClubMember[];
    moderators: unknown[];
    owner: ClubMember;
    publication: {
        publicationId: string;
        profileId: string;
        timestamp: number;
        profile: ClubMember;
    };
    isMember: boolean;
    isFreeToJoin: boolean;
    isRequestToJoin: boolean;
    joinClubCriteria: string;
}

export type FetchClubsResponse = OrbResponse<{
    items: Club[];
    pageInfo: {
        prev?: string;
        next?: string;
    };
}>;

export type JoinClubResponse = OrbResponse<{
    added: boolean;
    communityId: string;
    profileId: string;
}>;

export type LeaveClubResponse = OrbResponse<{
    communityId: string;
    profileId: string;
}>;
