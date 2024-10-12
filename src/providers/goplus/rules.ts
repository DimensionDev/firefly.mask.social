import { t } from '@lingui/macro';

import {
    type AddressSecurity,
    type NFTSecurity,
    type SecurityMessage,
    SecurityMessageLevel,
    SecurityType,
    type SiteSecurity,
    type TokenContractSecurity,
} from '@/providers/types/Security.js';

function isUnset<T>(name: keyof T) {
    return (info: T) => info[name] === undefined;
}
function percentageToNumber(value?: string) {
    return parseInt((value ?? '').replace('%', ''), 10) * 100;
}

function safeCompare(value: string | number | undefined, stringBool: string) {
    return typeof value === 'number' ? value.toString() === stringBool : value === stringBool;
}

export const TokenSecurityMessages: SecurityMessage[] = [
    // open source
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenContractSecurity) => safeCompare(info.is_open_source, '1'),
        title: () => t`Contract source code verified`,
        message: () =>
            t`This token contract is open source. You can check the contract code for details. Unsourced token contracts are likely to have malicious functions to defraud their users of their assets.`,
        shouldHide: isUnset('is_open_source'),
    },
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.High,
        condition: (info: TokenContractSecurity) => safeCompare(info.is_open_source, '0'),
        title: () => t`Contract source code not verified`,
        message: () =>
            t`This token contract has not been verified. We cannot check the contract code for details. Unsourced token contracts are likely to have malicious functions to defraud users of their assets.`,
        shouldHide: isUnset('is_open_source'),
    },
    // proxy
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenContractSecurity) => safeCompare(info.is_proxy, '1'),
        title: () => t`Proxy contract`,
        message: () =>
            t`This contract is an Admin Upgradeability Proxy. The proxy contract means the contract owner can modify the function of the token and could possibly effect the price.There is possibly a way for the team to Rug or Scam. Please confirm the details with the project team before buying.`,
        shouldHide: isUnset('is_proxy'),
    },
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenContractSecurity) => safeCompare(info.is_proxy, '0'),
        title: () => t`No proxy`,
        message: () =>
            t`There is no proxy in the contract. The proxy contract means contract owner can modify the function of the token and possibly effect the price.`,
        shouldHide: isUnset('is_proxy'),
    },
    // mint
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenContractSecurity) => safeCompare(info.is_mintable, '0'),
        title: () => t`No mint function`,
        message: () =>
            t`Mint function is transparent or non-existent. Hidden mint functions may increase the amount of tokens in circulation and effect the price of the token.`,
        shouldHide: isUnset('is_mintable'),
    },
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenContractSecurity) => safeCompare(info.is_mintable, '1'),
        title: () => t`Mint function`,
        message: () =>
            t`The contract may contain additional issuance functions, which could maybe generate a large number of tokens, resulting in significant fluctuations in token prices. It is recommended to confirm with the project team whether it complies with the token issuance instructions.`,
        shouldHide: isUnset('is_mintable'),
    },
    // owner change balance
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenContractSecurity) => safeCompare(info.owner_change_balance, '0'),
        title: () => t`Owner can't change balance`,
        message: () =>
            t`The contract owner is not found to have the authority to modify the balance of tokens at other addresses.`,
        shouldHide: isUnset('owner_change_balance'),
    },
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenContractSecurity) => safeCompare(info.owner_change_balance, '1'),
        title: () => t`Owner can change balance`,
        message: () =>
            t`The contract owner has the authority to modify the balance of tokens at other addresses, which may result in a loss of assets.`,
        shouldHide: isUnset('owner_change_balance'),
    },
    // can take back ownership
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenContractSecurity) => safeCompare(info.can_take_back_ownership, '0'),
        title: () => t`No function found that retrieves ownership`,
        message: () =>
            t`If this function exists, it is possible for the project owner to regain ownership even after relinquishing it`,
        shouldHide: isUnset('can_take_back_ownership'),
    },
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenContractSecurity) => safeCompare(info.can_take_back_ownership, '1'),
        title: () => t`Functions with retrievable ownership`,
        message: () =>
            t`If this function exists, it is possible for the project owner to regain ownership even after relinquishing it`,
        shouldHide: isUnset('can_take_back_ownership'),
    },
    // buy tax
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenContractSecurity) => percentageToNumber(info.buy_tax) < 10,
        title: (info) => t`Buy Tax: ${percentageToNumber(info.buy_tax)}%`,
        message: () =>
            t`Above 10% may be considered a high tax rate. More than 50% tax rate means may not be tradable.`,
        shouldHide: isUnset('buy_tax'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenContractSecurity) =>
            percentageToNumber(info.buy_tax) >= 10 && percentageToNumber(info.buy_tax) < 50,
        title: (info) => t`Buy Tax: ${percentageToNumber(info.buy_tax)}%`,
        message: () =>
            t`Above 10% may be considered a high tax rate. More than 50% tax rate means may not be tradable.`,
        shouldHide: isUnset('buy_tax'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.High,
        condition: (info: TokenContractSecurity) => percentageToNumber(info.buy_tax) >= 50,
        title: (info) => t`Buy Tax: ${percentageToNumber(info.buy_tax)}%`,
        message: () =>
            t`Above 10% may be considered a high tax rate. More than 50% tax rate means may not be tradable.`,
        shouldHide: isUnset('buy_tax'),
    },
    // sell tax
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenContractSecurity) => percentageToNumber(info.sell_tax) < 10,
        title: (info) => t`Sell Tax: ${percentageToNumber(info.sell_tax)}%`,
        message: () =>
            t`Above 10% may be considered a high tax rate. More than 50% tax rate means may not be tradable.`,
        shouldHide: isUnset('sell_tax'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenContractSecurity) =>
            percentageToNumber(info.sell_tax) >= 10 && percentageToNumber(info.sell_tax) < 50,
        title: (info) => t`Sell Tax: ${percentageToNumber(info.sell_tax)}%`,
        message: () =>
            t`Above 10% may be considered a high tax rate. More than 50% tax rate means may not be tradable.`,
        shouldHide: isUnset('sell_tax'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.High,
        condition: (info: TokenContractSecurity) => percentageToNumber(info.sell_tax) >= 50,
        title: (info) => t`Sell Tax: ${percentageToNumber(info.sell_tax)}%`,
        message: () =>
            t`Above 10% may be considered a high tax rate. More than 50% tax rate means may not be tradable.`,
        shouldHide: isUnset('sell_tax'),
    },
    // honeypot
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenContractSecurity) => safeCompare(info.is_honeypot, '0'),
        title: () => t`This does not appear to be a honeypot.`,
        message: () => t`We are not aware of any code that prevents the sale of tokens.`,
        shouldHide: isUnset('is_honeypot'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.High,
        condition: (info: TokenContractSecurity) => safeCompare(info.is_honeypot, '1'),
        title: () => t`Perhaps the token is a honeypot.`,
        message: () => t`This token contract has a code that states that it cannot be sold. Maybe this is a honeypot.`,
        shouldHide: isUnset('is_honeypot'),
    },
    // transfer_pausable
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenContractSecurity) => safeCompare(info.transfer_pausable, '0'),
        title: () => t`No codes found to suspend trading.`,
        message: () =>
            t`If a suspendable code is included, the token maybe neither be bought nor sold (honeypot risk).`,
        shouldHide: isUnset('transfer_pausable'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenContractSecurity) => safeCompare(info.transfer_pausable, '1'),
        title: () => t`Functions that can suspend trading`,
        message: () =>
            t`If a suspendable code is included, the token maybe neither be bought nor sold (honeypot risk).`,
        shouldHide: isUnset('transfer_pausable'),
    },
    // anti whale
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenContractSecurity) => safeCompare(info.is_anti_whale, '0'),
        title: () => t`No anti_whale(Unlimited number of transactions)`,
        message: () =>
            t`There is no limit to the number of token transactions. The number of scam token transactions may be limited (honeypot risk).`,
        shouldHide: isUnset('is_anti_whale'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenContractSecurity) => safeCompare(info.is_anti_whale, '1'),
        title: () => t`Anti_whale(Limited number of transactions)`,
        message: () =>
            t`The number of token transactions is limited. The number of scam token transactions may be limited (honeypot risk).`,
        shouldHide: isUnset('is_anti_whale'),
    },
    // slippage modifiable
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenContractSecurity) => safeCompare(info.slippage_modifiable, '0'),
        title: () => t`Tax cannot be modified`,
        message: () =>
            t`The contract owner may not contain the authority to modify the transaction tax. If the transaction tax is increased to more than 49%, the tokens will not be able to be traded (honeypot risk).`,
        shouldHide: isUnset('slippage_modifiable'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenContractSecurity) => safeCompare(info.slippage_modifiable, '1'),
        title: () => t`Tax can be modified`,
        message: () =>
            t`The contract owner may contain the authority to modify the transaction tax. If the transaction tax is increased to more than 49%, the tokens will not be able to be traded (honeypot risk).`,
        shouldHide: isUnset('slippage_modifiable'),
    },
    // black list
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenContractSecurity) => safeCompare(info.is_blacklisted, '0'),
        title: () => t`No blacklist`,
        message: () =>
            t`The blacklist function is not included. If there is a blacklist, some addresses may not be able to trade normally (honeypot risk).`,
        shouldHide: isUnset('is_blacklisted'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenContractSecurity) => safeCompare(info.is_blacklisted, '1'),
        title: () => t`Blacklist function`,
        message: () =>
            t`The blacklist function is included. Some addresses may not be able to trade normally (honeypot risk).`,
        shouldHide: isUnset('is_blacklisted'),
    },
    // white list
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenContractSecurity) => safeCompare(info.is_whitelisted, '0'),
        title: () => t`No whitelist`,
        message: () =>
            t`The whitelist function is not included. If there is a whitelist, some addresses may not be able to trade normally (honeypot risk).`,
        shouldHide: isUnset('is_whitelisted'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenContractSecurity) => safeCompare(info.is_whitelisted, '1'),
        title: () => t`Whitelist function`,
        message: () =>
            t`The whitelist function is included. Some addresses may not be able to trade normally (honeypot risk).`,
        shouldHide: isUnset('is_whitelisted'),
    },
    // true token
    {
        type: SecurityType.Info,
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenContractSecurity) => safeCompare(info.is_true_token, '1'),
        title: () => t`True Token`,
        message: () =>
            t`This token is issued by its declared team. Some scams will create a well-known token with the same name to defraud their users of their assets.`,
        shouldHide: isUnset('is_true_token'),
    },
    {
        type: SecurityType.Info,
        level: SecurityMessageLevel.High,
        condition: (info: TokenContractSecurity) => safeCompare(info.is_true_token, '0'),
        title: () => t`Fake Token`,
        message: () =>
            t`This token is not issued by its declared team. Some scams will create a well-known token with the same name to defraud their users of their assets.`,
        shouldHide: isUnset('is_true_token'),
    },
    // Airdrop scam
    {
        type: SecurityType.Info,
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenContractSecurity) => safeCompare(info.is_airdrop_scam, '0'),
        title: () => t`Airdrop Scam`,
        message: () => t`You may lose your assets if giving approval to the website of this token.`,
        shouldHide: isUnset('is_airdrop_scam'),
    },
    {
        type: SecurityType.Info,
        level: SecurityMessageLevel.High,
        condition: (info: TokenContractSecurity) => safeCompare(info.is_airdrop_scam, '1'),
        title: () => t`No Airdrop Scam`,
        message: () => t`This is not an airdrop scam. Many scams attract users through airdrops.`,
        shouldHide: isUnset('is_airdrop_scam'),
    },
    // Hidden owner
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenContractSecurity) => safeCompare(info.hidden_owner, '0'),
        title: () => t`No hidden owner.`,
        message: () =>
            t`The hidden owner function is not included. If there is a hidden owner, the project owner may have the ability to control the contract.`,
        shouldHide: isUnset('hidden_owner'),
    },
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenContractSecurity) => safeCompare(info.hidden_owner, '1'),
        title: () => t`Hidden owner.`,
        message: () =>
            t`The hidden owner function is included. The project owner may have the ability to control the contract.`,
        shouldHide: isUnset('hidden_owner'),
    },
    // Self destruct
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenContractSecurity) => safeCompare(info.selfdestruct, '0'),
        title: () => t`This token can not self destruct.`,
        message: () =>
            t`The self-destruct function is not included. If there is a self-destruct function, the project owner may have the ability to destroy the contract.`,
        shouldHide: isUnset('selfdestruct'),
    },
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenContractSecurity) => safeCompare(info.selfdestruct, '1'),
        title: () => t`This token can self destruct.`,
        message: () =>
            t`The self-destruct function is included. The project owner may have the ability to destroy the contract.`,
        shouldHide: isUnset('selfdestruct'),
    },
    // External call
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenContractSecurity) => safeCompare(info.external_call, '0'),
        title: () => t`No external call risk found.`,
        message: () =>
            t`The external call function is not included. If there is an external call function, the project owner may have the ability to control the contract.`,
        shouldHide: isUnset('external_call'),
    },
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenContractSecurity) => safeCompare(info.external_call, '1'),
        title: () => t`Potential risk of external call.`,
        message: () =>
            t`The external call function is included. The project owner may have the ability to control the contract.`,
        shouldHide: isUnset('external_call'),
    },
    // Gas abuse
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenContractSecurity) => safeCompare(info.gas_abuse, '0'),
        title: () => t`This token is not a gas abuser.`,
        message: () =>
            t`The gas abuse function is not included. If there is a gas abuse function, the project owner may have the ability to control the contract.`,
        shouldHide: isUnset('gas_abuse'),
    },
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenContractSecurity) => safeCompare(info.gas_abuse, '1'),
        title: () => t`This token is a gas abuser.`,
        message: () =>
            t`The gas abuse function is included. The project owner may have the ability to control the contract.`,
        shouldHide: isUnset('gas_abuse'),
    },
    // Cannot buy
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenContractSecurity) => safeCompare(info.cannot_buy, '0'),
        title: () => t`The token can be bought.`,
        message: () => t`The contract owner has no restrictions on buying.`,
        shouldHide: isUnset('cannot_buy'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenContractSecurity) => safeCompare(info.cannot_buy, '1'),
        title: () => t`The token can not be bought.`,
        message: () => t`The contract owner has restrictions on buying.`,
        shouldHide: isUnset('cannot_buy'),
    },
    // Cannot sell all
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenContractSecurity) => safeCompare(info.cannot_sell_all, '0'),
        title: () => t`Holders can sell all of the token.`,
        message: () => t`The contract owner has no restrictions on selling.`,
        shouldHide: isUnset('cannot_sell_all'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenContractSecurity) => safeCompare(info.cannot_sell_all, '1'),
        title: () => t`Holders can not sell all of the token.`,
        message: () => t`The contract owner has restrictions on selling.`,
        shouldHide: isUnset('cannot_sell_all'),
    },
    // Anti whale modifiable
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenContractSecurity) => safeCompare(info.anti_whale_modifiable, '0'),
        title: () => t`Anti whale can not be modified.`,
        message: () => t`The contract owner has no restrictions on anti whale.`,
        shouldHide: isUnset('anti_whale_modifiable'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenContractSecurity) => safeCompare(info.anti_whale_modifiable, '1'),
        title: () => t`Anti whale can be modified.`,
        message: () => t`The contract owner has restrictions on anti whale.`,
        shouldHide: isUnset('anti_whale_modifiable'),
    },
    // Trading cooldown
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenContractSecurity) => safeCompare(info.trading_cooldown, '0'),
        title: () => t`No trading cooldown function.`,
        message: () => t`The contract owner has no restrictions on trading cooldown.`,
        shouldHide: isUnset('trading_cooldown'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenContractSecurity) => safeCompare(info.trading_cooldown, '1'),
        title: () => t`Trading cooldown function.`,
        message: () => t`The contract owner has restrictions on trading cooldown.`,
        shouldHide: isUnset('trading_cooldown'),
    },
    // Personal slippage modifiable
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenContractSecurity) => safeCompare(info.personal_slippage_modifiable, '0'),
        title: () => t`No tax changes found for personal addresses.`,
        message: () => t`The contract owner has no restrictions on personal slippage.`,
        shouldHide: isUnset('personal_slippage_modifiable'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenContractSecurity) => safeCompare(info.personal_slippage_modifiable, '1'),
        title: () => t`Owner can set a different tax rate for every assigned address.`,
        message: () => t`The contract owner has restrictions on personal slippage.`,
        shouldHide: isUnset('personal_slippage_modifiable'),
    },
];

