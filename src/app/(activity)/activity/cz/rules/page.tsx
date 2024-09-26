'use client';

import { Trans } from '@lingui/macro';

import { NavigationBar } from '@/components/ActivityPage/common/NavigationBar.js';
import { CZActivityRules } from '@/components/ActivityPage/CZ/CZActivityRules.js';
import { useComeBack } from '@/hooks/useComeback.js';

export default function Page() {
    const comeback = useComeBack();
    return (
        <div className="mx-auto flex w-full max-w-[600px] flex-col">
            <NavigationBar onBack={comeback} className="z-20 bg-primaryBottom">
                <Trans>Claim Requirements</Trans>
            </NavigationBar>
            <div className="w-full p-4">
                <CZActivityRules />
            </div>
        </div>
    );
}
