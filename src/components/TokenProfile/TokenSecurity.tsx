import { plural } from '@lingui/macro';
import { first } from 'lodash-es';
import { Fragment, memo, type ReactElement } from 'react';

import DangerIcon from '@/assets/danger.svg';
import WarningIcon from '@/assets/warning.svg';
import { Tippy } from '@/esm/Tippy.js';
import { classNames } from '@/helpers/classNames.js';
import { type SecurityMessage, SecurityMessageLevel, type TokenSecurityType } from '@/providers/types/Security.js';

interface TokenCardProps {
    tokenSecurity?: TokenSecurityType;
}

export const TokenSecurityBar = memo<TokenCardProps>(function TokenSecurityBar({ tokenSecurity }) {
    if (!tokenSecurity) return null;

    const { warn_item_quantity: attentionFactors = 0, risk_item_quantity: riskyFactors = 0 } = tokenSecurity;

    return (
        <div className="flex flex-row items-center gap-1">
            {riskyFactors ? (
                <TokenSecurityTippy tokenSecurity={tokenSecurity} level={SecurityMessageLevel.High}>
                    <div className="flex flex-row items-center gap-1 rounded bg-[#FF35451A] px-2 py-1">
                        <DangerIcon width={16} height={16} className="shrink-0" />
                        <span className="text-[12px] text-[#FF3545]">
                            {plural(riskyFactors, {
                                one: '# Risky item',
                                other: '# Risky items',
                            })}
                        </span>
                    </div>
                </TokenSecurityTippy>
            ) : null}
            {attentionFactors ? (
                <TokenSecurityTippy tokenSecurity={tokenSecurity} level={SecurityMessageLevel.Medium}>
                    <div className="flex cursor-pointer flex-row items-center gap-1 rounded bg-[#FFB1001A] px-2 py-1">
                        <WarningIcon width={16} height={16} className="shrink-0" />
                        <span className="text-[12px] text-[#FFB100]">
                            {plural(attentionFactors, {
                                one: '# Attention item',
                                other: '# Attention items',
                            })}
                        </span>
                    </div>
                </TokenSecurityTippy>
            ) : null}
        </div>
    );
});

interface Props {
    // eslint-disable-next-line @typescript-eslint/ban-types
    children: ReactElement;
    tokenSecurity: TokenSecurityType;
    level: SecurityMessageLevel;
}

function TokenSecurityTippy({ children, level, tokenSecurity }: Props) {
    const { message_list } = tokenSecurity;

    const matched = message_list?.filter((rule) => rule.level === level && rule.condition(tokenSecurity));

    if (!matched?.length) return children;
    const theFirst = first(matched)!;

    return (
        <Tippy
            appendTo={() => document.body}
            maxWidth={350}
            className="tippy-card"
            placement="bottom"
            duration={500}
            delay={500}
            arrow={false}
            trigger="mouseenter"
            hideOnClick
            interactive
            content={<RiskCard level={theFirst.level} tokenSecurity={tokenSecurity} messages={matched} />}
        >
            {children}
        </Tippy>
    );
}

interface RiskCardProps {
    level: SecurityMessageLevel;
    messages: SecurityMessage[];
    tokenSecurity: TokenSecurityType;
}

export const RiskCard = memo<RiskCardProps>(function RiskCard({ level, messages, tokenSecurity }) {
    const icon =
        level === SecurityMessageLevel.High ? (
            <DangerIcon width={16} height={16} className="shrink-0" />
        ) : level === SecurityMessageLevel.Medium ? (
            <WarningIcon width={16} height={16} className="shrink-0" />
        ) : null;

    const textColor = {
        'text-warn': level === SecurityMessageLevel.Medium,
        'text-danger': level === SecurityMessageLevel.High,
        'text-success': level === SecurityMessageLevel.Safe,
    };

    return (
        <div className="box-border flex w-[568px] cursor-pointer flex-row gap-3 rounded-lg border border-line bg-primaryBottom p-4 text-main">
            <div className={classNames('inline-flex items-center justify-center self-start', textColor)}>{icon}</div>
            <div className="flex flex-col gap-1">
                {messages.map((message) => {
                    const title = message.title(tokenSecurity);
                    const description = message.message(tokenSecurity);
                    return (
                        <Fragment key={title}>
                            <div className={classNames('font-bold', textColor)}>{title}</div>
                            {description ? <div className="text-sm text-secondary">{description}</div> : null}
                        </Fragment>
                    );
                })}
            </div>
        </div>
    );
});