export const AddressSecurityMessages: Array<SecurityMessage<AddressSecurity>> = [
    // Honeypot related address
    {
        type: SecurityType.Address,
        level: SecurityMessageLevel.Safe,
        condition: (info: AddressSecurity) => safeCompare(info.honeypot_related_address, '0'),
        title: () => t`Non-honeypot related address.`,
        message: () => t`Non-honeypot related address.`,
        shouldHide: isUnset('honeypot_related_address'),
    },
    {
        type: SecurityType.Address,
        level: SecurityMessageLevel.High,
        condition: (info: AddressSecurity) => safeCompare(info.honeypot_related_address, '1'),
        title: () => t`Honeypot related address.`,
        message: () => t`Honeypot related address found.`,
        shouldHide: isUnset('honeypot_related_address'),
    },
    // Phishing activities
    {
        type: SecurityType.Address,
        level: SecurityMessageLevel.Safe,
        condition: (info: AddressSecurity) => safeCompare(info.phishing_activities, '0'),
        title: () => t`No phishing activities involved.`,
        message: () => t`No phishing activities found.`,
        shouldHide: isUnset('phishing_activities'),
    },
    {
        type: SecurityType.Address,
        level: SecurityMessageLevel.High,
        condition: (info: AddressSecurity) => safeCompare(info.phishing_activities, '1'),
        title: () => t`Phishing activities.`,
        message: () => t`Phishing activities found.`,
        shouldHide: isUnset('phishing_activities'),
    },
    // Blackmail activities
    {
        type: SecurityType.Address,
        level: SecurityMessageLevel.Safe,
        condition: (info: AddressSecurity) => safeCompare(info.blackmail_activities, '0'),
        title: () => t`No blackmail activities involved.`,
        message: () => t`No blackmail activities found.`,
        shouldHide: isUnset('blackmail_activities'),
    },
    {
        type: SecurityType.Address,
        level: SecurityMessageLevel.High,
        condition: (info: AddressSecurity) => safeCompare(info.blackmail_activities, '1'),
        title: () => t`Blackmail activities.`,
        message: () => t`Blackmail activities found.`,
        shouldHide: isUnset('blackmail_activities'),
    },
    // Stealing attack
    {
        type: SecurityType.Address,
        level: SecurityMessageLevel.Safe,
        condition: (info: AddressSecurity) => safeCompare(info.stealing_attack, '0'),
        title: () => t`No stealing attack involved.`,
        message: () => t`No stealing attack found.`,
        shouldHide: isUnset('stealing_attack'),
    },
    {
        type: SecurityType.Address,
        level: SecurityMessageLevel.High,
        condition: (info: AddressSecurity) => safeCompare(info.stealing_attack, '1'),
        title: () => t`Stealing attack.`,
        message: () => t`Stealing attack found.`,
        shouldHide: isUnset('stealing_attack'),
    },
    // Fake KYC
    {
        type: SecurityType.Address,
        level: SecurityMessageLevel.Safe,
        condition: (info: AddressSecurity) => safeCompare(info.fake_kyc, '0'),
        title: () => t`No fake KYC involved.`,
        message: () => t`No fake KYC found.`,
        shouldHide: isUnset('fake_kyc'),
    },
    {
        type: SecurityType.Address,
        level: SecurityMessageLevel.High,
        condition: (info: AddressSecurity) => safeCompare(info.fake_kyc, '1'),
        title: () => t`Fake KYC.`,
        message: () => t`Fake KYC found.`,
        shouldHide: isUnset('fake_kyc'),
    },
    // Malicious mining activities
    {
        type: SecurityType.Address,
        level: SecurityMessageLevel.Safe,
        condition: (info: AddressSecurity) => safeCompare(info.malicious_mining_activities, '0'),
        title: () => t`No malicious mining activities involved.`,
        message: () => t`No malicious mining activities found.`,
        shouldHide: isUnset('malicious_mining_activities'),
    },
    {
        type: SecurityType.Address,
        level: SecurityMessageLevel.High,
        condition: (info: AddressSecurity) => safeCompare(info.malicious_mining_activities, '1'),
        title: () => t`Malicious mining activities.`,
        message: () => t`Malicious mining activities found.`,
        shouldHide: isUnset('malicious_mining_activities'),
    },
    // Darkweb transactions
    {
        type: SecurityType.Address,
        level: SecurityMessageLevel.Safe,
        condition: (info: AddressSecurity) => safeCompare(info.darkweb_transactions, '0'),
        title: () => t`No darkweb transactions involved.`,
        message: () => t`No darkweb transactions found.`,
        shouldHide: isUnset('darkweb_transactions'),
    },
    {
        type: SecurityType.Address,
        level: SecurityMessageLevel.High,
        condition: (info: AddressSecurity) => safeCompare(info.darkweb_transactions, '1'),
        title: () => t`Darkweb transactions.`,
        message: () => t`Darkweb transactions found.`,
        shouldHide: isUnset('darkweb_transactions'),
    },
    // Cybercrime
    {
        type: SecurityType.Address,
        level: SecurityMessageLevel.Safe,
        condition: (info: AddressSecurity) => safeCompare(info.cybercrime, '0'),
        title: () => t`No cybercrime involved.`,
        message: () => t`No cybercrime found.`,
        shouldHide: isUnset('cybercrime'),
    },
    {
        type: SecurityType.Address,
        level: SecurityMessageLevel.High,
        condition: (info: AddressSecurity) => safeCompare(info.cybercrime, '1'),
        title: () => t`Cybercrime.`,
        message: () => t`Cybercrime found.`,
        shouldHide: isUnset('cybercrime'),
    },
    // Money laundering
    {
        type: SecurityType.Address,
        level: SecurityMessageLevel.Safe,
        condition: (info: AddressSecurity) => safeCompare(info.money_laundering, '0'),
        title: () => t`No money laundering involved.`,
        message: () => t`No money laundering found.`,
        shouldHide: isUnset('money_laundering'),
    },
    {
        type: SecurityType.Address,
        level: SecurityMessageLevel.High,
        condition: (info: AddressSecurity) => safeCompare(info.money_laundering, '1'),
        title: () => t`Money laundering.`,
        message: () => t`Money laundering found.`,
        shouldHide: isUnset('money_laundering'),
    },
    // Financial crime
    {
        type: SecurityType.Address,
        level: SecurityMessageLevel.Safe,
        condition: (info: AddressSecurity) => safeCompare(info.financial_crime, '0'),
        title: () => t`No financial crime involved.`,
        message: () => t`No financial crime found.`,
        shouldHide: isUnset('financial_crime'),
    },
    {
        type: SecurityType.Address,
        level: SecurityMessageLevel.High,
        condition: (info: AddressSecurity) => safeCompare(info.financial_crime, '1'),
        title: () => t`Financial crime.`,
        message: () => t`Financial crime found.`,
        shouldHide: isUnset('financial_crime'),
    },
    // Blacklist doubt
    {
        type: SecurityType.Address,
        level: SecurityMessageLevel.Safe,
        condition: (info: AddressSecurity) => safeCompare(info.blacklist_doubt, '0'),
        title: () => t`No suspected malicious behavior found.`,
        message: () => t`No suspected malicious behavior found.`,
        shouldHide: isUnset('blacklist_doubt'),
    },
    {
        type: SecurityType.Address,
        level: SecurityMessageLevel.High,
        condition: (info: AddressSecurity) => safeCompare(info.blacklist_doubt, '1'),
        title: () => t`Suspected malicious address.`,
        message: () => t`Suspected malicious address found.`,
        shouldHide: isUnset('blacklist_doubt'),
    },
    // Mixer
    {
        type: SecurityType.Address,
        level: SecurityMessageLevel.Safe,
        condition: (info: AddressSecurity) => safeCompare(info.mixer, '0'),
        title: () => t`No cryptocurrency mixer involved.`,
        message: () => t`No cryptocurrency mixer found.`,
        shouldHide: isUnset('mixer'),
    },
    {
        type: SecurityType.Address,
        level: SecurityMessageLevel.High,
        condition: (info: AddressSecurity) => safeCompare(info.mixer, '1'),
        title: () => t`Cryptocurrency mixer.`,
        message: () => t`Cryptocurrency mixer found.`,
        shouldHide: isUnset('mixer'),
    },
    // Sanctioned
    {
        type: SecurityType.Address,
        level: SecurityMessageLevel.Safe,
        condition: (info: AddressSecurity) => safeCompare(info.sanctioned, '0'),
        title: () => t`Non-sanctioned address.`,
        message: () => t`Non-sanctioned address found.`,
        shouldHide: isUnset('sanctioned'),
    },
    {
        type: SecurityType.Address,
        level: SecurityMessageLevel.High,
        condition: (info: AddressSecurity) => safeCompare(info.sanctioned, '1'),
        title: () => t`Sanctioned address.`,
        message: () => t`Sanctioned address found.`,
        shouldHide: isUnset('sanctioned'),
    },
    // Contract address
    {
        type: SecurityType.Address,
        level: SecurityMessageLevel.Safe,
        condition: (info: AddressSecurity) => safeCompare(info.contract_address, '0'),
        title: () => t`Non-contract address.`,
        message: () => t`Non-contract address found.`,
        shouldHide: isUnset('contract_address'),
    },
    {
        type: SecurityType.Address,
        level: SecurityMessageLevel.Medium,
        condition: (info: AddressSecurity) => safeCompare(info.contract_address, '1'),
        title: () => t`Contract address.`,
        message: () => t`Contract address found.`,
        shouldHide: isUnset('contract_address'),
    },
];

