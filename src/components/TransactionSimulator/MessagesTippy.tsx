import { Trans } from '@lingui/macro';
import { reduce } from 'lodash-es';
import type React from 'react';
import type { PropsWithChildren } from 'react';
import { useSize } from 'react-use';

import TradeInfo from '@/assets/trade-info.svg';
import TradeSecurity from '@/assets/trade-security.svg';
import WarningIcon from '@/assets/warning.svg';
import { InteractiveTippy } from '@/components/InteractiveTippy.js';
import { classNames } from '@/helpers/classNames.js';
import { SecurityMessageLevel, type StaticSecurityMessage } from '@/providers/types/Security.js';

interface MessagesTippyProps extends React.HTMLProps<HTMLDivElement> {
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
function MessagesContent({ messages, className, ...rest }: MessagesTippyProps) {
    const groupedMessages = groupMessages(messages);
    if (Object.keys(groupedMessages).length === 0) return null;

    return (
        <menu
            className={classNames(
                'no-scrollbar max-h-[40vh] overflow-y-auto rounded-2xl border border-line bg-lightBottom p-4 text-left dark:bg-darkBottom dark:shadow-popover md:max-h-72',
                className,
            )}
            {...rest}
        >
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
                                    <span className="mt-1 break-all text-sm text-lightSecond">{message}</span>
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
    );
}
export function MessagesTippy({ messages, ...rest }: PropsWithChildren<MessagesTippyProps>) {
    const [reference, { width }] = useSize(<div {...rest} />);

    return (
        <InteractiveTippy
            appendTo={'parent'}
            maxWidth={'100%'}
            offset={[-9, 0]}
            className="tippy-card"
            placement="top-start"
            delay={100}
            content={<MessagesContent style={{ width: width === Infinity ? 'auto' : width }} messages={messages} />}
        >
            {reference}
        </InteractiveTippy>
    );
}
