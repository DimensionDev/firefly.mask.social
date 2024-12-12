import { t, Trans } from '@lingui/macro';
import { useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script';
import {
    ChainBoundary,
    EthereumERC20TokenApprovedBoundary,
    FungibleTokenInput,
    PluginWalletStatusBar,
    SelectGasSettingsToolbar,
    TokenValue,
    useAvailableBalance,
    WalletConnectedBoundary,
} from '@masknet/shared';
import { useNativeTokenPrice } from '@masknet/web3-hooks-base';
import {
    formatBalance,
    type FungibleToken,
    isGreaterThan,
    isZero,
    multipliedBy,
    rightShift,
    TokenType,
    ZERO,
} from '@masknet/web3-shared-base';
import {
    type ChainId,
    type GasConfig,
    SchemaType,
    useRedPacketConstants,
    ZERO_ADDRESS,
} from '@masknet/web3-shared-evm';
import { Box, InputBase, Typography, useTheme } from '@mui/material';
import { BigNumber } from 'bignumber.js';
import { omit } from 'lodash-es';
import { type ChangeEvent, useCallback, useMemo, useState } from 'react';
import { useUpdateEffect } from 'react-use';
import { isAddress } from 'viem';
import { switchChain } from 'wagmi/actions';

import { config } from '@/configs/wagmiClient.js';
import { NetworkPluginID } from '@/constants/enum.js';
import { createAccount } from '@/helpers/createAccount.js';
import { isSameEthereumAddress } from '@/helpers/isSameAddress.js';
import { useChainContext } from '@/hooks/useChainContext.js';
import { ActionButton, Icons, MaskTextField, RadioIndicator } from '@/mask/bindings/components.js';
import { useTransactionValue } from '@/mask/bindings/hooks.js';
import { EVMChainResolver, makeStyles } from '@/mask/bindings/index.js';
import {
    RED_PACKET_DEFAULT_SHARES,
    RED_PACKET_MAX_SHARES,
    RED_PACKET_MIN_SHARES,
} from '@/mask/plugins/red-packet/constants.js';
import { type RedPacketSettings, useCreateParams } from '@/mask/plugins/red-packet/hooks/useCreateCallback.js';
import { useDefaultCreateGas } from '@/mask/plugins/red-packet/hooks/useDefaultCreateGas.js';
import { TokenSelectorModalRef } from '@/modals/controls.js';
import type { Token } from '@/providers/types/Transfer.js';

// seconds of 1 day
const duration = 60 * 60 * 24;

const useStyles = makeStyles()((theme) => ({
    field: {
        display: 'flex',
        gap: 16,
        margin: 16,
    },
    input: {
        flex: 1,
    },
    button: {
        margin: 0,
        padding: 0,
        height: 40,
        maxWidth: 286,
    },
    unlockContainer: {
        margin: 0,
        columnGap: 16,
        flexFlow: 'unset',
        ['& > div']: {
            padding: '0px !important',
        },
    },
    option: {
        display: 'flex',
        width: '50%',
        alignItems: 'center',
        color: theme.palette.maskColor.line,
    },
    checkIconWrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        borderRadius: '50%',
        marginRight: 5,
        backgroundColor: 'transparent',
    },
    tokenValue: {
        flexGrow: 1,
    },
    title: {
        fontSize: 14,
        fontWEight: 700,
        lineHeight: '18px',
    },
}));

interface RedPacketFormProps {
    setERC721DialogHeight?: (height: number) => void;
    gasOption?: GasConfig;
    expectedChainId: ChainId;
    origin?: RedPacketSettings;
    onClose: () => void;
    onNext: () => void;
    onGasOptionChange?: (config: GasConfig) => void;
    onChange(settings: RedPacketSettings): void;
}

