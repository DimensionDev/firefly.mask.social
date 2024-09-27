'use client';

import { Trans } from '@lingui/macro';
import { useContext } from 'react';

import { ActivityClaimButton } from '@/components/CZ/ActivityClaimButton.js';
import { ActivityContext } from '@/components/CZ/ActivityContext.js';
import { useActivityCheckResponse } from '@/components/CZ/useActivityCheckResponse.js';
import { LoginModalRef } from '@/modals/controls.js';
import {
    ActivityChangeWalletButton,
    ActivityConnectWalletButton,
} from '@/components/CZ/ActivityConnectWalletButton.js';

export function ActivityHomePageButton() {
    const { data } = useActivityCheckResponse();
    const { goChecklist, type, onLoginTwitter, address, isLoggedTwitter } = useContext(ActivityContext);

    const changeWallet = type === 'page' ? <ActivityChangeWalletButton /> : null;

    if (!isLoggedTwitter) {
        return (
            <button
                className="h-10 rounded-full bg-white px-[18px] text-sm font-bold leading-10 text-[#181a20]"
                onClick={onLoginTwitter}
            >
                <Trans>Log in with X</Trans>
            </button>
        );
    }
    if (!address) {
        return <ActivityConnectWalletButton />;
    }
    if (data?.alreadyClaimed) {
        return (
            <>
                <button
                    disabled
                    className="h-10 rounded-full bg-white px-[18px] text-sm font-bold leading-10 text-[#181a20] disabled:cursor-not-allowed disabled:bg-white/70"
                >
                    <Trans>Claimed</Trans>
                </button>
                {changeWallet}
            </>
        );
    }
    if (type === 'page') {
        return (
            <>
                <button
                    className="h-10 rounded-full bg-white px-[18px] text-sm font-bold leading-10 text-[#181a20] disabled:cursor-not-allowed disabled:bg-white/70"
                    onClick={goChecklist}
                >
                    <Trans>Check Eligibility</Trans>
                </button>
                {changeWallet}
            </>
        );
    }
    if (data?.canClaim) {
        return (
            <>
                <ActivityClaimButton level={data?.level} canClaim className="!h-10 !text-sm !leading-10" />
                {changeWallet}
            </>
        );
    }
    return (
        <button
            className="h-10 rounded-full bg-white px-[18px] text-sm font-bold leading-10 text-[#181a20] disabled:cursor-not-allowed disabled:bg-white/70"
            onClick={() => {
                LoginModalRef.open();
            }}
        >
            <Trans>Change Account</Trans>
        </button>
    );
}
