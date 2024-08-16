import { plural } from '@lingui/macro';
import { memo } from 'react';

import DangerIcon from '@/assets/danger.svg';
import WarningIcon from '@/assets/warning.svg';
import { TokenSecurityTippy } from '@/components/TokenProfile/TokenSecurityTippy.js';
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
