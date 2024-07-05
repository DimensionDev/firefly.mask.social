import { Trans } from '@lingui/macro';
import { formatEthereumAddress } from '@masknet/web3-shared-evm';
import { rootRouteId, useMatch } from '@tanstack/react-router';
import { useMemo } from 'react';

import { ClickableButton } from '@/components/ClickableButton.js';
import { TipsModalHeader } from '@/components/Tips/TipsModalHeader.js';
import { Link } from '@/esm/Link.js';
import { CHAR_TAG } from '@/helpers/chars.js';
import { getCurrentAvailableSources } from '@/helpers/getCurrentAvailableSources.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';
import { useCurrentVisitingChannel } from '@/hooks/useCurrentVisitingChannel.js';
import { TipsContext } from '@/hooks/useTipsContext.js';
import { ComposeModalRef, LoginModalRef } from '@/modals/controls.js';
import type { WalletProfile } from '@/providers/types/Firefly.js';

export function TipSuccess() {
    const { amount, token, receiver, handle, hash: hashUrl, pureWallet, socialProfiles } = TipsContext.useContainer();
    const currentChannel = useCurrentVisitingChannel();
    const { context } = useMatch({ from: rootRouteId });

    const { canShare, walletName } = useMemo(() => {
        const __origin__ = receiver?.__origin__ as WalletProfile;
        if (pureWallet || !handle || !__origin__?.verifiedSources?.length || !socialProfiles.length)
            return { canShare: false };
        return {
            canShare: true,
            walletName: __origin__.primary_ens || formatEthereumAddress(__origin__.address, 4),
        };
    }, [receiver, pureWallet, handle, socialProfiles]);

    const onShare = () => {
        const expectedSources = getCurrentAvailableSources().filter((source) => {
            return socialProfiles.some((profile) => resolveSocialSource(profile.platform) === source);
        });
        if (!expectedSources.length) {
            LoginModalRef.open({
                source: resolveSocialSource(socialProfiles[0].platform),
            });
            return;
        }
        context.onClose();
        ComposeModalRef.open({
            type: 'compose',
            channel: currentChannel,
            source: expectedSources,
            chars: [
                'Hi ',
                {
                    tag: CHAR_TAG.MENTION,
                    visible: true,
                    content: handle!,
                    profiles: socialProfiles,
                },
                `, I just sent you ${amount} $${token?.symbol} tips! Check your wallet ${walletName} and try tipping on `,
                ' https://firefly.mask.social',
            ],
        });
    };

    return (
        <>
            <TipsModalHeader />
            <div>
                <div className="md:px-6">
                    <p>
                        <Trans>
                            You {canShare ? 'just' : 'successfully'} sent
                            <span className="font-bold text-link">
                                {' '}
                                {amount} ${token?.symbol}{' '}
                            </span>
                            tips to
                            <span className="font-bold text-link">{' '}{handle || receiver?.displayName}</span>!{' '}
                            {canShare ? 'Share this news by mentioning and posting.' : null}
                        </Trans>
                    </p>
                    {hashUrl ? (
                        <p className="mt-2 text-right">
                            <Link
                                className="italic text-link underline"
                                target="_blank"
                                rel="noopener noreferrer"
                                href={hashUrl}
                            >
                                <Trans>View transaction on explorer</Trans>
                            </Link>
                        </p>
                    ) : null}
                </div>
                {canShare ? (
                    <ClickableButton
                        className="mt-6 h-10 w-full rounded-full border border-lightMain bg-lightBottom text-center font-bold text-darkBottom"
                        onClick={onShare}
                    >
                        <Trans>Share Now</Trans>
                    </ClickableButton>
                ) : null}
            </div>
        </>
    );
}
