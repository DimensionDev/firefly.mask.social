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

    owner_balance?: number;
    owner_percent?: string;

    creator_address?: string;
    creator_balance?: number;
    creator_percent?: string;

    lp_holder_count?: number;
    lp_total_supply?: number;
    lp_holders?: Holder[];

    is_true_token?: BooleanChar;
    is_verifiable_team?: BooleanChar;
    is_airdrop_scam?: BooleanChar;
    trust_list?: BooleanChar;

    other_potential_risks?: string;
    note?: string;

    fake_token?: {
        true_token_address: string;
        value: number;
    };
}

export interface ContractSecurity {
    is_open_source?: BooleanChar;
    is_proxy?: BooleanChar;
    is_mintable?: BooleanChar;
    owner_change_balance?: BooleanChar;
    can_take_back_ownership?: BooleanChar;
    owner_address?: string;
    creator_address?: string;
    hidden_owner?: BooleanChar;
    selfdestruct?: BooleanChar;
    external_call?: BooleanChar;
    gas_abuse?: BooleanChar;
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
    cannot_buy?: BooleanChar;
    cannot_sell_all?: BooleanChar;
    dex?: string;
    anti_whale_modifiable?: BooleanChar;
    trading_cooldown?: BooleanChar;
    personal_slippage_modifiable?: BooleanChar;
}

export interface SecurityItem {
    is_high_risk?: boolean;
    risk_item_quantity?: number;
    warn_item_quantity?: number;
    message_list?: SecurityMessage[];
}

export type TokenContractSecurity = ContractSecurity &
    TokenSecurity &
    SecurityItem &
    TradingSecurity & {
        contract: string;
        chainId: number;
    };

export interface AddressSecurity {
    data_source: string;
    honeypot_related_address: BooleanChar;
    phishing_activities: BooleanChar;
    blackmail_activities: BooleanChar;
    stealing_attack: BooleanChar;
    fake_kyc: BooleanChar;
    malicious_mining_activities: BooleanChar;
    darkweb_transactions: BooleanChar;
    cybercrime: BooleanChar;
    money_laundering: BooleanChar;
    financial_crime: BooleanChar;
    blacklist_doubt: BooleanChar;
    contract_address: BooleanChar;
    mixer: BooleanChar;
    sanctioned: BooleanChar;
    number_of_malicious_contracts_created: number;
    gas_abuse: BooleanChar;
    reinit: BooleanChar;
    fake_standard_interface: BooleanChar;
    fake_token: BooleanChar;
}

export enum SecurityType {
    Contract = 'contract-security',
    Transaction = 'transaction-security',
    Address = 'address-security',
    Info = 'info-security',
}
export enum SecurityMessageLevel {
    High = 'High',
    Medium = 'Medium',
    Safe = 'Safe',
}

export interface SecurityMessage<T = TokenContractSecurity> {
    type: SecurityType;
    level: SecurityMessageLevel;
    condition(info: T): boolean;
    title: (info: T) => string;
    message: (info: T) => string;
    shouldHide(info: T): boolean;
}
