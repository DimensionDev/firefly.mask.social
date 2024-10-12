import { useMemo } from 'react';

import { ClickableButton } from '@/components/ClickableButton.js';
import { getStatusConfig } from '@/components/TransactionSimulator/config.js';
import { MessagesTippy } from '@/components/TransactionSimulator/MessagesTippy.js';
import { SimulateStatus } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { type StaticSecurityMessage } from '@/providers/types/Security.js';

interface SimulatorStatusBarProps {
    status: SimulateStatus;
    messages?: StaticSecurityMessage[];
    retry?: () => void;
}
export function SimulatorStatusBar({ status, messages: dynamicMessages, retry }: SimulatorStatusBarProps) {
    const statusContent = useMemo(() => {
        return getStatusConfig().find((config) => config.status === status);
    }, [status]);
    if (!statusContent) return null;

    const messages = dynamicMessages?.length ? dynamicMessages : statusContent.messages || [];
    const StatusIcon = statusContent.icon;
    const errorMsg = status === SimulateStatus.Error && messages.length ? messages[0].title : '';

    const content = (
        <ClickableButton
            className={classNames(
                'mt-6 flex h-10 w-full items-center justify-center gap-2 rounded-lg px-3 text-[13px] font-bold',
                statusContent.className,
            )}
        >
            <StatusIcon className={classNames('shrink-0', statusContent.iconClassName)} width={16} height={16} />
            <span className="truncate">{statusContent.text(errorMsg, retry)}</span>
        </ClickableButton>
    );

    if (messages.length) {
        return <MessagesTippy messages={messages}>{content}</MessagesTippy>;
    }

    return content;
}
