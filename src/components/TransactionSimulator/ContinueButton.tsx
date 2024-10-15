import { t } from '@lingui/macro';
import { useMemo } from 'react';
import { useAccount } from 'wagmi';

import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import { SimulateStatus } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { ConnectModalRef } from '@/modals/controls.js';

interface ContinueButtonProps extends Omit<ClickableButtonProps, 'children'> {
    status: SimulateStatus;
}

export function ContinueButton({ status, className, onClick, ...rest }: ContinueButtonProps) {
    const account = useAccount();

    const isUnConnected = !account.isConnected || !account.address;
    const isUnSafe = status === SimulateStatus.Unsafe;

    const buttonLabel = useMemo(() => {
        if (isUnConnected) {
            return t`Connect Wallet`;
        }
        if (isUnSafe) {
            return t`Ignore the warnings to continue`;
        }

        return t`Continue`;
    }, [isUnConnected, isUnSafe]);

    const handleClick = () => {
        if (isUnConnected) {
            ConnectModalRef.open();
            return;
        }

        onClick?.();
    };

    return (
        <ClickableButton
            className={classNames(
                'mt-6 h-10 w-full rounded-lg text-sm font-bold',
                {
                    'bg-lightMain text-primaryBottom': !isUnSafe,
                    'bg-danger text-white': isUnSafe,
                },
                className,
            )}
            onClick={handleClick}
            {...rest}
        >
            {buttonLabel}
        </ClickableButton>
    );
}
