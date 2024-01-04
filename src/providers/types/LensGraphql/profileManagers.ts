import { ApolloClient, gql, InMemoryCache } from '@apollo/client';

import {
    type Exact,
    FollowModuleFieldsFragmentDoc,
    FollowModuleType,
    HandleInfoFieldsFragmentDoc,
    type InputMaybe,
    LimitType,
    MetadataAttributeType,
    NetworkAddressFieldsFragmentDoc,
    ProfileFieldsFragmentDoc,
    ProfileMetadataFieldsFragmentDoc,
    ProfileOperationsFieldsFragmentDoc,
    ProfilesDocument,
    type ProfilesQuery,
    type ProfilesQueryVariables,
    type ProfilesRequest,
    type Scalars,
} from './generated.js';

const API_URL = 'https://api-v2.lens.dev/';

const apolloClient = new ApolloClient({
    uri: API_URL,
    cache: new InMemoryCache(),
});

export type ProfilesManagedQuery = {
    __typename?: 'Query';
    profilesManaged: {
        __typename?: 'PaginatedProfileResult';
        items: Array<{
            __typename?: 'Profile';
            id: any;
            handle?: {
                __typename?: 'HandleInfo';
                fullHandle: any;
                localName: string;
                suggestedFormatted: {
                    __typename?: 'SuggestedFormattedHandle';
                    localName: string;
                };
                linkedTo?: { __typename?: 'HandleLinkedTo'; nftTokenId: any } | null;
            } | null;
            ownedBy: { __typename?: 'NetworkAddress'; address: any; chainId: any };
            operations: {
                __typename?: 'ProfileOperations';
                id: any;
                isBlockedByMe: {
                    __typename?: 'OptimisticStatusResult';
                    value: boolean;
                };
                isFollowedByMe: {
                    __typename?: 'OptimisticStatusResult';
                    value: boolean;
                };
                isFollowingMe: {
                    __typename?: 'OptimisticStatusResult';
                    value: boolean;
                };
            };
            metadata?: {
                __typename?: 'ProfileMetadata';
                displayName?: string | null;
                bio?: any | null;
                rawURI: any;
                appId?: any | null;
                picture?:
                    | {
                          __typename?: 'ImageSet';
                          optimized?: { __typename?: 'Image'; uri: any } | null;
                      }
                    | {
                          __typename?: 'NftImage';
                          image: {
                              __typename?: 'ImageSet';
                              optimized?: { __typename?: 'Image'; uri: any } | null;
                          };
                      }
                    | null;
                coverPicture?: {
                    __typename?: 'ImageSet';
                    optimized?: { __typename?: 'Image'; uri: any } | null;
                } | null;
                attributes?: Array<{
                    __typename?: 'MetadataAttribute';
                    type: MetadataAttributeType;
                    key: string;
                    value: string;
                }> | null;
            } | null;
            followModule?:
                | {
                      __typename?: 'FeeFollowModuleSettings';
                      type: FollowModuleType;
                      recipient: any;
                      amount: {
                          __typename?: 'Amount';
                          value: string;
                          asset: {
                              __typename?: 'Erc20';
                              name: string;
                              symbol: string;
                              decimals: number;
                              contract: {
                                  __typename?: 'NetworkAddress';
                                  address: any;
                                  chainId: any;
                              };
                          };
                      };
                  }
                | { __typename?: 'RevertFollowModuleSettings'; type: FollowModuleType }
                | { __typename?: 'UnknownFollowModuleSettings'; type: FollowModuleType }
                | null;
        }>;
        pageInfo: { __typename?: 'PaginatedResultInfo'; next?: any | null };
    };
    lastLoggedInProfile?: {
        __typename?: 'Profile';
        id: any;
        handle?: {
            __typename?: 'HandleInfo';
            fullHandle: any;
            localName: string;
            suggestedFormatted: {
                __typename?: 'SuggestedFormattedHandle';
                localName: string;
            };
            linkedTo?: { __typename?: 'HandleLinkedTo'; nftTokenId: any } | null;
        } | null;
        ownedBy: { __typename?: 'NetworkAddress'; address: any; chainId: any };
        operations: {
            __typename?: 'ProfileOperations';
            id: any;
            isBlockedByMe: { __typename?: 'OptimisticStatusResult'; value: boolean };
            isFollowedByMe: { __typename?: 'OptimisticStatusResult'; value: boolean };
            isFollowingMe: { __typename?: 'OptimisticStatusResult'; value: boolean };
        };
        metadata?: {
            __typename?: 'ProfileMetadata';
            displayName?: string | null;
            bio?: any | null;
            rawURI: any;
            appId?: any | null;
            picture?:
                | {
                      __typename?: 'ImageSet';
                      optimized?: { __typename?: 'Image'; uri: any } | null;
                  }
                | {
                      __typename?: 'NftImage';
                      image: {
                          __typename?: 'ImageSet';
                          optimized?: { __typename?: 'Image'; uri: any } | null;
                      };
                  }
                | null;
            coverPicture?: {
                __typename?: 'ImageSet';
                optimized?: { __typename?: 'Image'; uri: any } | null;
            } | null;
            attributes?: Array<{
                __typename?: 'MetadataAttribute';
                type: MetadataAttributeType;
                key: string;
                value: string;
            }> | null;
        } | null;
        followModule?:
            | {
                  __typename?: 'FeeFollowModuleSettings';
                  type: FollowModuleType;
                  recipient: any;
                  amount: {
                      __typename?: 'Amount';
                      value: string;
                      asset: {
                          __typename?: 'Erc20';
                          name: string;
                          symbol: string;
                          decimals: number;
                          contract: {
                              __typename?: 'NetworkAddress';
                              address: any;
                              chainId: any;
                          };
                      };
                  };
              }
            | { __typename?: 'RevertFollowModuleSettings'; type: FollowModuleType }
            | { __typename?: 'UnknownFollowModuleSettings'; type: FollowModuleType }
            | null;
    } | null;
};

