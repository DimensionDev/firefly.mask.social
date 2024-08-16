import { first } from 'lodash-es';
import { type ReactElement } from 'react';

import { InteractiveTippy } from '@/components/InteractiveTippy.js';
import { RiskCard } from '@/components/TokenProfile/RiskCard.js';
import { SecurityMessageLevel, type TokenContractSecurity } from '@/providers/types/Security.js';

interface Props {
    level: SecurityMessageLevel;
    security: TokenContractSecurity;
    // eslint-disable-next-line @typescript-eslint/ban-types
    children: ReactElement;
}

export function TokenSecurityTippy({ children, level, security }: Props) {
    const { message_list } = security;

    const matched = message_list?.filter((rule) => rule.level === level && rule.condition(security));

    if (!matched?.length) return children;
    const theFirst = first(matched)!;

    return (
        <InteractiveTippy
            maxWidth={350}
            className="tippy-card"
            placement="bottom"
            content={<RiskCard level={theFirst.level} security={security} messages={matched} />}
        >
            {children}
        </InteractiveTippy>
    );
}
