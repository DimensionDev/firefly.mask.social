import { t, Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { memo } from 'react';
import { useAsyncFn } from 'react-use';
import type { Address } from 'viem';
import { useEnsName } from 'wagmi';

import LoadingIcon from '@/assets/loading.svg';
import MuteIcon from '@/assets/mute.svg';
import { MenuButton } from '@/components/Actions/MenuButton.js';
import { Source } from '@/constants/enum.js';
import { enqueueMessageFromError, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { formatAddress } from '@/helpers/formatAddress.js';
import { useFireflyIdentity } from '@/hooks/useFireflyIdentity.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import { captureMuteEvent } from '@/providers/telemetry/captureMuteEvent.js';
import type { FireflyIdentity } from '@/providers/types/Firefly.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { EventId } from '@/providers/types/Telemetry.js';

interface MuteAllProfileBaseProps {
    identity: FireflyIdentity;
    handleOrEnsOrAddress: string;
    onClose?(): void;
}

function waitForConfirmation(handleOrEnsOrAddress: string) {
    return ConfirmModalRef.openAndWaitForClose({
        title: t`Mute all`,
        content: (
            <p className="-mt-4 mb-4 text-lightMain">
                <Trans>All wallets and social accounts associated with {handleOrEnsOrAddress} will be muted.</Trans>
            </p>
        ),
        variant: 'normal',
    });
}

function MuteAllProfileBase({ handleOrEnsOrAddress, identity, onClose }: MuteAllProfileBaseProps) {
    const { data: isMutedAll, isLoading } = useQuery({
        queryKey: ['profile', 'mute-all', identity.id, identity.source],
        queryFn: async () => FireflyEndpointProvider.isProfileMutedAll(identity),
    });

    const [{ loading }, handleMuteAll] = useAsyncFn(async () => {
        try {
            onClose?.();
            const confirmed = await waitForConfirmation(handleOrEnsOrAddress);
            if (!confirmed) return;
            await FireflyEndpointProvider.muteProfileAll(identity);
            enqueueSuccessMessage(t`All wallets and accounts are muted.`);
            captureMuteEvent(EventId.MUTE_ALL_SUCCESS, identity);
        } catch (error) {
            enqueueMessageFromError(error, t`Failed to mute all wallets and accounts.`);
            throw error;
        }
    }, [handleOrEnsOrAddress, identity, onClose]);

    if (isLoading || isMutedAll === true) return null;

    return (
        <MenuButton onClick={handleMuteAll} disabled={loading}>
            {loading ? (
                <LoadingIcon className="animate-spin" width={18} height={18} />
            ) : (
                <MuteIcon width={18} height={18} />
            )}
            <span className="font-bold leading-[22px] text-main">
                <Trans>Mute all</Trans>
            </span>
        </MenuButton>
    );
}

export const MuteAllByProfile = memo<{ profile: Profile; onClose: MuteAllProfileBaseProps['onClose'] }>(
    function MuteAllByProfile({ profile, onClose }) {
        const identity = useFireflyIdentity(profile.source, profile.profileId);
        return <MuteAllProfileBase identity={identity} handleOrEnsOrAddress={`@${profile.handle}`} onClose={onClose} />;
    },
);

export const MuteAllByWallet = memo<{ address: Address; handle?: string; onClose: MuteAllProfileBaseProps['onClose'] }>(
    function MuteAllByWallet({ address, handle, onClose }) {
        const identity = useFireflyIdentity(Source.Wallet, address);
        const { data: ens } = useEnsName({ address });

        return (
            <MuteAllProfileBase
                identity={identity}
                handleOrEnsOrAddress={handle?.replace('@', '') || ens || formatAddress(address, 4)}
                onClose={onClose}
            />
        );
    },
);
