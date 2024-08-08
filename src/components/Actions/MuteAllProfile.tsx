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
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { formatEthereumAddress } from '@/helpers/formatEthereumAddress.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import type { FireflyIdentity } from '@/providers/types/Firefly.js';

interface MuteAllProfileBaseProps {
    handle: string;
    identity: FireflyIdentity;
    onClose?(): void;
}

function waitForConfirmation(handle: string) {
    return ConfirmModalRef.openAndWaitForClose({
        title: t`Mute all`,
        content: (
            <p className="-mt-4 mb-4 text-lightMain">
                <Trans>All wallets and social accounts associated with {handle} will be muted.</Trans>
            </p>
        ),
        variant: 'normal',
    });
}

function MuteAllProfileBase({ handle, identity, onClose }: MuteAllProfileBaseProps) {
    const { data: isMutedAll, isLoading } = useQuery({
        queryKey: ['profile', 'mute-all', identity.id, identity.source],
        queryFn: async () => FireflySocialMediaProvider.isProfileMutedAll(identity),
    });

    const [{ loading }, handleMuteAll] = useAsyncFn(async () => {
        try {
            onClose?.();
            const confirmed = await waitForConfirmation(`@${handle}`);
            if (!confirmed) return;
            await FireflySocialMediaProvider.muteProfileAll(identity);
            enqueueSuccessMessage(t`All wallets and accounts are muted.`);
        } catch (error) {
            enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to mute all wallets and accounts.`), {
                error,
            });
            throw error;
        }
    }, [identity.id, identity.source, onClose]);

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
        return (
            <MuteAllProfileBase
                identity={{
                    id: profile.profileId,
                    source: profile.source,
                }}
                handle={`@${profile.handle}`}
                onClose={onClose}
            />
        );
    },
);

export const MuteAllByWallet = memo<{ address: Address; handle?: string; onClose: MuteAllProfileBaseProps['onClose'] }>(
    function MuteAllByWallet({ address, handle, onClose }) {
        const { data: ens } = useEnsName({ address });
        const resolvedHandle = handle || ens || formatEthereumAddress(address, 4);
        return (
            <MuteAllProfileBase
                identity={{
                    id: address,
                    source: Source.Wallet,
                }}
                handle={resolvedHandle}
                onClose={onClose}
            />
        );
    },
);
