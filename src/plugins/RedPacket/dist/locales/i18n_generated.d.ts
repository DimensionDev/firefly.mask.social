import { type ComponentType } from "react";
import { type TransProps } from "react-i18next";

type TypedTransProps<Value, Components> = Omit<TransProps<string>, "values" | "ns" | "i18nKey"> & ({} extends Value ? {} : {
    values: Value;
}) & {
    components: Components;
};
export declare function useRedPacketTrans(): {
    /**
      * `Amount`
      */
    amount(): string;
    /**
      * `No`
      */
    no(): string;
    /**
      * `🧧🧧🧧 Try sending Lucky Drop to your friends with tokens or NFTs to share the joy now! Install Mask.io to send your first Lucky Drop.`
      */
    promote(): string;
    /**
      * `🧧🧧🧧 Try sending Lucky Drop to your friends with Mask.io.`
      */
    promote_short(): string;
    /**
      * `Collections`
      */
    collections(): string;
    /**
      * `Select a Token`
      */
    select_a_token(): string;
    /**
      * `Search`
      */
    search(): string;
    /**
      * `Loading token...`
      */
    loading_token(): string;
    /**
      * `No results`
      */
    search_no_result(): string;
    /**
      * `NFTs`
      */
    nfts(): string;
    /**
      * `The collectible has already been added.`
      */
    nft_already_added(): string;
    /**
      * `The collectible does not belong to you.`
      */
    nft_invalid_owner(): string;
    /**
      * `The maximum number of NFTs to be sold in NFT lucky drop contract is {{- amount}}.`
      */
    nft_max_shares(options: {
        readonly amount: string;
    }): string;
    /**
      * `The NFT lucky drop supports up to {{amount, number}} NFTs selected for one time.`
      */
    nft_max_shares_tip(options: {
        readonly amount: string | number | bigint;
    }): string;
    /**
      * `Choose your collection`
      */
    nft_select_collection(): string;
    /**
      * `Completed`
      */
    completed(): string;
    /**
      * `Expired`
      */
    expired(): string;
    /**
      * `This is an NFT lucky drop.`
      */
    nft_tip(): string;
    /**
      * ``
      */
    account_promote$default(): string;
    /**
      * `Follow @$t(mask:twitter_account) (mask.io) to claim NFT lucky drops.`
      */
    account_promote$twitter(): string;
    /**
      * `Follow @$t(mask:facebook_account) (mask.io) to claim NFT lucky drops.`
      */
    account_promote$facebook(): string;
    /**
      * `@{{sender}} is sending an NFT lucky drop on {{network}} network. {{account_promote}}
    $t(promote_short)
    $t(mask:hash_tag) #LuckyDrop
    {{payload}}`
      */
    nft_share_foreshow_message(options: Readonly<{
        sender: string;
        network: string;
        account_promote: string;
        payload: string;
    }>): string;
    /**
      * `I just claimed an NFT lucky drop from @{{sender}} on {{network}} network. {{account_promote}}
    $t(promote_short)
    $t(mask:hash_tag) #LuckyDrop
    {{payload}}`
      */
    nft_share_claimed_message(options: Readonly<{
        sender: string;
        network: string;
        account_promote: string;
        payload: string;
    }>): string;
    /**
      * `Total Amount`
      */
    nft_total_amount(): string;
    /**
      * `Attached Message`
      */
    nft_attached_message(): string;
    /**
      * `Wallet account`
      */
    nft_account_name(): string;
    /**
      * `Enclose a Message`
      */
    message_label(): string;
    /**
      * `Claiming...`
      */
    claiming(): string;
    /**
      * `Claim`
      */
    claim(): string;
    /**
      * `The Lucky Drop can’t be sent due to data damage. Please withdraw the assets after {{duration}}.`
      */
    data_broken(options: {
        readonly duration: string;
    }): string;
    /**
      * `Refund`
      */
    refund(): string;
    /**
      * `Empty`
      */
    empty(): string;
    /**
      * `Refunding`
      */
    refunding(): string;
    /**
      * `Total Amount: {{- amount}} {{symbol}}`
      */
    history_total_amount(options: Readonly<{
        amount: string;
        symbol: string;
    }>): string;
    /**
      * `Split Mode: {{mode}}`
      */
    history_split_mode(options: {
        readonly mode: string;
    }): string;
    /**
      * `Attached Message`
      */
    attached_message(): string;
    /**
      * `The minimum amount for each share is {{- amount}} {{symbol}}`
      */
    indivisible(options: Readonly<{
        amount: string;
        symbol: string;
    }>): string;
    /**
      * `Lucky Drop`
      */
    name(): string;
    /**
      * `Gift crypto or NFTs to any users, first come, first served.`
      */
    description(): string;
    /**
      * `Create the Lucky Drop`
      */
    next(): string;
    /**
      * `Note: When you "Unlock All", all of the NFTs in the collection will be by default authorized for sale. This includes the NFTs transferred afterwards.`
      */
    nft_approve_all_tip(): string;
    /**
      * `Select partially`
      */
    nft_select_partially_option(): string;
    /**
      * `ALL ({{total}} NFT)`
      */
    nft_select_all_option(options: {
        readonly total: string;
    }): string;
    /**
      * `Token ID separated by comma, e.g. 1224, 7873, 8948`
      */
    nft_search_placeholder(): string;
    /**
      * `Insufficient Balance`
      */
    erc721_insufficient_balance(): string;
    /**
      * `Create the Lucky Drop`
      */
    erc721_create_lucky_drop(): string;
    /**
      * `When selecting too many NFTs, the total gas fee may exceed the MetaMask limit of 1 {{symbol}}. Please reduce the number of NFTs selected.`
      */
    erc721_gas_cap(options: {
        readonly symbol: string;
    }): string;
    /**
      * `Collectibles`
      */
    erc721_tab_title(): string;
    /**
      * `Tokens`
      */
    erc20_tab_title(): string;
    /**
      * `Sent`
      */
    sent_tab_title(): string;
    /**
      * `Claimed`
      */
    claimed_tab_title(): string;
    /**
      * `Claimed {{- amount}}`
      */
    claimed(options: {
        readonly amount: string;
    }): string;
    /**
      * `Received`
      */
    received(): string;
    /**
      * `View`
      */
    view(): string;
    /**
      * `Creator:`
      */
    creator(): string;
    /**
      * `Confirm the Lucky Drop`
      */
    details(): string;
    /**
      * `Confirm`
      */
    confirm(): string;
    /**
      * `Confirming`
      */
    confirming(): string;
    /**
      * `More details`
      */
    more_details(): string;
    /**
      * `Enter Amount Each`
      */
    enter_each_amount(): string;
    /**
      * `Enter Total Amount`
      */
    enter_total_amount(): string;
    /**
      * `Enter Number of Winners`
      */
    enter_shares(): string;
    /**
      * `At most 255 recipients`
      */
    max_shares(): string;
    /**
      * `Lucky Drop`
      */
    display_name(): string;
    /**
      * `History`
      */
    select_existing(): string;
    /**
      * `New`
      */
    create_new(): string;
    /**
      * `Send {{- amount}} {{symbol}}`
      */
    token_send_symbol(options: Readonly<{
        amount: string;
        symbol: string;
    }>): string;
    /**
      * `Send {{count}} NFT`
      */
    send_symbol_one(options: {
        readonly count: (string | number | bigint) & (string | number | bigint);
    }): string;
    /**
      * `Send {{count}} NFTs`
      */
    send_symbol_other(options: {
        readonly count: string | number | bigint;
    }): string;
    /**
      * `Insufficient Balance`
      */
    insufficient_balance(): string;
    /**
      * `Insufficient {{symbol}} Balance`
      */
    insufficient_token_balance(options: {
        readonly symbol: string;
    }): string;
    /**
      * `Back`
      */
    back(): string;
    /**
      * `You can withdraw the rest of your balances back 24h later after sending them out.`
      */
    hint(): string;
    /**
      * `Total`
      */
    total(): string;
    /**
      * `Total cost`
      */
    total_cost(): string;
    /**
      * `Amount per Share`
      */
    amount_per_share(): string;
    /**
      * `Amount Each`
      */
    amount_each(): string;
    /**
      * `Transaction cost`
      */
    estimate_gas_fee(): string;
    /**
      * `Shares`
      */
    shares(): string;
    /**
      * `Identical`
      */
    average(): string;
    /**
      * `Random`
      */
    random(): string;
    /**
      * `Random Amount`
      */
    random_amount(): string;
    /**
      * `Equal Amount`
      */
    identical_amount(): string;
    /**
      * `Quantity`
      */
    quantity(): string;
    /**
      * `Split Mode`
      */
    split_mode(): string;
    /**
      * `Token`
      */
    token(): string;
    /**
      * `Not supported on {{chain}} yet.`
      */
    chain_not_supported(options: {
        readonly chain: string;
    }): string;
    /**
      * `You haven't created any NFT lucky drop yet. Try to create and share lucky with your friends.`
      */
    nft_no_history(): string;
    /**
      * `You haven't created any Token lucky drop yet. Try to create and share lucky with your friends.`
      */
    token_no_history(): string;
    /**
      * `Send`
      */
    send(): string;
    /**
      * `{{- time}} (UTC+8)`
      */
    history_duration(options: {
        readonly time: string;
    }): string;
    /**
      * `Best Wishes!`
      */
    best_wishes(): string;
    /**
      * `Enter quantity`
      */
    enter_quantity(): string;
    /**
      * `Enter number of winners`
      */
    enter_number_of_winners(): string;
    /**
      * `Create time:`
      */
    create_time(): string;
    /**
      * `Received time:`
      */
    received_time(): string;
    /**
      * `Message`
      */
    message(): string;
    /**
      * `Best Wishes`
      */
    blessing_words(): string;
    /**
      * `The Lucky Drop can’t be sent due to data damage.`
      */
    nft_data_broken(): string;
    /**
      * `From: @{{name}}`
      */
    ["from"](options: {
        readonly name: string;
    }): string;
    /**
      * `I just claimed a lucky drop from @{{sender}} on {{network}} network. Follow @{{account}} (mask.io) to claim lucky drops.
    $t(promote_short)
    #mask_io #LuckyDrop
    {{payload}}`
      */
    share_message_official_account(options: Readonly<{
        sender: string;
        network: string;
        account: string;
        payload: string;
    }>): string;
    /**
      * `I just claimed a lucky drop from @{{sender}} on {{network}} network.
    $t(promote_short)
    {{payload}}`
      */
    share_message_not_twitter(options: Readonly<{
        sender: string;
        network: string;
        payload: string;
    }>): string;
    /**
      * `Hi friends, I just found a lucky drop sent by @{{sender}} on {{network}} network. Follow @{{account}} (mask.io) to claim lucky drops.
    $t(promote_short)
    #mask_io #LuckyDrop
    {{payload}}`
      */
    share_unclaimed_message_official_account(options: Readonly<{
        sender: string;
        network: string;
        account: string;
        payload: string;
    }>): string;
    /**
      * `Hi friends, I just found a lucky drop sent by @{{sender}} on {{network}} network.
    $t(promote_short)
    {{payload}}`
      */
    share_unclaimed_message_not_twitter(options: Readonly<{
        sender: string;
        network: string;
        payload: string;
    }>): string;
    /**
      * `You got {{- amount}} {{symbol}}`
      */
    description_claimed(options: Readonly<{
        amount: string;
        symbol: string;
    }>): string;
    /**
      * `You could refund {{- balance}} {{symbol}}.`
      */
    description_refund(options: Readonly<{
        balance: string;
        symbol: string;
    }>): string;
    /**
      * `The Lucky Drop has been refunded.`
      */
    description_refunded(): string;
    /**
      * `The Lucky Drop is expired.`
      */
    description_expired(): string;
    /**
      * `The Lucky Drop is broken.`
      */
    description_broken(): string;
    /**
      * `The Lucky Drop is empty.`
      */
    description_empty(): string;
    /**
      * `{{count}} share / {{- total}} {{symbol}}`
      */
    description_failover_one(options: Readonly<{
        count: (string | number | bigint) & (string | number | bigint);
        total: string & string;
        symbol: string & string;
    }>): string;
    /**
      * `{{count}} shares / {{- total}} {{symbol}}`
      */
    description_failover_other(options: Readonly<{
        count: string | number | bigint;
        total: string;
        symbol: string;
    }>): string;
    /**
      * `Send a surprise crypto giveaway. Tokens and NFTs on multiple chains are supported.`
      */
    recommend_feature_description(): string;
    /**
      * `You claimed {{- amount}} {{name}}.`
      */
    claim_token_successful(options: Readonly<{
        amount: string;
        name: string;
    }>): string;
    /**
      * `Claimed 1 {{name}} successfully.`
      */
    claim_nft_successful(options: {
        readonly name: string;
    }): string;
    /**
      * `Lucky Drop`
      */
    lucky_drop(): string;
    /**
      * `Share`
      */
    share(): string;
    /**
      * `OK`
      */
    ok(): string;
    /**
      * `You got 1 {{name}}`
      */
    got_nft(options: {
        readonly name: string;
    }): string;
    /**
      * `History`
      */
    history(): string;
    /**
      * `realMaskNetwork`
      */
    twitter_account(): string;
    /**
      * `Winners`
      */
    winners(): string;
    /**
      * `masknetwork`
      */
    facebook_account(): string;
    /**
      * `Loading`
      */
    loading(): string;
    /**
      * `Connect Wallet`
      */
    plugin_wallet_connect_a_wallet(): string;
    /**
      * `Invalid Network`
      */
    plugin_wallet_invalid_network(): string;
    /**
      * `Select All`
      */
    select_all(): string;
    /**
      * `Retry`
      */
    retry(): string;
    /**
      * `Something went wrong.`
      */
    go_wrong(): string;
    /**
      * `Total amount`
      */
    total_amount(): string;
    /**
      * `Total amount shared among all winners`
      */
    random_amount_share_tips(): string;
    /**
      * `Enter the amount that each winner can claim`
      */
    equal_amount_share_tips(): string;
    /**
      * `You can set one or multiple rules to be eligible to win a Lucky Drop.`
      */
    claim_requirements_tips(): string;
    /**
      * `Claim Requirements`
      */
    claim_requirements_title(): string;
    /**
      * `Use Lucky Drop quests to grow your followers and engagement. Each requirement must be completed to be eligible to claim.`
      */
    claim_requirements_rule_tips(): string;
    /**
      * `Follow me`
      */
    follow_me(): string;
    /**
      * `User must follow your account. Note: When you cross-post a Lucky Drop to multiple social networks, following you on any social allows users to claim.`
      */
    follow_me_description(): string;
    /**
      * `Like / Repost / Comment`
      */
    reaction_title(): string;
    /**
      * `Users must like, repost / quote tweet, or comment on your Lucky Drop post.`
      */
    reaction_description(): string;
    /**
      * `NFT holder`
      */
    nft_holder(): string;
    /**
      * `Users must hold one NFT from the collection you select.`
      */
    nft_holder_description(): string;
    /**
      * `Repost`
    
      * - repost$lens: `Mirror`
    
      * - repost$twitter: `Repost`
    
      * - repost$farcaster: `Repost`
      */
    repost(options: {
        readonly context: "lens" | "twitter" | "farcaster";
    }): string;
    /**
      * `Mirror`
      */
    repost$lens(): string;
    /**
      * `Repost`
      */
    repost$twitter(): string;
    /**
      * `Repost`
      */
    repost$farcaster(): string;
    /**
      * `Like`
      */
    like(): string;
    /**
      * `Comment`
      */
    comment(): string;
    /**
      * `Clear all requirements`
      */
    clear_all_requirements(): string;
    /**
      * `Select NFT collection to gate access`
      */
    select_nft_collection_to_gate_access(): string;
    /**
      * `Next`
      */
    next_button(): string;
    /**
      * `Drop Type`
      */
    drop_type(): string;
    /**
      * `Number of Winners`
      */
    number_of_winners(): string;
    /**
      * `Share From`
      */
    share_from(): string;
    /**
      * `Customize Lucky Drop sender. Select either Lens or Forecaster usernames, or use the currently connected wallet.`
      */
    share_from_tips(): string;
    /**
      * `Image Preview`
      */
    image_preview(): string;
    /**
      * `You can withdraw any unclaimed amount 24 hours after sending this lucky drop.`
      */
    unclaim_tips(): string;
    /**
      * `By clicking "Next", you acknowledge the risk associated with decentralized networks and beta products.`
      */
    create_redpacket_tips(): string;
    /**
      * `Insufficient Balance for Gas Fee`
      */
    no_enough_gas_fees(): string;
    /**
      * `Grant access to your {{ token }} for the Lucky Drop Smart contract. You only have to do this once per token.`
      */
    infinite_unlock_tips(options: {
        readonly token: string;
    }): string;
    /**
      * `Requirements`
      */
    requirements(): string;
    /**
      * `🤑 Check this Lucky Drop  🧧💰✨ sent by @{{- sender }} .
    
    Grow your followers and engagement with Lucky Drop on Firefly mobile app or http://firefly.mask.social !
    
    Claim on: {{- link }}`
      */
    share_on_firefly$default(options: Readonly<{
        sender: (((((string & string) & string) & string) & string) & string) & string;
        link: (((((string & string) & string) & string) & string) & string) & string;
    }>): string;
    /**
      * `🤑 Check this Lucky Drop  🧧💰✨ sent by @{{- sender }} .
    
    Grow your followers and engagement with Lucky Drop on Firefly mobile app or http://firefly.mask.social !
    
    Claim on Lens: {{- link }}`
      */
    share_on_firefly$lens(options: Readonly<{
        sender: string;
        link: string;
    }>): string;
    /**
      * `🤑 Check this Lucky Drop  🧧💰✨ sent by @{{- sender }} .
    
    Grow your followers and engagement with Lucky Drop on Firefly mobile app or http://firefly.mask.social !
    
    Claim on Farcaster: {{- link }}`
      */
    share_on_firefly$farcaster(options: Readonly<{
        sender: string;
        link: string;
    }>): string;
    /**
      * `🤑 Check this Lucky Drop  🧧💰✨ sent by @{{- sender }} .
    
    Grow your followers and engagement with Lucky Drop on Firefly mobile app or http://firefly.mask.social !
    
    Claim on Twitter: {{- link }}`
      */
    share_on_firefly$twitter(options: Readonly<{
        sender: string;
        link: string;
    }>): string;
    /**
      * `🤑 Just claimed a #LuckyDrop  🧧💰✨ on https://firefly.mask.social from @{{- sender }} !
    
    Claim on Lens: {{- link }}`
      */
    share_on_firefly$lens_claimed(options: Readonly<{
        sender: string;
        link: string;
    }>): string;
    /**
      * `🤑 Just claimed a #LuckyDrop  🧧💰✨ on https://firefly.mask.social from @{{- sender }} !
    
    Claim on Farcaster: {{- link }}`
      */
    share_on_firefly$farcaster_claimed(options: Readonly<{
        sender: string;
        link: string;
    }>): string;
    /**
      * `🤑 Just claimed a #LuckyDrop  🧧💰✨ on https://firefly.mask.social from @{{- sender }} !
    
    Claim on Twitter: {{- link }}`
      */
    share_on_firefly$twitter_claimed(options: Readonly<{
        sender: string;
        link: string;
    }>): string;
    /**
      * `No claims yet for this Lucky Drop`
      */
    no_claim_data(): string;
    /**
      * `No Lucky Drops claimed`
      */
    no_claim_history_data(): string;
    /**
      * `Post on`
      */
    post_on(): string;
    /**
      * `Connect to {{ platform }}`
      */
    connect_to_platform(options: {
        readonly platform: string;
    }): string;
    /**
      * - send_symbol_one: `Send {{count}} NFT`
    
      * - send_symbol_other: `Send {{count}} NFTs`
      */
    send_symbol(options: {
        readonly count: string | number | bigint;
    }): string;
    /**
      * - description_failover_one: `{{count}} share / {{- total}} {{symbol}}`
    
      * - description_failover_other: `{{count}} shares / {{- total}} {{symbol}}`
      */
    description_failover(options: Readonly<{
        count?: string | number | bigint;
        total: string & string;
        symbol: string & string;
    }>): string;
    /**
      * - account_promote$default: ``
    
      * - account_promote$twitter: `Follow @$t(mask:twitter_account) (mask.io) to claim NFT lucky drops.`
    
      * - account_promote$facebook: `Follow @$t(mask:facebook_account) (mask.io) to claim NFT lucky drops.`
      */
    account_promote(options: {
        readonly context: "default" | "twitter" | "facebook";
    }): string;
    /**
      * - share_on_firefly$default: `🤑 Check this Lucky Drop  🧧💰✨ sent by @{{- sender }} .
    
    Grow your followers and engagement with Lucky Drop on Firefly mobile app or http://firefly.mask.social !
    
    Claim on: {{- link }}`
    
      * - share_on_firefly$lens: `🤑 Check this Lucky Drop  🧧💰✨ sent by @{{- sender }} .
    
    Grow your followers and engagement with Lucky Drop on Firefly mobile app or http://firefly.mask.social !
    
    Claim on Lens: {{- link }}`
    
      * - share_on_firefly$farcaster: `🤑 Check this Lucky Drop  🧧💰✨ sent by @{{- sender }} .
    
    Grow your followers and engagement with Lucky Drop on Firefly mobile app or http://firefly.mask.social !
    
    Claim on Farcaster: {{- link }}`
    
      * - share_on_firefly$twitter: `🤑 Check this Lucky Drop  🧧💰✨ sent by @{{- sender }} .
    
    Grow your followers and engagement with Lucky Drop on Firefly mobile app or http://firefly.mask.social !
    
    Claim on Twitter: {{- link }}`
    
      * - share_on_firefly$lens_claimed: `🤑 Just claimed a #LuckyDrop  🧧💰✨ on https://firefly.mask.social from @{{- sender }} !
    
    Claim on Lens: {{- link }}`
    
      * - share_on_firefly$farcaster_claimed: `🤑 Just claimed a #LuckyDrop  🧧💰✨ on https://firefly.mask.social from @{{- sender }} !
    
    Claim on Farcaster: {{- link }}`
    
      * - share_on_firefly$twitter_claimed: `🤑 Just claimed a #LuckyDrop  🧧💰✨ on https://firefly.mask.social from @{{- sender }} !
    
    Claim on Twitter: {{- link }}`
      */
    share_on_firefly(options: Readonly<{
        sender: (((((string & string) & string) & string) & string) & string) & string;
        link: (((((string & string) & string) & string) & string) & string) & string;
        context?: "default" | "lens" | "farcaster" | "twitter" | "lens_claimed" | "farcaster_claimed" | "twitter_claimed";
    }>): string;
};
export declare const RedPacketTrans: {
    /**
      * `You can also use <text>{{text}}</text> to select multiple NFTs.`
      */
    nft_shift_select_tip: ComponentType<TypedTransProps<{
        readonly text: string;
    }, {
        text: JSX.Element;
    }>>;
    /**
      * `Token ID <tokenIdList></tokenIdList> does not exist or belong to you.`
      */
    nft_non_existed_tip: ComponentType<TypedTransProps<Readonly<{}>, {
        tokenIdList: JSX.Element;
    }>>;
    /**
      * `<span>{{count}}</span> NFT`
      */
    nft_select_amount_one: ComponentType<TypedTransProps<{
        readonly count: (string | number | bigint) & (string | number | bigint);
    }, {
        span: JSX.Element;
    }>>;
    /**
      * `<span>{{count}}</span> NFTs`
      */
    nft_select_amount_other: ComponentType<TypedTransProps<{
        readonly count: string | number | bigint;
    }, {
        span: JSX.Element;
    }>>;
    /**
      * `Claimed: <span>{{claimedShares}}/{{shares}}</span> {{claimedAmount}}/{{amount}} <span>{{symbol}}</span>`
      */
    history_claimed: ComponentType<TypedTransProps<Readonly<{
        claimedShares: string;
        shares: string;
        claimedAmount: string;
        amount: string;
        symbol: string;
    }>, {
        span: JSX.Element;
    }>>;
    /**
      * `Claimed: <span>{{claimedShares}}/{{shares}}</span> <span>{{claimedAmount}}/{{amount}}</span> <span>{{symbol}}</span>`
      */
    history_claimed_firefly: ComponentType<TypedTransProps<Readonly<{
        claimedShares: string;
        shares: string;
        claimedAmount: string;
        amount: string;
        symbol: string;
    }>, {
        span: JSX.Element;
    }>>;
    /**
      * `Claimed: <span>{{claimedShares}}/{{shares}}</span> <span>{{symbol}}</span>`
      */
    history_nft_claimed: ComponentType<TypedTransProps<Readonly<{
        claimedShares: string;
        shares: string;
        symbol: string;
    }>, {
        span: JSX.Element;
    }>>;
    /**
      * `Follow <span>{{handles}}</span> on {{ platform }}`
      */
    follow_somebody_on_somewhere: ComponentType<TypedTransProps<Readonly<{
        handles: string;
        platform: string;
    }>, {
        span: JSX.Element;
    }>>;
    /**
      * `NFT Holder of <nfts>{{- names }}</nfts>`
      */
    nft_holder_of: ComponentType<TypedTransProps<{
        readonly names: string;
    }, {
        nfts: JSX.Element;
    }>>;
    /**
      * `<div>No Lucky Drops created.</div> <div>Select 🎁 when you compose a post to start your first drop.<div>`
      */
    no_sent_history_data: ComponentType<TypedTransProps<Readonly<{}>, {
        div: JSX.Element;
    }>>;
    /**
      * - nft_select_amount_one: `<span>{{count}}</span> NFT`
    
      * - nft_select_amount_other: `<span>{{count}}</span> NFTs`
      */
    nft_select_amount: ComponentType<TypedTransProps<{
        readonly count: string | number | bigint;
    }, {
        span: JSX.Element;
    }>>;
};
export {};
// # sourceMappingURL=i18n_generated.d.ts.map