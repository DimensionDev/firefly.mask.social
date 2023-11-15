export enum MessageType {
    MESSAGE_TYPE_NONE = 0,
    MESSAGE_TYPE_CAST_ADD = 1, // Add a new Cast
    MESSAGE_TYPE_CAST_REMOVE = 2, // Remove a previously added Cast
    MESSAGE_TYPE_REACTION_ADD = 3, // Add a Reaction to a Cast
    MESSAGE_TYPE_REACTION_REMOVE = 4, // Remove a Reaction previously added to a Cast
    MESSAGE_TYPE_LINK_ADD = 5, // Add a new Link
    MESSAGE_TYPE_LINK_REMOVE = 6, // Remove an existing Link
    MESSAGE_TYPE_VERIFICATION_ADD_ETH_ADDRESS = 7, // Add an Ethereum Address Verification
    MESSAGE_TYPE_VERIFICATION_REMOVE = 8, // Remove a previously added Verification
    MESSAGE_TYPE_USER_DATA_ADD = 11, // Add metadata about a user
    MESSAGE_TYPE_USERNAME_PROOF = 12, // Prove ownership of a username
}

export enum FarcasterNetwork {
    FARCASTER_NETWORK_NONE = 0,
    FARCASTER_NETWORK_MAINNET = 1, // Public, stable primary network
    FARCASTER_NETWORK_TESTNET = 2, // Public, stable test network
    FARCASTER_NETWORK_DEVNET = 3, // Public, unstable test network
}

export enum SignatureScheme {
    SIGNATURE_SCHEME_NONE = 0,
    SIGNATURE_SCHEME_ED25519 = 1,
    SIGNATURE_SCHEME_EIP712 = 2,
}

export enum HashScheme {
    HASH_SCHEME_NONE = 0,
    HASH_SCHEME_BLAKE3 = 1,
}

interface MessageData {
    type: MessageType;
    fid: number;
    timestamp: number;
    network: FarcasterNetwork;
    body: MessageBody;
}

export interface Message {
    data: MessageData;
    hash: string;
    hashScheme: HashScheme;
    signature: string;
    signatureScheme: SignatureScheme;
    signer: string;
    dataBytes?: string;
}

export interface CastAddBody {
    embeds_deprecated: string[];
    mentions: number[];
    parent_cast_id: string;
    parent_url: string;
    text: string;
    mentions_positions: number[];
    embeds: Embed[];
}

export interface CastRemoveBody {
    target_hash: string;
}

export interface ReactionBody {
    type: ReactionType;
    target_cast_id: string;
    target_url: string;
}

export interface VerificationAddEthAddressBody {
    address: string;
    eth_signature: string;
    block_hash: string;
}

export interface UserDataBody {
    type: UserDataType;
    value: string;
}

export interface LinkBody {
    type: string;
    displayTimestamp?: number;
    target_fid: number;
}

export interface Embed {
    url: string;
    cast_id: string;
}

type MessageBody =
    | CastAddBody
    | CastRemoveBody
    | ReactionBody
    | VerificationAddEthAddressBody
    | UserDataBody
    | LinkBody;

enum ReactionType {
    REACTION_TYPE_NONE = 0, // Invalid default value
    REACTION_TYPE_LIKE = 1, // Like the target cast
    REACTION_TYPE_RECAST = 2, // Share target cast to the user's audience
}

enum UserDataType {
    USER_DATA_TYPE_NONE = 0, // Invalid default value
    USER_DATA_TYPE_PFP = 1, // Profile Picture for the user
    USER_DATA_TYPE_DISPLAY = 2, // Display Name for the user
    USER_DATA_TYPE_BIO = 3, // Bio for the user
    USER_DATA_TYPE_URL = 5, // URL of the user
    USER_DATA_TYPE_USERNAME = 6, // Preferred Farcaster Name for the user
}
