import { plural } from '@lingui/macro';
import { memo, type ReactElement } from 'react';

import DangerIcon from '@/assets/danger.svg';
import WarningIcon from '@/assets/warning.svg';
import { Tippy } from '@/esm/Tippy.js';
import { classNames } from '@/helpers/classNames.js';
import { SecurityMessageLevel, type TokenSecurityType } from '@/providers/types/Security.js';

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
                    <div className="flex flex-row items-center gap-1 rounded bg-[#FFB1001A] px-2 py-1">
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
            content={
                <div>
                    {matched.map((rule) => {
                        return (
                            <RiskCard
                                key={rule.type}
                                level={rule.level}
                                title={rule.title(tokenSecurity)}
                                description={rule.message(tokenSecurity)}
                            />
                        );
                    })}
                </div>
            }
        >
            {children}
        </Tippy>
    );
}

interface RiskCardProps {
    level: SecurityMessageLevel;
    title: string;
    description: string;
}

export const RiskCard = memo<RiskCardProps>(function RiskCard({ level, title, description }) {
    const icon =
        level === SecurityMessageLevel.High ? (
            <DangerIcon width={16} height={16} className="shrink-0" />
        ) : level === SecurityMessageLevel.Medium ? (
            <WarningIcon width={16} height={16} className="shrink-0" />
        ) : null;

    return (
        <div className="flex cursor-pointer flex-row gap-1 rounded-lg border border-line bg-primaryBottom p-4 text-main">
            <div
                className={classNames('inline-flex items-center justify-center self-start', {
                    'text-warn': level === SecurityMessageLevel.Medium,
                    'text-danger': level === SecurityMessageLevel.High,
                    'text-success': level === SecurityMessageLevel.Safe,
                })}
            >
                {icon}
            </div>
            <div className="flex flex-col gap-1">
                <div
                    className={classNames('font-bold', {
                        'text-warn': level === SecurityMessageLevel.Medium,
                        'text-danger': level === SecurityMessageLevel.High,
                        'text-success': level === SecurityMessageLevel.Safe,
                    })}
                >
                    {title}
                </div>
                {description ? <div className="text-sm text-secondary">{description}</div> : null}
            </div>
        </div>
    );
});
