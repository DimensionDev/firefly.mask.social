'use client';

import { Trans } from '@lingui/macro';
import { usePathname } from 'next/navigation.js';
import { signIn } from 'next-auth/react';
import { useAccount } from 'wagmi';

import LoadingIcon from '@/assets/loading.svg';
import { CZActivityClaimButton } from '@/components/ActivityPage/CZ/CZActivityClaimButton.js';
import { PageRoute, Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useCZActivityCheckResponse } from '@/hooks/useCZActivityCheckResponse.js';
import { ConnectModalRef } from '@/modals/controls.js';

export function CZActivityHomePageButton() {
    const account = useAccount();
    const twitterProfile = useCurrentProfile(Source.Twitter);
    const pathname = usePathname();
    const { data, isLoading } = useCZActivityCheckResponse();

    if (!twitterProfile) {
        return (
            <button
                className="h-10 rounded-full bg-white px-[18px] text-sm font-bold leading-10 text-[#181a20]"
                onClick={() => {
                    signIn('twitter', {
                        redirect: false,
                        callbackUrl:
                            pathname !== PageRoute.Profile && isRoutePathname(pathname, PageRoute.Profile)
                                ? '/activity/cz'
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

    if (isLoading) {
        return <LoadingIcon className="animate-spin text-[#f4d008]" width={24} height={24} />;
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
                <button type="button" className="text-[13px] font-bold leading-[18px] text-[#f4d008]">
                    <Trans>Change Wallet</Trans>
                </button>
            </>
        );
    }

    if (data?.canClaim) {
        return (
            <>
                <CZActivityClaimButton level={data?.level} canClaim className="!h-10 !text-sm !leading-10" />
                <button type="button" className="text-[13px] font-bold leading-[18px] text-[#f4d008]">
                    <Trans>Change Wallet</Trans>
                </button>
            </>
        );
    }

    return (
        <>
            <Link
                href="/activity/cz/checklist"
                className="h-10 rounded-full bg-white px-[18px] text-sm font-bold leading-10 text-[#181a20] disabled:cursor-not-allowed disabled:bg-white/70"
            >
                <Trans>Check Eligibility</Trans>
            </Link>
            <button className="text-[13px] font-bold leading-[18px] text-[#f4d008]">
                <Trans>Change Wallet</Trans>
            </button>
        </>
    );
}
