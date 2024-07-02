import { t, Trans } from '@lingui/macro';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { VersionedTransaction } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';
import { take } from 'lodash-es';
import { type ReactNode, useEffect, useMemo, useReducer } from 'react';

import type { ButtonProps } from '@/components/Blink/ActionButton.js';
import type { InputProps } from '@/components/Blink/ActionInput.js';
import { ActionLayout, type ActionType } from '@/components/Blink/ActionLayout.js';
import { ClickableButton } from '@/components/ClickableButton.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { parseURL } from '@/helpers/parseURL.js';
import { BlinkRegistry } from '@/providers/blink/Registry.js';
import type {
    Action,
    ActionComponent,
    ActionsSpecPostRequestBody,
    ActionsSpecPostResponse,
} from '@/providers/types/Blink.js';

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
    const { data: registry, isLoading: isLoadingRegistry } = useQuery({
        queryKey: ['blink-action-register'],
        async queryFn() {
            const config = await BlinkRegistry.fetchActionsRegistryConfig();
            return Object.fromEntries(config.actions.map((action) => [action.host, action]));
        },
    });

    const actionUrl = parseURL(action.url);
    const websiteText = parseURL(action.websiteUrl)?.hostname;
    const actionState: ActionType = (actionUrl ? registry?.[actionUrl.hostname]?.state : null) ?? 'unknown';

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
                      action.actions.filter((it) => it.parameter),
                      SOFT_LIMIT_INPUTS,
                  )
                : [],
        [action.actions],
    );

    const walletModal = useWalletModal();
    const { connection } = useConnection();
    const wallet = useWallet();

    const postActionComponent = (account: string, component: ActionComponent, params?: Record<string, string>) => {
        const parameterValue =
            component.parameter && params ? params[component.parameter.name] : component.parameterValue;
        const href = component.parameter
            ? component.href.replace(`{${component.parameter.name}}`, parameterValue.trim())
            : component.href;
        return fetchJSON<ActionsSpecPostResponse>(href, {
            method: 'POST',
            body: JSON.stringify({ account } as ActionsSpecPostRequestBody),
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
            const transaction = VersionedTransaction.deserialize(Buffer.from(tx.transaction, 'base64'));
            const {
                context: { slot: minContextSlot },
                value: { blockhash, lastValidBlockHeight },
            } = await connection.getLatestBlockhashAndContext();
            const signature = await wallet.sendTransaction(transaction, connection, { minContextSlot });
            await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
            if (tx.message) {
                enqueueSuccessMessage(tx.message);
            }
            dispatch({
                type: ExecutionType.FINISH,
                successMessage: tx.message,
            });
        } catch (error) {
            enqueueErrorMessage(getSnackbarMessageFromError(error, t`Unknown error`), {
                error,
            });
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

    const asInputProps = (it: ActionComponent): InputProps => ({
        // since we already filter this, we can safely assume that parameter is not null
        placeholder: it.parameter!.label,
        disabled: action.disabled || executionState.status !== 'idle' || !!executionState.executingAction,
        name: it.parameter!.name,
        button: asButtonProps(it),
    });

    const disclaimer = useMemo(() => {
        if (actionState === 'malicious' && executionState.status === 'blocked') {
            return (
                <div className="rounded-2xl border border-danger bg-danger/10 p-4 text-[15px] leading-5 text-danger">
                    <p>
                        <Trans>
                            This Action has been flagged as an unsafe action, & has been blocked. If you believe this
                            action has been blocked in error, please.
                        </Trans>
                        {!isPassingSecurityCheck ? (
                            <Trans>Your action provider blocks execution of this action.</Trans>
                        ) : null}
                    </p>
                    {isPassingSecurityCheck ? (
                        <ClickableButton
                            className="mt-3 text-[15px] font-bold leading-5 text-danger"
                            onClick={() => dispatch({ type: ExecutionType.UNBLOCK })}
                        >
                            <Trans>Ignore warning and proceed</Trans>
                        </ClickableButton>
                    ) : null}
                </div>
            );
        }
        if (actionState === 'unknown') {
            return (
                <div className="rounded-2xl border border-warn bg-warn/10 p-4 text-[15px] leading-5 text-warn">
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
            title={action.title}
            description={action.description}
            websiteUrl={action.websiteUrl}
            websiteText={websiteText}
            image={action.icon}
            disclaimer={isLoadingRegistry ? null : disclaimer}
            success={executionState.successMessage}
            buttons={buttons.map(asButtonProps)}
            inputs={inputs.map(asInputProps)}
        />
    );
}
