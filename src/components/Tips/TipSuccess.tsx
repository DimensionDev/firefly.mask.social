import { Trans } from '@lingui/macro';
import { EVMExplorerResolver } from '@masknet/web3-providers';
import { formatEthereumAddress } from '@masknet/web3-shared-evm';
import { rootRouteId, useMatch } from '@tanstack/react-router';
import { useMemo } from 'react';

import { ClickableButton } from '@/components/ClickableButton.js';
import { TipsModalHeader } from '@/components/Tips/TipsModalHeader.js';
import { Link } from '@/esm/Link.js';
import { CHAR_TAG } from '@/helpers/chars.js';
import { useCurrentVisitingChannel } from '@/hooks/useCurrentVisitingChannel.js';
import { TipsContext } from '@/hooks/useTipsContext.js';
import { ComposeModalRef } from '@/modals/controls.js';
import type { WalletProfile } from '@/providers/types/Firefly.js';

export function TipSuccess() {
    const { amount, token, receiver, handle, hash, pureWallet, socialProfiles } = TipsContext.useContainer();
    const currentChannel = useCurrentVisitingChannel();
    const { context } = useMatch({ from: rootRouteId });

    const link = useMemo(() => {
        if (!token?.chainId || !receiver?.address) return;
        if (hash) {
            return EVMExplorerResolver.transactionLink(token?.chainId, hash);
        }
        return EVMExplorerResolver.addressLink(token?.chainId, receiver?.address);
    }, [token?.chainId, receiver?.address, hash]);

    const { canShare, walletName } = useMemo(() => {
        const __origin__ = receiver?.__origin__ as WalletProfile;
        if (pureWallet || !handle || !__origin__?.verifiedSources?.length) return { canShare: false };
        return {
            canShare: true,
            walletName: __origin__.primary_ens || formatEthereumAddress(__origin__.address, 4),
        };
    }, [receiver, pureWallet, handle]);

    const onShare = () => {
        context.onClose();
        ComposeModalRef.open({
            type: 'compose',
            channel: currentChannel,
            chars: [
                'Hi ',
                {
                    tag: CHAR_TAG.MENTION,
                    visible: true,
                    content: handle!,
                    profiles: socialProfiles,
                },
                `, I just sent you ${amount} $${token?.symbol} tips! Check your wallet ${walletName} and try tipping on `,
                'firefly.mask.social https://firefly.mask.social',
            ],
        });
    };

    return (
        <>
            <TipsModalHeader />
            <div>
                <div className="md:px-6">
                    <p>
                        <Trans>You {canShare ? 'just' : 'successfully'} sent </Trans>
                        <span className="font-bold text-link">
                            {' '}
                            {amount} ${token?.symbol}{' '}
                        </span>
                        <Trans> tips to</Trans>
                        <span className="font-bold text-link"> {handle || receiver?.displayName}</span>!{' '}
                        {canShare ? <Trans>Share this news by mentioning and posting.</Trans> : null}
                    </p>
                    {link ? (
                        <p className="mt-2 text-right">
                            <Link
                                className="italic text-link underline"
                                target="_blank"
                                rel="noopener noreferrer"
                                href={link}
                            >
                                <Trans>View transaction on explorer</Trans>
                            </Link>
                        </p>
                    ) : null}
                </div>
                {canShare ? (
                    <ClickableButton
                        className="mt-6 h-10 w-full rounded-full border border-lightMain bg-lightBottom text-center font-bold text-lightBottom dark:text-darkBottom"
                        onClick={onShare}
                    >
                        <Trans>Share Now</Trans>
                    </ClickableButton>
                ) : null}
            </div>
        </>
    );
}
