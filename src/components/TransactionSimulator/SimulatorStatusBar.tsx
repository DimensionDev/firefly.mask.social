import { t, Trans } from '@lingui/macro';
import { useMemo } from 'react';

import LoadingIcon from '@/assets/loading.svg';
import TradeInfo from '@/assets/trade-info.svg';
import TradeSecurity from '@/assets/trade-security.svg';
import WarningIcon from '@/assets/warning.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { MessagesTippy } from '@/components/TransactionSimulator/MessagesTippy.js';
import { SimulateStatus } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { SecurityMessageLevel, type StaticSecurityMessage } from '@/providers/types/Security.js';

const statusConfig = [
    {
        status: SimulateStatus.Pending,
        icon: LoadingIcon,
        className: 'bg-lightBg text-lightSecond',
        iconClassName: 'animate-spin',
        text: () => <Trans>Simulating</Trans>,
    },
    {
        status: SimulateStatus.Unverified,
        icon: TradeInfo,
        className: 'bg-lightBg text-lightSecond',
        messages: [
            {
                level: SecurityMessageLevel.Info,
                title: t`Unverified`,
                message: t`We were unable to simulate the transaction or complete all security detection. Please proceed with caution.`,
            },
        ],
        text: () => (
            <>
                <Trans>Unverified: Failed to simulate,</Trans>
                <span className="text-lightHighlight">
                    {' '}
                    <Trans>try again</Trans>
                </span>
            </>
        ),
    },
    {
        status: SimulateStatus.Unsafe,
        icon: WarningIcon,
        className: 'bg-commonWarn/10 text-commonWarn',
        text: () => <Trans>Unsafe: Transaction is at risk</Trans>,
    },
    {
        status: SimulateStatus.Success,
        icon: TradeSecurity,
        className: 'bg-success/10 text-success',
        messages: [
            {
                level: SecurityMessageLevel.Safe,
                title: t`Verified`,
                message: t`Our transaction simulation and security detection found no issues. However, it is always crucial to double-check and proceed with caution.`,
            },
        ],
        text: () => <Trans>Verified</Trans>,
    },
    {
        status: SimulateStatus.Error,
        icon: TradeInfo,
        className: 'bg-danger/10 text-danger',
        text: (message: string) => message,
    },
];
interface SimulatorStatusBarProps {
    status: SimulateStatus;
    messages?: StaticSecurityMessage[];
}
export function SimulatorStatusBar({ status, messages: dynamicMessages }: SimulatorStatusBarProps) {
    const statusContent = useMemo(() => {
        return statusConfig.find((config) => config.status === status);
    }, [status]);
    if (!statusContent) return null;
    const messages = dynamicMessages || statusContent.messages || [];
    const StatusIcon = statusContent.icon;
    const content = (
        <ClickableButton
            className={classNames(
                'flex h-10 w-full items-center justify-center gap-2 rounded-lg px-3 text-[13px] font-bold',
                statusContent.className,
            )}
        >
            <StatusIcon className={classNames('shrink-0', statusContent.iconClassName)} width={16} height={16} />
            <span className="truncate">{statusContent.text('Error Message')}</span>
        </ClickableButton>
    );
    if (messages.length) {
        return <MessagesTippy messages={messages}>{content}</MessagesTippy>;
    }
    return content;
}
