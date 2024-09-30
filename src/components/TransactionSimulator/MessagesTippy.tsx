import { Trans } from '@lingui/macro';
import { reduce } from 'lodash-es';
import type { PropsWithChildren } from 'react';

import TradeInfo from '@/assets/trade-info.svg';
import TradeSecurity from '@/assets/trade-security.svg';
import WarningIcon from '@/assets/warning.svg';
import { InteractiveTippy } from '@/components/InteractiveTippy.js';
import { classNames } from '@/helpers/classNames.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { SecurityMessageLevel, type StaticSecurityMessage } from '@/providers/types/Security.js';

interface MessagesTippyProps {
    messages: StaticSecurityMessage[];
}

const iconMap = {
    [SecurityMessageLevel.High]: TradeInfo,
    [SecurityMessageLevel.Medium]: WarningIcon,
    [SecurityMessageLevel.Safe]: TradeSecurity,
    [SecurityMessageLevel.Info]: TradeInfo,
};

const textFontColorMap = {
    [SecurityMessageLevel.High]: 'text-danger',
    [SecurityMessageLevel.Medium]: 'text-commonWarn',
    [SecurityMessageLevel.Safe]: 'text-success',
    [SecurityMessageLevel.Info]: 'text-lightSecond',
};

function groupMessages(messages: StaticSecurityMessage[]) {
    return reduce<StaticSecurityMessage, Record<SecurityMessageLevel, StaticSecurityMessage[]>>(
        messages,
        (acc, message) => {
            if (!acc[message.level]) {
                acc[message.level] = [];
            }
            acc[message.level].push(message);
            return acc;
        },
        {} as Record<SecurityMessageLevel, StaticSecurityMessage[]>,
    );
}

function MessagesContent({ messages }: MessagesTippyProps) {
    const groupedMessages = groupMessages(messages);

    if (Object.keys(groupedMessages).length === 0) return null;

    return (
        <div>
            <menu className="rounded-2xl border border-line bg-lightBottom p-4">
                {[
                    SecurityMessageLevel.High,
                    SecurityMessageLevel.Medium,
                    SecurityMessageLevel.Safe,
                    SecurityMessageLevel.Info,
                ].map((level) => {
                    const messages = groupedMessages[level];
                    if (!messages?.length) return null;

                    const Icon = iconMap[level];
                    const fontColor = textFontColorMap[level];

                    return (
                        <li className="mb-3 pl-6" key={level}>
                            <menu>
                                {messages.map(({ message, title }, index) => (
                                    <li key={`${level}-${index}`}>
                                        <h2 className={classNames('relative text-base font-bold', fontColor)}>
                                            <Icon
                                                className={classNames('absolute -left-6 top-1', fontColor)}
                                                width={16}
                                                height={16}
                                            />
                                            {title}
                                        </h2>
                                        <span className="mt-1 text-sm text-lightSecond">{message}</span>
                                    </li>
                                ))}
                            </menu>
                        </li>
                    );
                })}

                <li className="text-center text-[13px] font-medium text-lightMain">
                    <Trans>Powered by Tenderly and GoPlus</Trans>
                </li>
            </menu>
        </div>
    );
}

export function MessagesTippy({ messages, ...rest }: PropsWithChildren<MessagesTippyProps>) {
    const isMedium = useIsMedium();

    if (!isMedium) return rest.children;

    return (
        <InteractiveTippy
            appendTo={() => document.body}
            offset={[100, 0]}
            maxWidth={350}
            className="tippy-card"
            placement="bottom-end"
            trigger="click"
            content={<MessagesContent messages={messages} />}
        >
            <div {...rest} />
        </InteractiveTippy>
    );
}
