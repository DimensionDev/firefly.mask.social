import { t } from '@lingui/macro';
import { motion } from 'framer-motion';
import { forwardRef, type HTMLProps } from 'react';
import { useAsyncFn } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import TipsIcon from '@/assets/tips.svg';
import { ClickableArea } from '@/components/ClickableArea.js';
import { Tooltip } from '@/components/Tooltip.js';
import { Source, STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueInfoMessage } from '@/helpers/enqueueMessage.js';
import { isSameFireflyIdentity } from '@/helpers/isSameFireflyIdentity.js';
import { useCurrentFireflyProfilesAll } from '@/hooks/useCurrentFireflyProfiles.js';
import { TipsModalRef } from '@/modals/controls.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import type { FireflyIdentity } from '@/providers/types/Firefly.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface TipsProps extends HTMLProps<HTMLButtonElement> {
    identity: FireflyIdentity;
    disabled?: boolean;
    handle?: string | null;
    label?: string;
    tooltipDisabled?: boolean;
    pureWallet?: boolean;
    post?: Post;
    onClick?: () => void;
}

export const Tips = forwardRef<HTMLButtonElement, TipsProps>(function Tips(
    {
        identity,
        disabled = false,
        label,
        tooltipDisabled = false,
        pureWallet = false,
        handle = '',
        post,
        className,
        onClick,
    },
    ref,
) {
    const profiles = useCurrentFireflyProfilesAll();

    const [{ loading }, handleClick] = useAsyncFn(async () => {
        try {
            const relatedProfiles = await FireflyEndpointProvider.getAllPlatformProfileByIdentity(identity, true);
            if (!relatedProfiles?.some((profile) => profile.identity.source === Source.Wallet)) {
                throw new Error('No available profiles');
            }
            onClick?.();
            TipsModalRef.open({
                identity,
                handle,
                pureWallet,
                profiles: relatedProfiles,
                post,
            });
        } catch (error) {
            enqueueInfoMessage(t`Sorry, we are not able to find a wallet for ${handle ? '@' + handle : identity.id}.`);
            throw error;
        }
    }, [identity, onClick, handle, pureWallet, post]);

    if (
        env.external.NEXT_PUBLIC_TIPS !== STATUS.Enabled ||
        profiles.some((profile) => isSameFireflyIdentity(profile.identity, identity))
    )
        return null;

    return (
        <ClickableArea
            className={classNames('flex cursor-pointer items-center text-lightSecond md:space-x-2', className, {
                'opacity-50': disabled,
                'hover:text-lightWarn': !disabled && !label && !loading,
                'w-min': !label,
            })}
        >
            <Tooltip content={t`Send a tip`} placement="top" disabled={disabled || tooltipDisabled || loading}>
                <motion.button
                    className={classNames('inline-flex items-center', {
                        'hover:bg-lightWarn/[.20]': !disabled && !label && !loading,
                        'cursor-not-allowed': disabled,
                        'h-7 w-7 justify-center rounded-full': !label,
                        'w-full': !!label,
                    })}
                    whileTap={!label ? { scale: 0.9 } : undefined}
                    disabled={disabled || loading}
                    ref={ref}
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        if (disabled) return;
                        handleClick();
                    }}
                >
                    {loading ? (
                        <LoadingIcon className="animate-spin" width={18} height={18} />
                    ) : (
                        <TipsIcon width={18} height={18} />
                    )}
                    {label ? <span className="ml-2 font-bold">{label}</span> : null}
                </motion.button>
            </Tooltip>
        </ClickableArea>
    );
});
