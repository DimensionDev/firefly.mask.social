import { t, Trans } from '@lingui/macro';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { VersionedTransaction } from '@solana/web3.js';
import { take } from 'lodash-es';
import { type ReactNode, useMemo, useReducer } from 'react';

import { ActionLayout, type ActionType, type ButtonProps } from '@/components/SolanaBlinkRenderer/ui/ActionLayout.js';
import type { Action, ActionComponent } from '@/providers/solana-blink/Action.js';

type ExecutionStatus = 'blocked' | 'idle' | 'executing' | 'success' | 'error';

interface ExecutionState {
    status: ExecutionStatus;
    executingAction?: ActionComponent | null;
    errorMessage?: string | null;
    successMessage?: string | null;
}

enum ExecutionType {
    INITIATE = 'INITIATE',
    FINISH = 'FINISH',
    FAIL = 'FAIL',
    RESET = 'RESET',
    UNBLOCK = 'UNBLOCK',
    BLOCK = 'BLOCK',
}

type ActionValue =
    | {
          type: ExecutionType.INITIATE;
          executingAction: ActionComponent;
          errorMessage?: string;
      }
    | {
          type: ExecutionType.FINISH;
          successMessage?: string | null;
      }
    | {
          type: ExecutionType.FAIL;
          errorMessage: string;
      }
    | {
          type: ExecutionType.RESET;
      }
    | {
          type: ExecutionType.UNBLOCK;
      }
    | {
          type: ExecutionType.BLOCK;
      };

const executionReducer = (state: ExecutionState, action: ActionValue): ExecutionState => {
    switch (action.type) {
        case ExecutionType.INITIATE:
            return { status: 'executing', executingAction: action.executingAction };
        case ExecutionType.FINISH:
            return {
                ...state,
                status: 'success',
                successMessage: action.successMessage,
                errorMessage: null,
            };
        case ExecutionType.FAIL:
            return {
                ...state,
                status: 'error',
                errorMessage: action.errorMessage,
                successMessage: null,
            };
        case ExecutionType.RESET:
            return {
                status: 'idle',
            };
        case ExecutionType.BLOCK:
            return {
                status: 'blocked',
            };
        case ExecutionType.UNBLOCK:
            return {
                status: 'idle',
            };
    }
};

const buttonVariantMap: Record<ExecutionStatus, 'default' | 'error' | 'success'> = {
    blocked: 'default',
    idle: 'default',
    executing: 'default',
    success: 'success',
    error: 'error',
};

const SOFT_LIMIT_BUTTONS = 10;
const SOFT_LIMIT_INPUTS = 3;

export function ActionContainer({
    action,
    websiteUrl,
    websiteText,
}: {
    action: Action;
    websiteUrl?: string;
    websiteText?: string;
}) {
    const actionState: ActionType = 'unknown'; // TODO: security check

    const [executionState, dispatch] = useReducer(executionReducer, {
        status: 'idle',
    });

    const buttons = useMemo(
        () =>
            action?.actions
                ? take(
                      action.actions
                          .filter((it) => !it.parameter)
                          .filter((it) =>
                              executionState.executingAction ? executionState.executingAction === it : true,
                          ),
                      SOFT_LIMIT_BUTTONS,
                  )
                : [],
        [action, executionState.executingAction],
    );
    const inputs = useMemo(
        () =>
            action?.actions
                ? take(
                      action.actions
                          .filter((it) => it.parameter)
                          .filter((it) =>
                              executionState.executingAction ? executionState.executingAction === it : true,
                          ),
                      SOFT_LIMIT_INPUTS,
                  )
                : [],
        [action, executionState.executingAction],
    );

    const walletModal = useWalletModal();
    const { connection } = useConnection();
    const wallet = useWallet();

    const execute = async (component: ActionComponent, params?: Record<string, string>) => {
        if (component.parameter && params) {
            component.setValue(params[component.parameter.name]);
        }

        dispatch({ type: ExecutionType.INITIATE, executingAction: component });

        try {
            const account = wallet.publicKey?.toString();
            if (!account) {
                walletModal.setVisible(true);
                dispatch({ type: ExecutionType.RESET });
                return;
            }

            const tx = await component.post(account);
            const transaction = VersionedTransaction.deserialize(Buffer.from(tx.transaction, 'base64'));
            const {
                context: { slot: minContextSlot },
                value: { blockhash, lastValidBlockHeight },
            } = await connection.getLatestBlockhashAndContext();
            const signature = await wallet.sendTransaction(transaction, connection, { minContextSlot });
            await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
            dispatch({
                type: ExecutionType.FINISH,
                successMessage: tx.message,
            });
        } catch (e) {
            if (e instanceof Error && e.message === 'User rejected the request.') {
                dispatch({ type: ExecutionType.RESET });
                return;
            }
            dispatch({
                type: ExecutionType.FAIL,
                errorMessage: (e as Error).message ?? t`Unknown error`,
            });
        }
    };

    const buttonLabelMap: Record<ExecutionStatus, ReactNode> = {
        blocked: null,
        idle: null,
        executing: <Trans>Executing</Trans>,
        success: <Trans>Completed</Trans>,
        error: <Trans>Failed</Trans>,
    };

    const asButtonProps = (it: ActionComponent): ButtonProps => ({
        text: buttonLabelMap[executionState.status] ?? it.label,
        loading: executionState.status === 'executing' && it === executionState.executingAction,
        disabled: action.disabled || executionState.status !== 'idle',
        variant: buttonVariantMap[executionState.status],
        onClick: (params?: Record<string, string>) => execute(it, params),
    });

    const asInputProps = (it: ActionComponent) => {
        return {
            // since we already filter this, we can safely assume that parameter is not null
            placeholder: it.parameter!.label,
            disabled: action.disabled || executionState.status !== 'idle',
            name: it.parameter!.name,
            button: asButtonProps(it),
        };
    };

    return (
        <ActionLayout
            type={actionState}
            title={action.title}
            description={action.description}
            websiteUrl={websiteUrl}
            websiteText={websiteText}
            image={action.icon}
            error={executionState.status !== 'success' ? executionState.errorMessage ?? action.error : null}
            success={executionState.successMessage}
            buttons={buttons.map(asButtonProps)}
            inputs={inputs.map(asInputProps)}
        />
    );
}