export const SiteSecurityMessages: Array<SecurityMessage<SiteSecurity>> = [
    {
        type: SecurityType.Site,
        level: SecurityMessageLevel.Safe,
        condition: (info: SiteSecurity) => safeCompare(info.phishing_site, '0'),
        title: () => t`No phishing site.`,
        message: () => t`No phishing site found.`,
        shouldHide: isUnset('phishing_site'),
    },
    {
        type: SecurityType.Site,
        level: SecurityMessageLevel.High,
        condition: (info: SiteSecurity) => safeCompare(info.phishing_site, '1'),
        title: () => t`Phishing site.`,
        message: () => t`Website is a phishing site.`,
        shouldHide: isUnset('phishing_site'),
    },
];

export const NFTSecurityMessages: Array<SecurityMessage<NFTSecurity>> = [
    // oversupply_minting
    {
        type: SecurityType.NFT,
        level: SecurityMessageLevel.Safe,
        condition: (info: NFTSecurity) => safeCompare(info.oversupply_minting, '0'),
        title: () => t`No oversupply minting.`,
        message: () =>
            t`NFT owner cant bypass the maximum amount of minting specified in the contract, and continue to mint NFTs beyond this limit.`,
        shouldHide: isUnset('oversupply_minting'),
    },
    {
        type: SecurityType.NFT,
        level: SecurityMessageLevel.High,
        condition: (info: NFTSecurity) => safeCompare(info.oversupply_minting, '1'),
        title: () => t`Oversupply minting.`,
        message: () =>
            t`NFT owner can bypass the maximum amount of minting specified in the contract, and continue to mint NFTs beyond this limit.`,
        shouldHide: isUnset('oversupply_minting'),
    },
    // restricted_approval
    {
        type: SecurityType.NFT,
        level: SecurityMessageLevel.Safe,
        condition: (info: NFTSecurity) => safeCompare(info.restricted_approval, '0'),
        title: () => t`No restricted approval.`,
        message: () => t`NFT contract cant restrict the approval, resulting in NFT can not be traded on the NFT DEX.`,
        shouldHide: isUnset('restricted_approval'),
    },
    {
        type: SecurityType.NFT,
        level: SecurityMessageLevel.High,
        condition: (info: NFTSecurity) => safeCompare(info.restricted_approval, '1'),
        title: () => t`Restricted approval.`,
        message: () => t`NFT contract can restrict the approval, resulting in NFT can not be traded on the NFT DEX.`,
        shouldHide: isUnset('restricted_approval'),
    },
    // metadata_frozen
    {
        type: SecurityType.NFT,
        level: SecurityMessageLevel.Safe,
        condition: (info: NFTSecurity) => safeCompare(info.metadata_frozen, '1'),
        title: () => t`Metadata frozen.`,
        message: () =>
            t`The metadata of this NFT is stored in IPFS, AR, generated by contract, or another decentralized way.`,
        shouldHide: isUnset('metadata_frozen'),
    },
    {
        type: SecurityType.NFT,
        level: SecurityMessageLevel.Medium,
        condition: (info: NFTSecurity) => safeCompare(info.metadata_frozen, '0'),
        title: () => t`Metadata not frozen.`,
        message: () =>
            t`The metadata of this NFT is not stored in IPFS, AR, generated by contract, or another decentralized way.`,
        shouldHide: isUnset('metadata_frozen'),
    },
    // nft_proxy
    {
        type: SecurityType.NFT,
        level: SecurityMessageLevel.Safe,
        condition: (info: NFTSecurity) => safeCompare(info.nft_proxy, '0'),
        title: () => t`No proxy contract.`,
        message: () => t`This NFT contract doesn't have a proxy contract.`,
        shouldHide: isUnset('nft_proxy'),
    },
    {
        type: SecurityType.NFT,
        level: SecurityMessageLevel.Medium,
        condition: (info: NFTSecurity) => safeCompare(info.nft_proxy, '1'),
        title: () => t`Proxy contract.`,
        message: () => t`This NFT contract has a proxy contract.`,
        shouldHide: isUnset('nft_proxy'),
    },
];
