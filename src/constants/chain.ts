/* cspell:disable */

export enum SUPPORTED_EVM_CHAIN_IDS {
    // Mainnet
    Mainnet = 1,
    Ropsten = 3,
    Rinkeby = 4,
    Gorli = 5,
    Kovan = 42,

    // Base
    Base = 8453,
    Base_Goerli = 84531,

    // BSC
    BSC = 56,
    BSCT = 97,

    // Matic
    Matic = 137,
    Mumbai = 80001,

    // Arbitrum
    Arbitrum = 42161,
    Arbitrum_Rinkeby = 421611,
    Arbitrum_Nova = 42170,

    // xDai
    xDai = 100,

    // Avalanche
    Avalanche = 43114,
    Avalanche_Fuji = 43113,

    // Celo
    Celo = 42220,

    // Fantom
    Fantom = 250,

    // Aurora
    Aurora = 1313161554,
    Aurora_Testnet = 1313161555,

    // Fuse
    Fuse = 122,

    // Boba
    Boba = 288,

    // Metis
    Metis = 1088,
    Metis_Sepolia = 59902,

    // Optimism
    Optimism = 10,
    Optimism_Kovan = 69,
    Optimism_Goerli = 420,

    // Conflux
    Conflux = 1030,

    // Astar
    Astar = 592,

    Scroll = 534352,

    ZKSync_Alpha_Testnet = 280,

    Crossbell = 3737,

    Moonbeam = 1284,

    Pulse = 369,

    Klaytn = 8217,

    Harmony = 1666600000,

    Moonriver = 1285,

    Cronos = 25,

    Brise = 32520,

    Canto = 7700,

    DFK = 53935,

    Doge = 2000,

    Evmos = 9001,

    HuobiEco = 128,

    IoTex = 4689,

    Kava = 2222,

    Kcc = 321,

    Milkomeda = 2001,

    OKXChain = 66,

    Palm = 11297108109,

    RSK = 30,

    SmartBitcoinCash = 10000,

    Shiden = 336,

    SongbirdCanary = 19,

    Step = 1234,

    Telos = 40,

    Wanchain = 888,

    XLayer = 196,
    XLayer_Testnet = 195,

    /** BitTorrent Chain Mainnet */
    BitTorrent = 199,

    // For any chains not supported yet.
    Invalid = 0,

    Zora = 7777777,

    ZkSyncEra = 324,

    Linea = 59144,
}

export enum SUPPORTED_SOLANA_CHAIN_IDS {
    Mainnet = 101,
    Testnet = 102,
    Devnet = 103,
}
