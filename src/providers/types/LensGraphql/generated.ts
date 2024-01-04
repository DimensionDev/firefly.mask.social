/* cspell:disable */

import { gql } from '@apollo/client'
import * as Apollo from '@apollo/client'

export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K]
}

const defaultOptions = {} as const
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string }
  String: { input: string; output: string }
  Boolean: { input: boolean; output: boolean }
  Int: { input: number; output: number }
  Float: { input: number; output: number }
  AppId: { input: any; output: any }
  BlockchainData: { input: any; output: any }
  BroadcastId: { input: any; output: any }
  ChainId: { input: any; output: any }
  ChallengeId: { input: any; output: any }
  ContentEncryptionKey: { input: any; output: any }
  CreateHandle: { input: any; output: any }
  Cursor: { input: any; output: any }
  DateTime: { input: any; output: any }
  EncryptableDateTime: { input: any; output: any }
  EncryptableMarkdown: { input: any; output: any }
  EncryptableString: { input: any; output: any }
  EncryptableTxHash: { input: any; output: any }
  EncryptableURI: { input: any; output: any }
  EncryptedPath: { input: any; output: any }
  Ens: { input: any; output: any }
  EvmAddress: { input: any; output: any }
  Handle: { input: any; output: any }
  ImageSizeTransform: { input: any; output: any }
  Jwt: { input: any; output: any }
  Locale: { input: any; output: any }
  Markdown: { input: any; output: any }
  MimeType: { input: any; output: any }
  MomokaId: { input: any; output: any }
  MomokaProof: { input: any; output: any }
  NftGalleryId: { input: any; output: any }
  NftGalleryName: { input: any; output: any }
  Nonce: { input: any; output: any }
  OnchainPublicationId: { input: any; output: any }
  PoapEventId: { input: any; output: any }
  ProfileId: { input: any; output: any }
  PublicationId: { input: any; output: any }
  Signature: { input: any; output: any }
  TokenId: { input: any; output: any }
  TxHash: { input: any; output: any }
  TxId: { input: any; output: any }
  URI: { input: any; output: any }
  URL: { input: any; output: any }
  UUID: { input: any; output: any }
  UnixTimestamp: { input: any; output: any }
  Void: { input: any; output: any }
}

export type PaginatedResultInfo = {
  __typename?: 'PaginatedResultInfo'
  /** Cursor to query next results */
  next?: Maybe<Scalars['Cursor']['output']>
  /** Cursor to query the actual results */
  prev?: Maybe<Scalars['Cursor']['output']>
}

export const HandleInfoFieldsFragmentDoc = gql`
  fragment HandleInfoFields on HandleInfo {
    fullHandle
    localName
    suggestedFormatted {
      localName
    }
    linkedTo {
      nftTokenId
    }
  }
`
export const NetworkAddressFieldsFragmentDoc = gql`
  fragment NetworkAddressFields on NetworkAddress {
    address
    chainId
  }
`
export const ProfileOperationsFieldsFragmentDoc = gql`
  fragment ProfileOperationsFields on ProfileOperations {
    id
    isBlockedByMe {
      value
    }
    isFollowedByMe {
      value
    }
    isFollowingMe {
      value
    }
  }
`
export const ImageSetFieldsFragmentDoc = gql`
  fragment ImageSetFields on ImageSet {
    optimized {
      uri
    }
  }
`
export const MetadataAttributeFieldsFragmentDoc = gql`
  fragment MetadataAttributeFields on MetadataAttribute {
    type
    key
    value
  }
`
export const ProfileMetadataFieldsFragmentDoc = gql`
  fragment ProfileMetadataFields on ProfileMetadata {
    displayName
    bio
    rawURI
    appId
    picture {
      ... on ImageSet {
        ...ImageSetFields
      }
      ... on NftImage {
        image {
          optimized {
            uri
          }
        }
      }
    }
    coverPicture {
      ...ImageSetFields
    }
    attributes {
      ...MetadataAttributeFields
    }
  }
  ${ImageSetFieldsFragmentDoc}
  ${MetadataAttributeFieldsFragmentDoc}
`

export const ProfileStatsFieldsFragmentDoc = gql`
  fragment ProfileStatsFields on ProfileStats {
    id
    followers
    following
    comments
    posts
    mirrors
    quotes
  }
`