export const ListProfileFieldsFragmentDoc = gql`
    fragment ListProfileFields on Profile {
        id
        handle {
            ...HandleInfoFields
        }
        ownedBy {
            ...NetworkAddressFields
        }
        operations {
            ...ProfileOperationsFields
        }
        metadata {
            ...ProfileMetadataFields
        }
        followModule {
            ...FollowModuleFields
        }
    }
    ${HandleInfoFieldsFragmentDoc}
    ${NetworkAddressFieldsFragmentDoc}
    ${ProfileOperationsFieldsFragmentDoc}
    ${ProfileMetadataFieldsFragmentDoc}
    ${FollowModuleFieldsFragmentDoc}
`;

export const ProfilesManagedDocument = gql`
    query ProfilesManaged(
        $profilesManagedRequest: ProfilesManagedRequest!
        $lastLoggedInProfileRequest: LastLoggedInProfileRequest!
    ) {
        profilesManaged(request: $profilesManagedRequest) {
            items {
                ...ListProfileFields
            }
            pageInfo {
                next
            }
        }
        lastLoggedInProfile(request: $lastLoggedInProfileRequest) {
            ...ListProfileFields
        }
    }
    ${ListProfileFieldsFragmentDoc}
`;

export type ProfilesManagedRequest = {
    cursor?: InputMaybe<Scalars['Cursor']['input']>;
    /** The Ethereum address for which to retrieve managed profiles */
    for: Scalars['EvmAddress']['input'];
    includeOwned?: InputMaybe<Scalars['Boolean']['input']>;
    limit?: InputMaybe<LimitType>;
};

export type ProfilesManagedQueryVariables = Exact<{
    profilesManagedRequest: ProfilesManagedRequest;
    lastLoggedInProfileRequest: LastLoggedInProfileRequest;
}>;

export type LastLoggedInProfileRequest = {
    for: Scalars['EvmAddress']['input'];
};

