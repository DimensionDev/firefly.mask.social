import { first } from 'lodash-es';
import { type ReactElement } from 'react';

import { InteractiveTippy } from '@/components/InteractiveTippy.js';
import { RiskCard } from '@/components/TokenProfile/RiskCard.js';
import { SecurityMessageLevel, type TokenSecurityType } from '@/providers/types/Security.js';

interface Props {
    // eslint-disable-next-line @typescript-eslint/ban-types
    children: ReactElement;
    tokenSecurity: TokenSecurityType;
    level: SecurityMessageLevel;
}

export function TokenSecurityTippy({ children, level, tokenSecurity }: Props) {
    const { message_list } = tokenSecurity;

    const matched = message_list?.filter((rule) => rule.level === level && rule.condition(tokenSecurity));

    if (!matched?.length) return children;
    const theFirst = first(matched)!;

    return (
        <InteractiveTippy
            maxWidth={350}
            className="tippy-card"
            placement="bottom"
            content={<RiskCard level={theFirst.level} tokenSecurity={tokenSecurity} messages={matched} />}
        >
            {children}
        </InteractiveTippy>
    );
}
