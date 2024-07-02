import { Trans } from '@lingui/macro';
import { memo } from 'react';

import { TipsModalHeader } from '@/components/Tips/TipsModalHeader.js';

export const NoAvailableWallet = memo(function NoAvailableWallet() {
    return (
        <>
            <TipsModalHeader />
            <div className="h-[156px] leading-[18px]">
                <Trans>Sorry, there is no wallet address available for tipping.</Trans>
            </div>
        </>
    );
});
