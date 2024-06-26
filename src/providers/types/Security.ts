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
