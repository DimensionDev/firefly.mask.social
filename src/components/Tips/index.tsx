import { t } from '@lingui/macro';
import { motion } from 'framer-motion';
import { type HTMLProps, memo } from 'react';
import { useAsyncFn } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import TipsIcon from '@/assets/tips.svg';
import { ClickableArea } from '@/components/ClickableArea.js';
import { Tooltip } from '@/components/Tooltip.js';
import { Source, STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { useCurrentFireflyProfilesAll } from '@/hooks/useCurrentFireflyProfiles.js';
import { TipsModalRef } from '@/modals/controls.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';

interface TipsProps extends HTMLProps<HTMLDivElement> {
    identity: string;
    source: Source;
    disabled?: boolean;
    handle?: string | null;
    label?: string;
    tooltipDisabled?: boolean;
    pureWallet?: boolean;
    onClick?: () => void;
}

export const Tips = memo(function Tips({
    identity,
    source,
    disabled = false,
    label,
    tooltipDisabled = false,
    pureWallet = false,
    handle = '',
    className,
    onClick,
}: TipsProps) {
    const profiles = useCurrentFireflyProfilesAll();

    const [{ loading }, handleClick] = useAsyncFn(async () => {
        try {
            const relatedProfiles = await FireflySocialMediaProvider.getAllPlatformProfileByIdentity(source, identity);
            if (!relatedProfiles?.some((profile) => profile.source === Source.Wallet)) {
                throw new Error('No available profiles');
            }
            TipsModalRef.open({ identity, source, handle, pureWallet, profiles: relatedProfiles });
            onClick?.();
        } catch (error) {
            enqueueErrorMessage(
                getSnackbarMessageFromError(error, t`Sorry, there is no wallet address available for tipping.`),
            );
            throw error;
        }
    }, [identity, source, handle, pureWallet, onClick]);

    if (
        env.external.NEXT_PUBLIC_TIPS !== STATUS.Enabled ||
        profiles.some((profile) => profile.identity === identity && profile.source === source)
    )
        return null;

    return (
        <ClickableArea
            className={classNames('flex cursor-pointer items-center text-main md:space-x-2', className, {
                'opacity-50': disabled,
                'hover:text-secondarySuccess': !disabled && !label && !loading,
                'w-min': !label,
            })}
        >
            <Tooltip
                className="w-full"
                content={t`Tips`}
                placement="top"
                disabled={disabled || tooltipDisabled || loading}
            >
                <motion.button
                    className={classNames('inline-flex items-center', {
                        'hover:bg-secondarySuccess/[.20]': !disabled && !label && !loading,
                        'cursor-not-allowed': disabled,
                        'h-7 w-7 justify-center rounded-full': !label,
                        'w-full': !!label,
                    })}
                    whileTap={!label ? { scale: 0.9 } : undefined}
                    disabled={disabled || loading}
                    onClick={(ev) => {
                        ev.preventDefault();
                        ev.stopPropagation();
                        if (disabled) return;
                        handleClick();
                    }}
                >
                    {loading ? (
                        <LoadingIcon className="animate-spin" width={18} height={18} />
                    ) : (
                        <TipsIcon width={18} height={18} />
                    )}
                    {label ? <span className="ml-2 font-bold text-main">{label}</span> : null}
                </motion.button>
            </Tooltip>
        </ClickableArea>
    );
});
