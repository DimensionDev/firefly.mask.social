export type GoPlusResponse<T> = {
    code: 0 | 1;
    message: 'OK' | string;
    result: T;
};
type BooleanChar = '0' | '1';

export interface Holder {
    address?: string;
    locked?: BooleanChar;
    tag?: string;
    is_contract?: BooleanChar;
    balance?: number;
    percent?: number;
}

export interface TokenSecurity {
    token_name?: string;
    token_symbol?: string;

    holder_count?: number;
    total_supply?: number;
    holders?: Holder[];

    lp_holder_count?: number;
    lp_total_supply?: number;
    lp_holders?: Holder[];

    is_true_token?: BooleanChar;
    is_verifiable_team?: BooleanChar;
    is_airdrop_scam?: BooleanChar;
}

export interface ContractSecurity {
    is_open_source?: BooleanChar;
    is_proxy?: BooleanChar;
    is_mintable?: BooleanChar;
    owner_change_balance?: BooleanChar;
    can_take_back_ownership?: BooleanChar;
    owner_address?: string;
    creator_address?: string;
}

export interface TradingSecurity {
    buy_tax?: string;
    sell_tax?: string;
    slippage_modifiable?: BooleanChar;
    is_honeypot?: BooleanChar;
    transfer_pausable?: BooleanChar;
    is_blacklisted?: BooleanChar;
    is_whitelisted?: BooleanChar;
    is_in_dex?: BooleanChar;
    is_anti_whale?: BooleanChar;
    trust_list?: BooleanChar;
}
export interface SecurityItem {
    is_high_risk?: boolean;
    risk_item_quantity?: number;
    warn_item_quantity?: number;
    message_list?: SecurityMessage[];
}

export type TokenSecurityType = ContractSecurity &
    TokenSecurity &
    SecurityItem &
    TradingSecurity & {
        contract: string;
        chainId: number;
    };

export enum SecurityType {
    Contract = 'contract-security',
    Transaction = 'transaction-security',
    Info = 'info-security',
}
export enum SecurityMessageLevel {
    High = 'High',
    Medium = 'Medium',
    Safe = 'Safe',
}

export interface SecurityMessage {
    type: SecurityType;
    level: SecurityMessageLevel;
    condition(info: TokenSecurityType): boolean;
    title: (info: TokenSecurityType) => string;
    message: (info: TokenSecurityType) => string;
    shouldHide(info: TokenSecurityType): boolean;
}
