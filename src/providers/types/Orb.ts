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
}

export type FetchClubsResponse = OrbResponse<{
    items: Club[];
    pageInfo: {
        prev?: string;
        next?: string;
    };
}>;