function formatDebankToken(token: Token): FungibleToken<ChainId, SchemaType> {
    // it is not a valid address if its native token
    const address = isAddress(token.id) ? token.id : ZERO_ADDRESS;

    return {
        amount: token.raw_amount_hex_str,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        logoURL: token.logo_url,
        id: address,
        chainId: token.chainId,
        type: TokenType.Fungible,
        schema: SchemaType.ERC20,
        address,
    } as FungibleToken<ChainId, SchemaType>;
}

export function RedPacketERC20Form(props: RedPacketFormProps) {
    const { origin, expectedChainId, gasOption, onChange, onNext, onGasOptionChange } = props;
    const { classes } = useStyles();
    const theme = useTheme();

    // context
    const { account, chainId } = useChainContext({ chainId: expectedChainId });
    const { HAPPY_RED_PACKET_ADDRESS_V4 } = useRedPacketConstants(chainId);

    // #region select token
    const nativeTokenDetailed = useMemo(() => EVMChainResolver.nativeCurrency(chainId), [chainId]);
    const { data: nativeTokenPrice = 0 } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, { chainId });
    const [token = nativeTokenDetailed, setToken] = useState<FungibleToken<ChainId, SchemaType> | undefined>(
        origin?.token,
    );

    const onSelectTokenChipClick = useCallback(async () => {
        const picked = await TokenSelectorModalRef.openAndWaitForClose({
            address: account,
            isSelected: (item) => {
                const address = isAddress(item.id) ? item.id : ZERO_ADDRESS;
                return isSameEthereumAddress(address, token?.address) && item.chainId === token?.chainId;
            },
        });
        if (!picked) return;
        if (chainId !== picked.chainId) {
            await switchChain(config, {
                chainId: picked.chainId,
            });
        }
        setToken(formatDebankToken(picked));
    }, [token, chainId, account]);
    // #endregion

    // #region packet settings
    const [isRandom, setRandom] = useState(!origin ? 1 : origin.isRandom ? 1 : 0);
    const [message, setMessage] = useState(origin?.message || '');
    const myIdentity = useLastRecognizedIdentity();

    const senderName = myIdentity?.identifier?.userId || 'Unknown User';

    // shares
    const [shares, setShares] = useState<number | ''>(origin?.shares || RED_PACKET_DEFAULT_SHARES);
    const onShareChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
        const shares_ = ev.currentTarget.value.replaceAll(/[,.]/g, '');
        if (shares_ === '') setShares('');
        else if (/^[1-9]+\d*$/.test(shares_)) {
            const parsed = Number.parseInt(shares_, 10);
            if (parsed >= RED_PACKET_MIN_SHARES && parsed <= RED_PACKET_MAX_SHARES) {
                setShares(Number.parseInt(shares_, 10));
            } else if (parsed > RED_PACKET_MAX_SHARES) {
                setShares(RED_PACKET_MAX_SHARES);
            }
        }
    }, []);

    // amount
    const [rawAmount, setRawAmount] = useState(
        !origin
            ? ''
            : origin.isRandom
              ? formatBalance(origin.total, origin.token?.decimals ?? 0)
              : formatBalance(new BigNumber(origin.total ?? '0').div(origin.shares ?? 1), origin.token?.decimals ?? 0),
    );
    const amount = rightShift(rawAmount || '0', token?.decimals);
    const rawTotalAmount = useMemo(
        () => (isRandom || !rawAmount ? rawAmount : multipliedBy(rawAmount, shares).toFixed()),
        [rawAmount, isRandom, shares],
    );

    const totalAmount = useMemo(() => multipliedBy(amount, isRandom ? 1 : (shares ?? '0')), [amount, shares, isRandom]);
    const minTotalAmount = useMemo(() => new BigNumber(isRandom ? 1 : (shares ?? 0)), [shares, isRandom]);
    const isDivisible = !totalAmount.dividedBy(shares).isLessThan(1);

    useUpdateEffect(() => {
        setRawAmount('');
    }, [token]);

    const creatingParams = useMemo(
        () => ({
            duration,
            isRandom: !!isRandom,
            name: senderName,
            message: message || t`Best Wishes!`,
            shares: shares || 0,
            token: token
                ? (omit(token, ['logoURI']) as FungibleToken<ChainId, SchemaType.ERC20 | SchemaType.Native>)
                : undefined,
            total: totalAmount.toFixed(),
        }),
        [isRandom, senderName, message, shares, token, totalAmount],
    );

    const onClick = useCallback(() => {
        onChange(creatingParams);
        onNext();
    }, [creatingParams, onChange, onNext]);

    // #region gas
    const { account: publicKey } = useMemo(createAccount, []);
    const contract_version = 4;
    const { value: params } = useCreateParams(chainId, creatingParams, contract_version, publicKey);
    // #endregion

    // balance
    const { value: defaultGas = ZERO } = useDefaultCreateGas(
        {
            duration,
            isRandom: !!isRandom,
            name: senderName,
            message: message || t`Best Wishes!`,
            shares: shares || 0,
            token: token
                ? (omit(token, ['logoURI']) as FungibleToken<ChainId, SchemaType.ERC20 | SchemaType.Native>)
                : undefined,
            total: rightShift(0.01, token?.decimals).toFixed(),
        },
        contract_version,
        publicKey,
    );
    const { isAvailableBalance, balance, isGasSufficient } = useAvailableBalance(
        NetworkPluginID.PLUGIN_EVM,
        token?.address,
        gasOption ? { ...gasOption, gas: new BigNumber(defaultGas).toString() } : undefined,
        {
            chainId,
        },
    );

    const { transactionValue, loading: loadingTransactionValue } = useTransactionValue(
        origin?.total,
        gasOption?.gas,
        gasOption?.gasCurrency,
    );
    // #endregion

    const validationMessage = useMemo(() => {
        if (!token) return t`Select a Token`;
        if (!account) return t`Connect Wallet`;
        if (isZero(shares || '0')) return t`Enter Number of Winners`;
        if (isGreaterThan(shares || '0', 255)) return t`At most 255 recipients`;
        if (isGreaterThan(minTotalAmount, balance) || isGreaterThan(totalAmount, balance))
            return t`Insufficient ${token.symbol} Balance`;
        if (isZero(amount)) {
            return isRandom ? t`Enter Total Amount` : t`Enter Amount Each`;
        }

        if (!isDivisible)
            return t`The minimum amount for each share is ${formatBalance(1, token.decimals)} ${token.symbol}`;
        return '';
    }, [token, account, shares, minTotalAmount, balance, totalAmount, amount, isDivisible, isRandom]);

    const gasValidationMessage = useMemo(() => {
        if (!token) return '';
        if (!isGasSufficient) {
            return t`Insufficient Balance for Gas Fee`;
        }
        if (!loadingTransactionValue && new BigNumber(transactionValue).isLessThanOrEqualTo(0))
            return t`Insufficient Balance`;

        return '';
    }, [token, isGasSufficient, loadingTransactionValue, transactionValue]);

    if (!token) return null;

    return (
        <>
            <div className={classes.field}>
                <div className={classes.option}>
                    <div className={classes.checkIconWrapper}>
                        <RadioIndicator onClick={() => setRandom(1)} checked={!!isRandom} size={20} />
                    </div>
                    <Typography
                        color={isRandom ? theme.palette.maskColor.main : theme.palette.maskColor.second}
                        fontSize={16}
                        fontWeight={isRandom ? 700 : 400}
                    >
                        <Trans>Random Amount</Trans>
                    </Typography>
                </div>
                <div className={classes.option}>
                    <div className={classes.checkIconWrapper}>
                        <RadioIndicator onClick={() => setRandom(0)} checked={!isRandom} size={20} />
                    </div>
                    <Typography
                        color={!isRandom ? theme.palette.maskColor.main : theme.palette.maskColor.second}
                        fontSize={16}
                        fontWeight={!isRandom ? 700 : 400}
                    >
                        {t`Equal Amount`}
                    </Typography>
                </div>
            </div>
            <div className={classes.field}>
                <MaskTextField
                    wrapperProps={{ className: classes.input }}
                    value={shares}
                    fullWidth
                    onChange={onShareChange}
                    InputProps={{
                        endAdornment: (
                            <>
                                <Typography
                                    color={theme.palette.maskColor.third}
                                    fontSize={14}
                                    marginRight={0.5}
                                    whiteSpace="nowrap"
                                >
                                    <Trans>Winners</Trans>
                                </Typography>
                                <Icons.RedPacket size={18} />
                            </>
                        ),
                        inputProps: {
                            autoComplete: 'off',
                            autoCorrect: 'off',
                            inputMode: 'decimal',
                            placeholder: t`Enter number of winners`,
                            spellCheck: false,
                            pattern: '^[0-9]+$',
                        },
                    }}
                />
            </div>
            <div className={classes.field}>
                <FungibleTokenInput
                    label={isRandom ? t`Total amount` : t`Amount Each`}
                    token={token}
                    placeholder={
                        isRandom
                            ? t`Total amount shared among all winners`
                            : t`Enter the amount that each winner can claim`
                    }
                    onSelectToken={onSelectTokenChipClick}
                    onAmountChange={setRawAmount}
                    amount={rawAmount}
                    maxAmount={
                        minTotalAmount.isGreaterThan(balance) && !isZero(balance)
                            ? minTotalAmount.toString()
                            : undefined
                    }
                    isAvailableBalance={isAvailableBalance}
                    balance={balance}
                    maxAmountShares={isRandom || shares === '' ? 1 : shares}
                />
            </div>
            <Box margin={2}>
                <Typography className={classes.title}>
                    <Trans>Message</Trans>
                </Typography>
            </Box>
            <Box margin={2}>
                <InputBase
                    fullWidth
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t`Best Wishes!`}
                    value={message}
                    inputProps={{
                        maxLength: 40,
                    }}
                />
            </Box>

            <Box margin={2}>
                <SelectGasSettingsToolbar
                    nativeToken={nativeTokenDetailed}
                    nativeTokenPrice={nativeTokenPrice}
                    gasConfig={gasOption}
                    gasLimit={Number.parseInt(params?.gas ?? '0', 10)}
                    onChange={onGasOptionChange}
                />
            </Box>

            {rawTotalAmount && !isZero(rawTotalAmount) ? (
                <TokenValue className={classes.tokenValue} token={token} amount={rawTotalAmount} />
            ) : null}

            <Box style={{ width: '100%', position: 'absolute', bottom: 0 }}>
                <PluginWalletStatusBar actualPluginID={NetworkPluginID.PLUGIN_EVM}>
                    <EthereumERC20TokenApprovedBoundary
                        amount={totalAmount.toFixed()}
                        balance={balance}
                        classes={{ container: classes.unlockContainer }}
                        ActionButtonProps={{
                            size: 'medium',
                        }}
                        token={
                            token?.schema === SchemaType.ERC20 && totalAmount.gt(0) && !validationMessage
                                ? token
                                : undefined
                        }
                        tooltip={t`Grant access to your ${token.symbol} for the Lucky Drop Smart contract. You only have to do this once per token.`}
                        spender={HAPPY_RED_PACKET_ADDRESS_V4}
                    >
                        <ChainBoundary
                            expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                            expectedChainId={chainId}
                            forceShowingWrongNetworkButton
                        >
                            <WalletConnectedBoundary
                                noGasText={t`Insufficient Balance for Gas Fee`}
                                expectedChainId={chainId}
                            >
                                <ActionButton
                                    size="medium"
                                    className={classes.button}
                                    fullWidth
                                    disabled={!!validationMessage || !!gasValidationMessage}
                                    onClick={onClick}
                                >
                                    {validationMessage || gasValidationMessage || t`Next`}
                                </ActionButton>
                            </WalletConnectedBoundary>
                        </ChainBoundary>
                    </EthereumERC20TokenApprovedBoundary>
                </PluginWalletStatusBar>
            </Box>
        </>
    );
}