export const Erc20FieldsFragmentDoc = gql`
  fragment Erc20Fields on Asset {
    ... on Erc20 {
      name
      symbol
      decimals
      contract {
        ...NetworkAddressFields
      }
    }
  }
  ${NetworkAddressFieldsFragmentDoc}
`

export const AmountFieldsFragmentDoc = gql`
  fragment AmountFields on Amount {
    asset {
      ...Erc20Fields
    }
    value
  }
  ${Erc20FieldsFragmentDoc}
`

export const FollowModuleFieldsFragmentDoc = gql`
  fragment FollowModuleFields on FollowModule {
    ... on FeeFollowModuleSettings {
      type
      amount {
        ...AmountFields
      }
      recipient
    }
    ... on RevertFollowModuleSettings {
      type
    }
    ... on UnknownFollowModuleSettings {
      type
    }
  }
  ${AmountFieldsFragmentDoc}
`

export const ProfileFieldsFragmentDoc = gql`
  fragment ProfileFields on Profile {
    id
    handle {
      ...HandleInfoFields
    }
    ownedBy {
      ...NetworkAddressFields
    }
    signless
    sponsor
    createdAt
    stats {
      ...ProfileStatsFields
    }
    operations {
      ...ProfileOperationsFields
    }
    interests
    invitedBy {
      id
    }
    invitesLeft
    onchainIdentity {
      proofOfHumanity
      ens {
        name
      }
      sybilDotOrg {
        verified
        source {
          twitter {
            handle
          }
        }
      }
      worldcoin {
        isHuman
      }
    }
    followNftAddress {
      ...NetworkAddressFields
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
  ${ProfileStatsFieldsFragmentDoc}
  ${ProfileOperationsFieldsFragmentDoc}
  ${ProfileMetadataFieldsFragmentDoc}
  ${FollowModuleFieldsFragmentDoc}
`

export enum MetadataAttributeType {
  Boolean = 'BOOLEAN',
  Date = 'DATE',
  Json = 'JSON',
  Number = 'NUMBER',
  String = 'STRING'
}

export enum FollowModuleType {
  FeeFollowModule = 'FeeFollowModule',
  RevertFollowModule = 'RevertFollowModule',
  UnknownFollowModule = 'UnknownFollowModule'
}

export const ProfilesDocument = gql`
  query Profiles($request: ProfilesRequest!) {
    profiles(request: $request) {
      items {
        ...ProfileFields
      }
      pageInfo {
        next
      }
    }
  }
  ${ProfileFieldsFragmentDoc}
`

export type ProfilesQuery = {
  __typename?: 'Query'
  profiles: {
    __typename?: 'PaginatedProfileResult'
    items: Array<{
      __typename?: 'Profile'
      id: any
      signless: boolean
      sponsor: boolean
      createdAt: any
      interests: string[]
      invitesLeft: number
      handle?: {
        __typename?: 'HandleInfo'
        fullHandle: any
        localName: string
        suggestedFormatted: {
          __typename?: 'SuggestedFormattedHandle'
          localName: string
        }
        linkedTo?: { __typename?: 'HandleLinkedTo'; nftTokenId: any } | null
      } | null
      ownedBy: { __typename?: 'NetworkAddress'; address: any; chainId: any }
      stats: {
        __typename?: 'ProfileStats'
        id: any
        followers: number
        following: number
        comments: number
        posts: number
        mirrors: number
        quotes: number
      }
      operations: {
        __typename?: 'ProfileOperations'
        id: any
        isBlockedByMe: {
          __typename?: 'OptimisticStatusResult'
          value: boolean
        }
        isFollowedByMe: {
          __typename?: 'OptimisticStatusResult'
          value: boolean
        }
        isFollowingMe: {
          __typename?: 'OptimisticStatusResult'
          value: boolean
        }
      }
      invitedBy?: { __typename?: 'Profile'; id: any } | null
      onchainIdentity: {
        __typename?: 'ProfileOnchainIdentity'
        proofOfHumanity: boolean
        ens?: { __typename?: 'EnsOnchainIdentity'; name?: any | null } | null
        sybilDotOrg: {
          __typename?: 'SybilDotOrgIdentity'
          verified: boolean
          source?: {
            __typename?: 'SybilDotOrgIdentitySource'
            twitter: {
              __typename?: 'SybilDotOrgTwitterIdentity'
              handle?: string | null
            }
          } | null
        }
        worldcoin: { __typename?: 'WorldcoinIdentity'; isHuman: boolean }
      }
      followNftAddress?: {
        __typename?: 'NetworkAddress'
        address: any
        chainId: any
      } | null
      metadata?: {
        __typename?: 'ProfileMetadata'
        displayName?: string | null
        bio?: any | null
        rawURI: any
        appId?: any | null
        picture?:
          | {
              __typename?: 'ImageSet'
              optimized?: { __typename?: 'Image'; uri: any } | null
            }
          | {
              __typename?: 'NftImage'
              image: {
                __typename?: 'ImageSet'
                optimized?: { __typename?: 'Image'; uri: any } | null
              }
            }
          | null
        coverPicture?: {
          __typename?: 'ImageSet'
          optimized?: { __typename?: 'Image'; uri: any } | null
        } | null
        attributes?: Array<{
          __typename?: 'MetadataAttribute'
          type: MetadataAttributeType
          key: string
          value: string
        }> | null
      } | null
      followModule?:
        | {
            __typename?: 'FeeFollowModuleSettings'
            type: FollowModuleType
            recipient: any
            amount: {
              __typename?: 'Amount'
              value: string
              asset: {
                __typename?: 'Erc20'
                name: string
                symbol: string
                decimals: number
                contract: {
                  __typename?: 'NetworkAddress'
                  address: any
                  chainId: any
                }
              }
            }
          }
        | { __typename?: 'RevertFollowModuleSettings'; type: FollowModuleType }
        | { __typename?: 'UnknownFollowModuleSettings'; type: FollowModuleType }
        | null
    }>
    pageInfo: { __typename?: 'PaginatedResultInfo'; next?: any | null }
  }
}

