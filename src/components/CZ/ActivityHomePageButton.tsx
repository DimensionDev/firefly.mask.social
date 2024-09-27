'use client';

import { Trans } from '@lingui/macro';
import { usePathname } from 'next/navigation.js';
import { signIn } from 'next-auth/react';
import { useContext } from 'react';
import { useAccount } from 'wagmi';

import { ActivityClaimButton } from '@/components/CZ/ActivityClaimButton.js';
import { ActivityContext } from '@/components/CZ/ActivityContext.js';
import { useActivityCheckResponse } from '@/components/CZ/useActivityCheckResponse.js';
import { PageRoute, Source } from '@/constants/enum.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { ConnectModalRef, LoginModalRef } from '@/modals/controls.js';

export function ActivityHomePageButton() {
    const account = useAccount();
    const twitterProfile = useCurrentProfile(Source.Twitter);
    const pathname = usePathname();
    const { data } = useActivityCheckResponse();
    const { goChecklist, type } = useContext(ActivityContext);

    const changeWallet =
        type === 'page' ? (
            <button type="button" className="text-[13px] font-bold leading-[18px] text-[#f4d008]">
                <Trans>Change Wallet</Trans>
            </button>
        ) : null;

    if (!twitterProfile) {
        return (
            <button
                className="h-10 rounded-full bg-white px-[18px] text-sm font-bold leading-10 text-[#181a20]"
                onClick={() => {
                    signIn('twitter', {
                        redirect: false,
                        callbackUrl:
                            pathname !== PageRoute.Profile && isRoutePathname(pathname, PageRoute.Profile)
                                ? '/profile?source=twitter'
                                : undefined,
                    });
                }}
            >
                <Trans>Log in with X</Trans>
            </button>
        );
    }
    if (!account.address) {
        return (
            <button
                className="h-10 rounded-full bg-white px-[18px] text-sm font-bold leading-10 text-[#181a20]"
                onClick={() => ConnectModalRef.open()}
            >
                <Trans>Connect Wallet</Trans>
            </button>
        );
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
