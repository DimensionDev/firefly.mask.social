import { t, Trans } from '@lingui/macro';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { VersionedTransaction } from '@solana/web3.js';
import { take } from 'lodash-es';
import { type ReactNode, useEffect, useMemo, useReducer } from 'react';

import type { ButtonProps } from '@/components/Blink/ActionButton.js';
import type { InputProps } from '@/components/Blink/ActionInput.js';
import { ActionLayout } from '@/components/Blink/ActionLayout.js';
import { ClickableButton } from '@/components/ClickableButton.js';
import { FetchError } from '@/constants/error.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { parseJSON } from '@/helpers/parseJSON.js';
import type { ActionPostResponse } from '@/providers/types/Blink.js';
import type { Action, ActionComponent, ActionParameter, ActionType } from '@/types/blink.js';

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
          type: ExecutionType.RESET;
      }
    | {
          type: ExecutionType.UNBLOCK;
      }
    | {
          type: ExecutionType.BLOCK;
      };

const getNextExecutionState = (state: ExecutionState, action: ActionValue): ExecutionState => {
    switch (action.type) {
        case ExecutionType.INITIATE:
            if (state.status === 'blocked') return state;
            return { status: 'executing', executingAction: action.executingAction };
        case ExecutionType.FINISH:
            return {
                ...state,
                status: 'success',
                successMessage: action.successMessage,
                errorMessage: null,
            };
        case ExecutionType.BLOCK:
            return {
                status: 'blocked',
            };
        case ExecutionType.UNBLOCK:
            if (state.status !== 'blocked') return state;
            return {
                status: 'idle',
            };
        case ExecutionType.RESET:
        default:
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

type SecurityLevel = 'only-trusted' | 'non-malicious' | 'all';

const checkSecurity = (state: ActionType, securityLevel: SecurityLevel): boolean => {
    switch (securityLevel) {
        case 'non-malicious':
            return state !== 'malicious';
        case 'all':
            return true;
        case 'only-trusted':
            return false;
        default:
            return state === 'trusted';
    }
};

export function ActionContainer({
    action,
    securityLevel = 'only-trusted',
}: {
    action: Action;
    securityLevel?: SecurityLevel;
}) {
    const actionState = action.state ?? 'unknown';

    const [executionState, dispatch] = useReducer(getNextExecutionState, {
        status: 'idle',
    });

    const isPassingSecurityCheck = checkSecurity(actionState, securityLevel);

    useEffect(() => {
        if (actionState === 'malicious' && !isPassingSecurityCheck) {
            dispatch({ type: ExecutionType.BLOCK });
        }
    }, [actionState, isPassingSecurityCheck]);

    const buttons = useMemo(
        () =>
            action?.actions
                ? take(
                      action.actions.filter((it) => !it.parameter),
                      SOFT_LIMIT_BUTTONS,
                  )
                : [],
        [action.actions],
    );
    const inputs = useMemo(
        () =>
            action?.actions
                ? take(
                      action.actions.filter((it) => it.parameters.length === 1),
                      SOFT_LIMIT_INPUTS,
                  )
                : [],
        [action.actions],
    );

    const form = useMemo(() => {
        const [formComponent] = action?.actions.filter((it) => it.parameters.length > 1) ?? [];
        return formComponent;
    }, [action]);

    const walletModal = useWalletModal();
    const { connection } = useConnection();
    const wallet = useWallet();

    function getHref(component: ActionComponent, parameterValue: Record<string, string> = {}) {
        // input with a button
        if (component.parameters.length === 1) {
            return component.href.replace(
                `{${component.parameter?.name}}`,
                encodeURIComponent(parameterValue[component.parameter!.name]?.trim() ?? ''),
            );
        }
        // form
        if (component.parameters.length > 1) {
            return component.parameters.reduce((href, param) => {
                return href.replace(`{${param.name}}`, encodeURIComponent(parameterValue[param.name]?.trim() ?? ''));
            }, component.href);
        }
        // button
        return component.href;
    }

    const postActionComponent = (account: string, component: ActionComponent, params?: Record<string, string>) => {
        const href = getHref(component, params);
        return fetchJSON<ActionPostResponse>(href, {
            method: 'POST',
            body: JSON.stringify({ account }),
        });
    };

    const execute = async (component: ActionComponent, params?: Record<string, string>) => {
        dispatch({ type: ExecutionType.INITIATE, executingAction: component });

        try {
            const account = wallet.publicKey?.toString();
            if (!account) {
                walletModal.setVisible(true);
                dispatch({ type: ExecutionType.RESET });
                return;
            }

            const tx = await postActionComponent(account, component, params);
            if (!tx.transaction) throw new Error(tx.message);
            const transaction = VersionedTransaction.deserialize(Buffer.from(tx.transaction, 'base64'));
            const {
                context: { slot: minContextSlot },
            } = await connection.getLatestBlockhashAndContext();
            const signature = await wallet.sendTransaction(transaction, connection, { minContextSlot });
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
            await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
            enqueueSuccessMessage(tx.message ?? t`Transaction sent successfully`);
            dispatch({
                type: ExecutionType.FINISH,
                successMessage: tx.message,
            });
        } catch (error) {
            if (error instanceof FetchError) {
                const resp = parseJSON<{ message: string }>(error.text);
                enqueueErrorMessage(resp?.message ?? t`Unknown error`);
                throw error;
            }
            enqueueErrorMessage(
                getSnackbarMessageFromError(error, error instanceof Error ? error.message : t`Unknown error`),
                {
                    error,
                },
            );
            throw error;
        } finally {
            dispatch({ type: ExecutionType.RESET });
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
        text: it === executionState.executingAction ? buttonLabelMap[executionState.status] : it.label,
        loading: executionState.status === 'executing' && it === executionState.executingAction,
        disabled: action.disabled || executionState.status !== 'idle' || !!executionState.executingAction,
        variant: it === executionState.executingAction ? buttonVariantMap[executionState.status] : 'default',
        onClick: (params?: Record<string, string>) => execute(it, params),
    });

    const asInputProps = (it: ActionComponent, parameter?: ActionParameter): InputProps => {
        const placeholder = !parameter ? it.parameter!.label : parameter.label;
        const name = !parameter ? it.parameter!.name : parameter.name;
        const required = !parameter ? it.parameter!.required : parameter.required;

        return {
            // since we already filter this, we can safely assume that parameter is not null
            placeholder,
            disabled: action.disabled || executionState.status !== 'idle' || !!executionState.executingAction,
            name,
            required,
            button: !parameter ? asButtonProps(it) : undefined,
        };
    };

    const asFormProps = (it: ActionComponent) => {
        return {
            button: asButtonProps(it),
            inputs: it.parameters.map((parameter) => asInputProps(it, parameter)),
        };
    };

    const disclaimer = useMemo(() => {
        if (actionState === 'malicious' && executionState.status === 'blocked') {
            return (
                <div className="rounded-2xl border border-danger bg-danger/10 p-4 text-medium leading-5 text-danger">
                    <Trans>This Action has been flagged as an unsafe action, & has been blocked.</Trans>
                    {isPassingSecurityCheck ? (
                        <Trans>
                            If you believe this action has been blocked in error, please <br />
                            <ClickableButton
                                className="mt-3 text-medium font-bold leading-5 text-danger"
                                onClick={() => dispatch({ type: ExecutionType.UNBLOCK })}
                            >
                                Ignore warning and proceed
                            </ClickableButton>
                            .
                        </Trans>
                    ) : null}
                </div>
            );
        }
        if (actionState === 'unknown') {
            return (
                <div className="rounded-2xl border border-warn bg-warn/10 p-4 text-medium leading-5 text-warn">
                    <p>
                        <Trans>This Action has not yet been registered. Only use it if you trust the source.</Trans>
                        {!isPassingSecurityCheck ? (
                            <Trans>Your action provider blocks execution of this action.</Trans>
                        ) : null}
                    </p>
                </div>
            );
        }
        return null;
    }, [actionState, executionState.status, isPassingSecurityCheck]);

    return (
        <ActionLayout
            type={actionState}
            action={action}
            disclaimer={disclaimer}
            successMessage={executionState.successMessage}
            buttons={buttons.map(asButtonProps)}
            inputs={inputs.map((input) => asInputProps(input))}
            form={form ? asFormProps(form) : undefined}
        />
    );
}
