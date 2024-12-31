export namespace SimpleHash {
    interface Previews {
        image_small_url: string;
        image_medium_url: string;
        image_large_url: string;
        image_opengraph_url: string;
        blurhash: string;
        predominant_color: string;
    }

    interface ImageProperties {
        width: number;
        height: number;
        size?: number;
        mime_type: string;
    }

    interface Owner {
        owner_address: string;
        quantity: number;
        quantity_string: string;
        first_acquired_date: string;
        last_acquired_date: string;
    }

    export interface NFTContract {
        type: string;
        name?: string;
        symbol?: string;
        deployed_by: string;
        deployed_via_contract?: string;
        owned_by?: string;
        has_multiple_collections: boolean;
    }

    interface MarketplacePage {
        marketplace_id: string;
        marketplace_name: string;
        marketplace_collection_id: string;
        collection_url: string;
        verified: boolean;
    }

    interface PaymentToken {
        payment_token_id: string;
        name: string;
        symbol: string;
        address: string | null;
        decimals: number;
    }

    interface LastSale {
        from_address: null | string;
        to_address: string;
        quantity: number;
        quantity_string: string;
        timestamp: string;
        transaction: string;
        marketplace_id: string;
        marketplace_name: string;
        is_bundle_sale: boolean;
        payment_token: PaymentToken;
        unit_price: number;
        total_price: number;
        unit_price_usd_cents: number;
    }

    interface FloorPrice {
        marketplace_id: LiteralUnion<'blur' | 'looksrare' | 'opensea' | 'x2y2'>;
        marketplace_name: LiteralUnion<'Blur' | 'LooksRare' | 'OpenSea' | 'X2Y2'>;
        value: number;
        payment_token: PaymentToken;
        value_usd_cents: number;
    }

    interface FirstCreated {
        minted_to: string;
        quantity: number;
        quantity_string?: string;
        timestamp: string;
        block_number: number;
        transaction: string;
        transaction_initiator: string;
    }

    interface Rarity {
        rank?: number;
        score?: number;
        unique_attributes?: number;
    }

    interface Recipient {
        address: string;
        percentage: number;
        basis_points: number;
    }

    interface Royalty {
        source: string;
        total_creator_fee_basis_points: number;
        recipients: Recipient[];
    }

    export interface Attribute {
        trait_type: string;
        value: string;
        display_type?: string;
    }

    interface Content {
        mime: string;
        uri: string;
    }

    interface Properties {
        number: number;
        name: string;
    }

    export interface VideoProperties {
        audio_coding: string;
        duration: number;
        height: number;
        mime_type: string;
        size: number;
        video_coding: string | null;
        width: number;
    }

    interface ExtraMetadata {
        attributes: Attribute[];
        canvas_url?: string;
        content?: Content;
        image_original_url: string;
        animation_original_url?: string;
        metadata_original_url?: string;
        tokenId?: string;
        namehash?: string;
        image_url?: string;
        dna?: string;
        edition?: number;
        date?: number;
        compiler?: string;
        is_normalized?: boolean;
        name_length?: number;
        version?: number;
        background_image?: string;
        segment_length?: number;
        last_request_date?: number;
        properties?: Properties;
        event_id?: number;
    }

    export interface NFT {
        nft_id: string;
        chain: string;
        contract_address: string;
        token_id: string;
        name: string;
        description?: string;
        previews: Previews;
        image_url: string;
        image_properties: ImageProperties;
        background_color?: string;
        external_url?: string;
        created_date: string;
        status: string;
        token_count: number;
        owner_count: number;
        owners: Owner[];
        contract: NFTContract;
        collection: Collection;
        last_sale?: LastSale;
        first_created: FirstCreated;
        rarity: Rarity;
        royalty: Royalty[];
        extra_metadata: ExtraMetadata;
        hasBookmarked?: boolean;
        video_properties?: VideoProperties;
        video_url: string;
    }

    export interface Collection {
        collection_id: string;
        name: string;
        description?: string;
        image_url: string;
        image_properties: ImageProperties;
        banner_image_url?: string;
        category?: string;
        is_nsfw?: boolean;
        external_url?: string;
        twitter_username?: string;
        discord_url?: string;
        instagram_username: string;
        medium_username?: string;
        telegram_url?: string;
        marketplace_pages: MarketplacePage[];
        spam_score: number;
        floor_prices: FloorPrice[];
        distinct_owner_count: number;
        distinct_nft_count: number;
        total_quantity: number;
        chains: string[];
        top_contracts: string[];
        collection_royalties: Royalty[];
    }

    export interface LiteCollection {
        collection_id: string;
        distinct_nfts_owned: number;
        distinct_nfts_owned_string: string;
        total_copies_owned: number;
        total_copies_owned_string: string;
        last_acquired_date: string;
        nft_ids: string[];
        collection_details: Collection;
        nftPreviews?: NFT[];
    }

    export interface TopCollector {
        owner_address: string;
        owner_ens_name: string | null;
        owner_image: string;
        distinct_nfts_owned: number;
        total_copies_owned: number;
    }

    export interface NFTOwnership {
        wallet_address: string;
        contracts: Array<{ contract_address: string; token_ids: string[] }>;
    }
}
