import { t } from '@lingui/macro';

import {
    type SecurityMessage,
    SecurityMessageLevel,
    SecurityType,
    type TokenContractSecurity,
} from '@/providers/types/Security.js';

function isUnset(name: keyof TokenContractSecurity) {
    return (info: TokenContractSecurity) => info[name] === undefined;
}
function percentageToNumber(value?: string) {
    return parseInt((value ?? '').replace('%', ''), 10) * 100;
}

export const SecurityMessages: SecurityMessage[] = [
    // open source
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenContractSecurity) => info.is_open_source === '1',
        title: () => t`Contract source code verified`,
        message: () =>
            t`This token contract is open source. You can check the contract code for details. Unsourced token contracts are likely to have malicious functions to defraud their users of their assets.`,
        shouldHide: isUnset('is_open_source'),
    },
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.High,
        condition: (info: TokenContractSecurity) => info.is_open_source === '0',
        title: () => t`Contract source code not verified`,
        message: () =>
            t`This token contract has not been verified. We cannot check the contract code for details. Unsourced token contracts are likely to have malicious functions to defraud users of their assets.`,
        shouldHide: isUnset('is_open_source'),
    },
    // proxy
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenContractSecurity) => info.is_proxy === '1',
        title: () => t`Proxy contract`,
        message: () =>
            t`This contract is an Admin Upgradeability Proxy. The proxy contract means the contract owner can modify the function of the token and could possibly effect the price.There is possibly a way for the team to Rug or Scam. Please confirm the details with the project team before buying.`,
        shouldHide: isUnset('is_proxy'),
    },
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenContractSecurity) => info.is_proxy === '0',
        title: () => t`No proxy`,
        message: () =>
            t`There is no proxy in the contract. The proxy contract means contract owner can modify the function of the token and possibly effect the price.`,
        shouldHide: isUnset('is_proxy'),
    },
    // mint
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenContractSecurity) => info.is_mintable === '0',
        title: () => t`No mint function`,
        message: () =>
            t`Mint function is transparent or non-existent. Hidden mint functions may increase the amount of tokens in circulation and effect the price of the token.`,
        shouldHide: isUnset('is_mintable'),
    },
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenContractSecurity) => info.is_mintable === '1',
        title: () => t`Mint function`,
        message: () =>
            t`The contract may contain additional issuance functions, which could maybe generate a large number of tokens, resulting in significant fluctuations in token prices. It is recommended to confirm with the project team whether it complies with the token issuance instructions.`,
        shouldHide: isUnset('is_mintable'),
    },
    // owner change balance
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenContractSecurity) => info.owner_change_balance === '0',
        title: () => t`Owner can't change balance`,
        message: () =>
            t`The contract owner is not found to have the authority to modify the balance of tokens at other addresses.`,
        shouldHide: isUnset('owner_change_balance'),
    },
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenContractSecurity) => info.owner_change_balance === '1',
        title: () => t`Owner can change balance`,
        message: () =>
            t`The contract owner has the authority to modify the balance of tokens at other addresses, which may result in a loss of assets.`,
        shouldHide: isUnset('owner_change_balance'),
    },
    // can take back ownership
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenContractSecurity) => info.can_take_back_ownership === '0',
        title: () => t`No function found that retrieves ownership`,
        message: () =>
            t`If this function exists, it is possible for the project owner to regain ownership even after relinquishing it`,
        shouldHide: isUnset('can_take_back_ownership'),
    },
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenContractSecurity) => info.can_take_back_ownership === '1',
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
        condition: (info: TokenContractSecurity) => info.is_honeypot === '0',
        title: () => t`This does not appear to be a honeypot.`,
        message: () => t`We are not aware of any code that prevents the sale of tokens.`,
        shouldHide: isUnset('is_honeypot'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.High,
        condition: (info: TokenContractSecurity) => info.is_honeypot === '1',
        title: () => t`May the token is a honeypot.`,
        message: () => t`This token contract has a code that states that it cannot be sold. Maybe this is a honeypot.`,
        shouldHide: isUnset('is_honeypot'),
    },
    // transfer_pausable
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenContractSecurity) => info.transfer_pausable === '0',
        title: () => t`No codes found to suspend trading.`,
        message: () =>
            t`If a suspendable code is included, the token maybe neither be bought nor sold (honeypot risk).`,
        shouldHide: isUnset('transfer_pausable'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenContractSecurity) => info.transfer_pausable === '1',
        title: () => t`Functions that can suspend trading`,
        message: () =>
            t`If a suspendable code is included, the token maybe neither be bought nor sold (honeypot risk).`,
        shouldHide: isUnset('transfer_pausable'),
    },
    // anti whale
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenContractSecurity) => info.is_anti_whale === '0',
        title: () => t`No anti_whale(Unlimited number of transactions)`,
        message: () =>
            t`There is no limit to the number of token transactions. The number of scam token transactions may be limited (honeypot risk).`,
        shouldHide: isUnset('is_anti_whale'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenContractSecurity) => info.is_anti_whale === '1',
        title: () => t`Anti_whale(Limited number of transactions)`,
        message: () =>
            t`The number of token transactions is limited. The number of scam token transactions may be limited (honeypot risk).`,
        shouldHide: isUnset('is_anti_whale'),
    },
    // slippage modifiable
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenContractSecurity) => info.slippage_modifiable === '0',
        title: () => t`Tax cannot be modified`,
        message: () =>
            t`The contract owner may not contain the authority to modify the transaction tax. If the transaction tax is increased to more than 49%, the tokens will not be able to be traded (honeypot risk).`,
        shouldHide: isUnset('slippage_modifiable'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenContractSecurity) => info.slippage_modifiable === '1',
        title: () => t`Tax can be modified`,
        message: () =>
            t`The contract owner may contain the authority to modify the transaction tax. If the transaction tax is increased to more than 49%, the tokens will not be able to be traded (honeypot risk).`,
        shouldHide: isUnset('slippage_modifiable'),
    },
    // black list
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenContractSecurity) => info.is_blacklisted === '0',
        title: () => t`No blacklist`,
        message: () =>
            t`The blacklist function is not included. If there is a blacklist, some addresses may not be able to trade normally (honeypot risk).`,
        shouldHide: isUnset('is_blacklisted'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenContractSecurity) => info.is_blacklisted === '1',
        title: () => t`Blacklist function`,
        message: () =>
            t`The blacklist function is included. Some addresses may not be able to trade normally (honeypot risk).`,
        shouldHide: isUnset('is_blacklisted'),
    },
    // white list
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenContractSecurity) => info.is_whitelisted === '0',
        title: () => t`No whitelist`,
        message: () =>
            t`The whitelist function is not included. If there is a whitelist, some addresses may not be able to trade normally (honeypot risk).`,
        shouldHide: isUnset('is_whitelisted'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenContractSecurity) => info.is_whitelisted === '1',
        title: () => t`Whitelist function`,
        message: () =>
            t`The whitelist function is included. Some addresses may not be able to trade normally (honeypot risk).`,
        shouldHide: isUnset('is_whitelisted'),
    },
    // true token
    {
        type: SecurityType.Info,
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenContractSecurity) => info.is_true_token === '1',
        title: () => t`True Token`,
        message: () =>
            t`This token is issued by its declared team. Some scams will create a well-known token with the same name to defraud their users of their assets.`,
        shouldHide: isUnset('is_true_token'),
    },
    {
        type: SecurityType.Info,
        level: SecurityMessageLevel.High,
        condition: (info: TokenContractSecurity) => info.is_true_token === '0',
        title: () => t`Fake Token`,
        message: () =>
            t`This token is not issued by its declared team. Some scams will create a well-known token with the same name to defraud their users of their assets.`,
        shouldHide: isUnset('is_true_token'),
    },
    // Airdrop scam
    {
        type: SecurityType.Info,
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenContractSecurity) => info.is_airdrop_scam === '0',
        title: () => t`Airdrop Scam`,
        message: () => t`You may lose your assets if giving approval to the website of this token.`,
        shouldHide: isUnset('is_airdrop_scam'),
    },
    {
        type: SecurityType.Info,
        level: SecurityMessageLevel.High,
        condition: (info: TokenContractSecurity) => info.is_airdrop_scam === '1',
        title: () => t`No Airdrop Scam`,
        message: () => t`This is not an airdrop scam. Many scams attract users through airdrops.`,
        shouldHide: isUnset('is_airdrop_scam'),
    },
];
