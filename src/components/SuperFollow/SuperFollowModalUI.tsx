import { t, Trans } from '@lingui/macro';
import { memo, useMemo } from 'react';
import { useAsyncFn } from 'react-use';
import { useAccount } from 'wagmi';

import LoadingIcon from '@/assets/loading.svg';
import UserIcon from '@/assets/user.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { CloseButton } from '@/components/CloseButton.js';
import { BioMarkup } from '@/components/Markup/BioMarkup.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { formatEthereumAddress } from '@/helpers/formatAddress.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { isSameEthereumAddress } from '@/helpers/isSameAddress.js';
import { useAllowanceForLensModule } from '@/hooks/useAllowanceForLensModule.js';
import { useSuperFollowData } from '@/hooks/useSuperFollow.js';
import { ConnectModalRef } from '@/modals/controls.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface SuperFollowModalUIProps {
    profile: Profile;
    showCloseButton?: boolean;
    onClose: () => void;
}

export const SuperFollowModalUI = memo<SuperFollowModalUIProps>(function SuperFollowModalUI({
    profile,
    showCloseButton = true,
    onClose,
}) {
    const account = useAccount();
    const { loading, followModule, isConnected, allowanceModule, hasAmount, hasAllowance, address, refetchAllowance } =
        useSuperFollowData(profile);
    const [, handleAllowance] = useAllowanceForLensModule();

    const wrongAddress = !isSameEthereumAddress(address, account.address);
    const feeAmount = parseFloat(followModule?.amount.value || '0');
    const feeSymbol = followModule?.amount.asset.symbol;

    const buttonLabel = useMemo(() => {
        if (!followModule) {
            return t`This profile doesn't enable super follow`;
        }
        if (!isConnected) {
            return t`Connect your wallet to follow`;
        }
        if (wrongAddress) {
            return t`Please switch to ${formatEthereumAddress(address, 4)}`;
        }
        if (!hasAmount) {
            return t`Insufficient Balance`;
        }
        if (!hasAllowance) {
            return t`Allow Follow Module`;
        }

        return t`Follow for ${feeAmount} $${feeSymbol}`;
    }, [isConnected, hasAmount, hasAllowance, followModule, wrongAddress, address, feeAmount, feeSymbol]);

    const [{ loading: isFollowing }, handleFollow] = useAsyncFn(async () => {
        try {
            if (!followModule || !allowanceModule) return;
            if (!isConnected) {
                ConnectModalRef.open();
                return;
            }
            if (!hasAllowance) {
                await handleAllowance(allowanceModule, Number.MAX_SAFE_INTEGER.toString());
                await refetchAllowance();
                return;
            }

            await LensSocialMediaProvider.superFollow(profile.profileId);
            enqueueSuccessMessage(t`Followed @${profile.handle} on Lens`);
            onClose?.();
        } catch (error) {
            enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to follow @${profile.handle} on Lens`), {
                error,
            });
            throw error;
        }
    }, [
        followModule,
        allowanceModule,
        isConnected,
        hasAllowance,
        profile.profileId,
        profile.handle,
        profile.source,
        onClose,
        refetchAllowance,
        handleAllowance,
    ]);

    const disabled =
        loading || isFollowing || (isConnected && (!followModule || !allowanceModule || !hasAmount || wrongAddress));

    return (
        <div className="w-full">
            <div className="relative text-center">
                <span className="text-lg font-bold leading-6 text-lightMain">
                    <Trans>Super Follow</Trans>
                </span>
                {showCloseButton ? (
                    <CloseButton onClick={() => onClose?.()} className="absolute -top-1 right-0" />
                ) : null}
            </div>
            <div className="mt-6 rounded-lg bg-lightBg px-3 py-2">
                <div className="flex items-center gap-2.5">
                    <span>
                        <ProfileAvatar profile={profile} size={48} linkable={false} enableSourceIcon={false} />
                    </span>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1">
                            <span className="truncate text-medium font-bold text-lightMain">{profile.displayName}</span>
                            <SocialSourceIcon source={profile.source} size={15} className="shrink-0" />
                        </div>
                        <div className="flex items-center gap-1 text-medium text-lightSecond">
                            <span className="truncate">@{profile.handle}</span>
                            <UserIcon width={15} height={15} className="shrink-0" />
                            <span>{nFormatter(profile.followerCount)}</span>
                        </div>
                    </div>
                </div>
                <BioMarkup className="mt-1.5 line-clamp-2 text-left text-medium text-lightMain" source={profile.source}>
                    {profile.bio || '--'}
                </BioMarkup>
            </div>
            <p className="mt-3 text-medium font-bold text-lightSecond">
                <Trans>
                    Pay
                    <span className="text-lightMain">{` ${feeAmount} $${feeSymbol} `}</span>
                    to follow and get some awesome perks!
                </Trans>
            </p>
            <ClickableButton
                disabled={disabled}
                className="mt-6 flex h-10 w-full items-center justify-center rounded-[20px] bg-lightMain text-medium font-bold text-primaryBottom"
                onClick={handleFollow}
            >
                {loading || isFollowing ? (
                    <LoadingIcon className="animate-spin" width={24} height={24} />
                ) : (
                    <span>{buttonLabel}</span>
                )}
            </ClickableButton>
        </div>
    );
});