export enum LimitType {
  Fifty = 'Fifty',
  Ten = 'Ten',
  TwentyFive = 'TwentyFive'
}

export type ProfilesRequestWhere = {
  /** Pass in an array of handles to get the profile entities */
  handles?: InputMaybe<Array<Scalars['Handle']['input']>>
  /** Pass in an array of evm address to get the profile entities they own */
  ownedBy?: InputMaybe<Array<Scalars['EvmAddress']['input']>>
  /** Pass in an array of profile ids to get the profile entities */
  profileIds?: InputMaybe<Array<Scalars['ProfileId']['input']>>
  /** Pass the publication id and get a list of the profiles who commented on it */
  whoCommentedOn?: InputMaybe<Scalars['PublicationId']['input']>
  /** Pass the publication id and get a list of the profiles who mirrored it */
  whoMirroredPublication?: InputMaybe<Scalars['PublicationId']['input']>
  /** Pass the publication id and get a list of the profiles who quoted it */
  whoQuotedPublication?: InputMaybe<Scalars['PublicationId']['input']>
}

export type ProfilesRequest = {
  cursor?: InputMaybe<Scalars['Cursor']['input']>
  limit?: InputMaybe<LimitType>
  /** The where clause to use to filter on what you are looking for */
  where: ProfilesRequestWhere
}

export type ProfilesQueryVariables = Exact<{
  request: ProfilesRequest
}>

export function useProfilesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ProfilesQuery,
    ProfilesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useLazyQuery<ProfilesQuery, ProfilesQueryVariables>(
    ProfilesDocument,
    options
  )
}

export interface PossibleTypesResultData {
  possibleTypes: {
    [key: string]: string[]
  }
}

export type NetworkAddress = {
  __typename?: 'NetworkAddress'
  address: Scalars['EvmAddress']['output']
  chainId: Scalars['ChainId']['output']
}

export type HandleLinkedTo = {
  __typename?: 'HandleLinkedTo'
  /** The contract address it is linked to */
  contract: NetworkAddress
  /** The nft token id it is linked to (this can be the profile Id) */
  nftTokenId: Scalars['TokenId']['output']
}

export type SuggestedFormattedHandle = {
  __typename?: 'SuggestedFormattedHandle'
  /** The full formatted handle - namespace/@localname */
  full: Scalars['String']['output']
  /** The formatted handle - @localname */
  localName: Scalars['String']['output']
}

export type HandleInfo = {
  __typename?: 'HandleInfo'
  /** The full handle - namespace/localname */
  fullHandle: Scalars['Handle']['output']
  /** The handle nft token id */
  id: Scalars['TokenId']['output']
  /** If null its not linked to anything */
  linkedTo?: Maybe<HandleLinkedTo>
  /** The localname */
  localName: Scalars['String']['output']
  /** The namespace */
  namespace: Scalars['String']['output']
  ownedBy: Scalars['EvmAddress']['output']
  /** The suggested format to use on UI for ease but you can innovate and slice and dice as you want */
  suggestedFormatted: SuggestedFormattedHandle
}

