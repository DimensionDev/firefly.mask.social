export interface Token<AddressLike = string> {
    amount: number;
    chain: string;
    decimals: number;
    display_symbol: string | null;
    id: AddressLike;
    is_core: boolean;
    is_verified: boolean;
    is_wallet: boolean;
    logo_url: string;
    name: string;
    optimized_symbol: string;
    price: number;
    price_24h_change: number;
    protocol_id: string;
    raw_amount: string;
    raw_amount_hex_str: string;
    symbol: string;
    time_at: number;
}
