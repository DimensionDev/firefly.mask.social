export interface Provider<Config, AddressLike, HashLike> {
    _config: Config;
    connect: () => Promise<void>;
    getAccount: () => Promise<AddressLike>;
    switchChain: (chainId: number) => Promise<void>;
    getChainId: () => number;
    getAddressUrl: (chainId: number, address: AddressLike) => string | undefined;
    getTransactionUrl: (chainId: number, hash: HashLike) => string | undefined;
}
