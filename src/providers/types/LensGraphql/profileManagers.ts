/* cspell:disable */

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
    ProfileMetadataFieldsFragmentDoc,
    ProfileOperationsFieldsFragmentDoc,
    type Scalars,
} from './generated.js';

const API_URL = 'https://api-v2.lens.dev/';

const apolloClient = new ApolloClient({
    uri: API_URL,
    cache: new InMemoryCache(),
});

export type ProfilesManagedQuery = {
    __typename?: 'Query';
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

export type ProfileRequest = {
    /** The handle for profile you want to fetch - namespace/localname */
    forHandle?: InputMaybe<Scalars['Handle']['input']>;
    /** The profile you want to fetch */
    forProfileId?: InputMaybe<Scalars['ProfileId']['input']>;
};

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
