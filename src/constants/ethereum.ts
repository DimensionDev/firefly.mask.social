export enum ChainId {
    Mainnet = 1,
    Base = 8453,
    BSC = 56,
    Degen = 666666666,
    Polygon = 137,
    Optimism = 10,
    Arbitrum = 42161,
    Gnosis = 100, // xdai
    Avalanche = 43114,
    Aurora = 1313161554,
    Conflux = 1030,
    Fantom = 250,
    XLayer = 196,
    Metis = 1088,
    Zora = 7777777,
}

export enum SchemaType {
    Native = 1,
    ERC20 = 2,
    ERC721 = 3,
    ERC1155 = 4,
    SBT = 5,
}

export enum ProviderType {
    CustomEvent = 'CustomEvent',
}

export enum MethodType {
    ETH_CHAIN_ID = 'eth_chainId',
    ETH_ACCOUNTS = 'eth_accounts',
    PERSONAL_SIGN = 'personal_sign',
    ETH_REQUEST_ACCOUNTS = 'eth_requestAccounts',
    ETH_SEND_TRANSACTION = 'eth_sendTransaction',
    ETH_SEND_RAW_TRANSACTION = 'eth_sendRawTransaction',
    // https://eips.ethereum.org/EIPS/eip-3085
    WALLET_ADD_ETHEREUM_CHAIN = 'wallet_addEthereumChain',
    // https://eips.ethereum.org/EIPS/eip-3326
    WALLET_SWITCH_ETHEREUM_CHAIN = 'wallet_switchEthereumChain',
}

export interface RequestArguments {
    method: MethodType;
    params: any[];
}