export type Erc20 = {
  __typename?: 'Erc20'
  /** The erc20 address */
  contract: NetworkAddress
  /** Decimal places for the token */
  decimals: Scalars['Int']['output']
  /** Name of the symbol */
  name: Scalars['String']['output']
  /** Symbol for the token */
  symbol: Scalars['String']['output']
}

export type Asset = Erc20

export type Fiat = {
  __typename?: 'Fiat'
  decimals: Scalars['Int']['output']
  name: Scalars['String']['output']
  symbol: Scalars['String']['output']
}

export type FiatAmount = {
  __typename?: 'FiatAmount'
  asset: Fiat
  value: Scalars['String']['output']
}

export type Amount = {
  __typename?: 'Amount'
  /** The asset */
  asset: Asset
  rate?: Maybe<FiatAmount>
  /** Floating point number as string (e.g. 42.009837). It could have the entire precision of the Asset or be truncated to the last significant decimal. */
  value: Scalars['String']['output']
}

export type FeeFollowModuleSettings = {
  __typename?: 'FeeFollowModuleSettings'
  /** The amount info */
  amount: Amount
  contract: NetworkAddress
  /** The module recipient address */
  recipient: Scalars['EvmAddress']['output']
  type: FollowModuleType
}
export type RevertFollowModuleSettings = {
  __typename?: 'RevertFollowModuleSettings'
  contract: NetworkAddress
  type: FollowModuleType
}

export type UnknownFollowModuleSettings = {
  __typename?: 'UnknownFollowModuleSettings'
  contract: NetworkAddress
  /** The data used to setup the module which you can decode with your known ABI  */
  followModuleReturnData?: Maybe<Scalars['BlockchainData']['output']>
  type: FollowModuleType
}

export type FollowModule =
  | FeeFollowModuleSettings
  | RevertFollowModuleSettings
  | UnknownFollowModuleSettings

export type ProfileGuardianResult = {
  __typename?: 'ProfileGuardianResult'
  cooldownEndsOn?: Maybe<Scalars['DateTime']['output']>
  protected: Scalars['Boolean']['output']
}

export type MetadataAttribute = {
  __typename?: 'MetadataAttribute'
  key: Scalars['String']['output']
  /**
   * The type of the attribute. When:
   * - BOOLEAN: the `value` is `true`|`false`
   * - DATE: the `value` is a valid ISO 8601 date string
   * - NUMBER: the `value` is a valid JS number as string
   * - STRING: the `value` is a string.
   * - JSON: the `value` is a valid JSON serialized as string
   *
   */
  type: MetadataAttributeType
  /** The value serialized as string. It's consumer responsibility to parse it according to `type`. */
  value: Scalars['String']['output']
}

export type Image = {
  __typename?: 'Image'
  /** Height of the image */
  height?: Maybe<Scalars['Int']['output']>
  /** MIME type of the image */
  mimeType?: Maybe<Scalars['MimeType']['output']>
  uri: Scalars['URI']['output']
  /** Width of the image */
  width?: Maybe<Scalars['Int']['output']>
}

export type ImageSet = {
  __typename?: 'ImageSet'
  optimized?: Maybe<Image>
  raw: Image
  transformed?: Maybe<Image>
}

export type NftImage = {
  __typename?: 'NftImage'
  /** The contract address of the NFT collection */
  collection: NetworkAddress
  /** The image set for the NFT */
  image: ImageSet
  /** The token ID of the NFT */
  tokenId: Scalars['TokenId']['output']
  /** Indicates whether the NFT is from a verified collection or not */
  verified: Scalars['Boolean']['output']
}

export type ProfilePicture = ImageSet | NftImage

export type ProfileMetadata = {
  __typename?: 'ProfileMetadata'
  /** The app that this metadata is displayed on */
  appId?: Maybe<Scalars['AppId']['output']>
  /** Profile Custom attributes */
  attributes?: Maybe<MetadataAttribute[]>
  /** The bio for the profile */
  bio?: Maybe<Scalars['Markdown']['output']>
  /** The cover picture for the profile */
  coverPicture?: Maybe<ImageSet>
  /** The display name for the profile */
  displayName?: Maybe<Scalars['String']['output']>
  /** The picture for the profile */
  picture?: Maybe<ProfilePicture>
  /** The raw uri for the which the profile metadata was set as */
  rawURI: Scalars['URI']['output']
}