export type CurrentProfileQuery = {
    __typename?: 'Query';
    profile?: {
        __typename?: 'Profile';
        id: any;
        signless: boolean;
        sponsor: boolean;
        createdAt: any;
        interests: string[];
        invitesLeft: number;
        handle?: {
            __typename?: 'HandleInfo';
            fullHandle: any;
            localName: string;
            suggestedFormatted: {
                __typename?: 'SuggestedFormattedHandle';
                localName: string;
            };
            linkedTo?: { __typename?: 'HandleLinkedTo'; nftTokenId: any } | null;
        } | null;
        ownedBy: { __typename?: 'NetworkAddress'; address: any; chainId: any };
        stats: {
            __typename?: 'ProfileStats';
            id: any;
            followers: number;
            following: number;
            comments: number;
            posts: number;
            mirrors: number;
            quotes: number;
        };
        operations: {
            __typename?: 'ProfileOperations';
            id: any;
            isBlockedByMe: {
                __typename?: 'OptimisticStatusResult';
                value: boolean;
            };
            isFollowedByMe: {
                __typename?: 'OptimisticStatusResult';
                value: boolean;
            };
            isFollowingMe: {
                __typename?: 'OptimisticStatusResult';
                value: boolean;
            };
        };
        invitedBy?: { __typename?: 'Profile'; id: any } | null;
        onchainIdentity: {
            __typename?: 'ProfileOnchainIdentity';
            proofOfHumanity: boolean;
            ens?: { __typename?: 'EnsOnchainIdentity'; name?: any | null } | null;
            sybilDotOrg: {
                __typename?: 'SybilDotOrgIdentity';
                verified: boolean;
                source?: {
                    __typename?: 'SybilDotOrgIdentitySource';
                    twitter: {
                        __typename?: 'SybilDotOrgTwitterIdentity';
                        handle?: string | null;
                    };
                } | null;
            };
            worldcoin: { __typename?: 'WorldcoinIdentity'; isHuman: boolean };
        };
        followNftAddress?: {
            __typename?: 'NetworkAddress';
            address: any;
            chainId: any;
        } | null;
        metadata?: {
            __typename?: 'ProfileMetadata';
            displayName?: string | null;
            bio?: any | null;
            rawURI: any;
            appId?: any | null;
            picture?:
                | {
                      __typename?: 'ImageSet';
                      optimized?: { __typename?: 'Image'; uri: any } | null;
                  }
                | {
                      __typename?: 'NftImage';
                      image: {
                          __typename?: 'ImageSet';
                          optimized?: { __typename?: 'Image'; uri: any } | null;
                      };
                  }
                | null;
            coverPicture?: {
                __typename?: 'ImageSet';
                optimized?: { __typename?: 'Image'; uri: any } | null;
            } | null;
            attributes?: Array<{
                __typename?: 'MetadataAttribute';
                type: MetadataAttributeType;
                key: string;
                value: string;
            }> | null;
        } | null;
        followModule?:
            | {
                  __typename?: 'FeeFollowModuleSettings';
                  type: FollowModuleType;
                  recipient: any;
                  amount: {
                      __typename?: 'Amount';
                      value: string;
                      asset: {
                          __typename?: 'Erc20';
                          name: string;
                          symbol: string;
                          decimals: number;
                          contract: {
                              __typename?: 'NetworkAddress';
                              address: any;
                              chainId: any;
                          };
                      };
                  };
              }
            | { __typename?: 'RevertFollowModuleSettings'; type: FollowModuleType }
            | { __typename?: 'UnknownFollowModuleSettings'; type: FollowModuleType }
            | null;
        txHash: any | null;
    } | null;
    userSigNonces: { __typename?: 'UserSigNonces'; lensHubOnchainSigNonce: any };
};

export type ProfileRequest = {
    /** The handle for profile you want to fetch - namespace/localname */
    forHandle?: InputMaybe<Scalars['Handle']['input']>;
    /** The profile you want to fetch */
    forProfileId?: InputMaybe<Scalars['ProfileId']['input']>;
};

export type CurrentProfileQueryVariables = Exact<{
    request: ProfileRequest;
}>;

export const CurrentProfileDocument = gql`
    query CurrentProfile($request: ProfileRequest!) {
        profile(request: $request) {
            ...ProfileFields
            guardian {
                protected
                cooldownEndsOn
            }
        }
        userSigNonces {
            lensHubOnchainSigNonce
        }
    }
    ${ProfileFieldsFragmentDoc}
`;

export const profilesManagedQuery = (request: ProfilesManagedRequest | LastLoggedInProfileRequest) => {
    return apolloClient.query<ProfilesManagedQuery, ProfilesManagedQueryVariables>({
        query: ProfilesManagedDocument,
        variables: {
            profilesManagedRequest: request,
            lastLoggedInProfileRequest: request,
        },
        fetchPolicy: 'no-cache',
    });
};

export const profileQuery = (request: ProfilesRequest) => {
    return apolloClient.query<ProfilesQuery, ProfilesQueryVariables>({
        query: ProfilesDocument,
        variables: {
            request,
        },
    });
};

export const currentProfileQuery = (request: ProfileRequest) => {
    return apolloClient.query<CurrentProfileQuery, CurrentProfileQueryVariables>({
        query: CurrentProfileDocument,
        variables: {
            request,
        },
    });
};
