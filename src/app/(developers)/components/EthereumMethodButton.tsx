'use client';

import { Trans } from '@lingui/macro';
import { EthereumMethodType } from '@masknet/web3-shared-evm';
import { first } from 'lodash-es';
import { useAsyncFn } from 'react-use';
import { getAccount, getBalance, sendTransaction, signMessage } from 'wagmi/actions';

import { ClickableButton } from '@/components/ClickableButton.js';
import { config } from '@/configs/wagmiClient.js';
import { SITE_DESCRIPTION } from '@/constants/index.js';
import { enqueueErrorMessage, enqueueInfoMessage, enqueueMessageFromError } from '@/helpers/enqueueMessage.js';
import { formatBalance } from '@/helpers/formatBalance.js';
import type { MethodItem } from '@/types/ethereum.js';

interface Props {
    item: MethodItem;
}

export function EthereumMethodButton({ item }: Props) {
    const [{ loading }, onClick] = useAsyncFn(async () => {
        try {
            const account = getAccount(config);
            const address = first(account.addresses);
            if (!address) {
                enqueueErrorMessage('No accounts found');
                return;
            }

            switch (item.method) {
                case EthereumMethodType.ETH_ACCOUNTS: {
                    enqueueInfoMessage(address);
                    break;
                }
                case EthereumMethodType.ETH_GET_BALANCE: {
                    const balance = await getBalance(config, {
                        address,
                    });
                    if (!balance.value) {
                        enqueueErrorMessage('No balance found');
                        break;
                    }
                    enqueueInfoMessage(
                        `${formatBalance(balance.value.toString(), balance.decimals)} ${balance.symbol}`,
                    );
                    break;
                }
                case EthereumMethodType.ETH_SIGN:
                    {
                        const signed = await signMessage(config, {
                            message: SITE_DESCRIPTION,
                        });
                        enqueueInfoMessage(signed);
                    }
                    break;
                case EthereumMethodType.ETH_SEND_TRANSACTION:
                    {
                        const hash = await sendTransaction(config, {
                            to: address,
                            value: 0n,
                        });
                        enqueueInfoMessage(hash);
                    }
                    break;
            }
        } catch (error) {
            enqueueMessageFromError(error, 'Failed to execute method');
            throw error;
        }
    }, [item.method]);

    return (
        <ClickableButton
            className="rounded-md bg-main px-2 py-1 text-primaryBottom"
            disabled={loading}
            onClick={() => {
                onClick();
            }}
        >
            <Trans>Invoke</Trans>
        </ClickableButton>
    );
}