export type EnsOnchainIdentity = {
  __typename?: 'EnsOnchainIdentity'
  /** The default ens mapped to this address */
  name?: Maybe<Scalars['Ens']['output']>
}

export type SybilDotOrgIdentity = {
  __typename?: 'SybilDotOrgIdentity'
  source?: Maybe<SybilDotOrgIdentitySource>
  /** The sybil dot org status */
  verified: Scalars['Boolean']['output']
}

export type SybilDotOrgIdentitySource = {
  __typename?: 'SybilDotOrgIdentitySource'
  twitter: SybilDotOrgTwitterIdentity
}

export type SybilDotOrgTwitterIdentity = {
  __typename?: 'SybilDotOrgTwitterIdentity'
  handle?: Maybe<Scalars['String']['output']>
}

export type ProfileOnchainIdentity = {
  __typename?: 'ProfileOnchainIdentity'
  /** The ens information */
  ens?: Maybe<EnsOnchainIdentity>
  /** The POH status */
  proofOfHumanity: Scalars['Boolean']['output']
  /** The sybil dot org information */
  sybilDotOrg: SybilDotOrgIdentity
  /** The worldcoin identity */
  worldcoin: WorldcoinIdentity
}

export type WorldcoinIdentity = {
  __typename?: 'WorldcoinIdentity'
  /** If the profile has verified as a user */
  isHuman: Scalars['Boolean']['output']
}

export enum TriStateValue {
  No = 'NO',
  Unknown = 'UNKNOWN',
  Yes = 'YES'
}

export type OptimisticStatusResult = {
  __typename?: 'OptimisticStatusResult'
  isFinalisedOnchain: Scalars['Boolean']['output']
  value: Scalars['Boolean']['output']
}

export type ProfileOperations = {
  __typename?: 'ProfileOperations'
  canBlock: Scalars['Boolean']['output']
  canFollow: TriStateValue
  canUnblock: Scalars['Boolean']['output']
  canUnfollow: Scalars['Boolean']['output']
  hasBlockedMe: OptimisticStatusResult
  id: Scalars['ProfileId']['output']
  isBlockedByMe: OptimisticStatusResult
  isFollowedByMe: OptimisticStatusResult
  isFollowingMe: OptimisticStatusResult
}

/** The Profile Stats */
export type ProfileStats = {
  __typename?: 'ProfileStats'
  comments: Scalars['Int']['output']
  countOpenActions: Scalars['Int']['output']
  followers: Scalars['Int']['output']
  following: Scalars['Int']['output']
  id: Scalars['ProfileId']['output']
  mirrors: Scalars['Int']['output']
  posts: Scalars['Int']['output']
  publications: Scalars['Int']['output']
  quotes: Scalars['Int']['output']
  /** How many times a profile has reacted on something */
  reacted: Scalars['Int']['output']
  /** How many times other profiles have reacted on something this profile did */
  reactions: Scalars['Int']['output']
}

/** The Profile */
export type Profile = {
  __typename?: 'Profile'
  /** When the profile was created */
  createdAt: Scalars['DateTime']['output']
  /** The follow module */
  followModule?: Maybe<FollowModule>
  /** The profile follow nft address */
  followNftAddress?: Maybe<NetworkAddress>
  guardian?: Maybe<ProfileGuardianResult>
  /** The profile handle - a profile may not have one */
  handle?: Maybe<HandleInfo>
  /** The profile id */
  id: Scalars['ProfileId']['output']
  interests: Array<Scalars['String']['output']>
  invitedBy?: Maybe<Profile>
  /** The number of invites left */
  invitesLeft: Scalars['Int']['output']
  /** The profile metadata. You can optionally query profile metadata by app id.  */
  metadata?: Maybe<ProfileMetadata>
  /** The on chain identity */
  onchainIdentity: ProfileOnchainIdentity
  operations: ProfileOperations
  /** Who owns the profile */
  ownedBy: NetworkAddress
  /** If the profile has got signless enabled */
  signless: Scalars['Boolean']['output']
  /** If lens API will sponsor this persons for gasless experience, note they can have signless on but sponsor false which means it be rejected */
  sponsor: Scalars['Boolean']['output']
  stats: ProfileStats
  txHash: Scalars['TxHash']['output']
}
