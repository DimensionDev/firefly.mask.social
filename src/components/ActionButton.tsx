import { memo } from 'react';

import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import { classNames } from '@/helpers/classNames.js';

export interface ActionButtonProps extends ClickableButtonProps {
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'danger';
}

export const ActionButton = memo<ActionButtonProps>(function ActionButton({
    loading,
    children,
    variant = 'primary',
    ...props
}) {
    return (
        <ClickableButton
            {...props}
            disabled={loading || props.disabled}
            className={classNames(
                'flex w-full flex-1 items-center justify-center rounded-full py-2 font-bold',
                {
                    'bg-main text-primaryBottom': variant === 'primary',
                    'text-fourMain': variant === 'secondary',
                    'bg-commonDanger text-lightBottom': variant === 'danger',
                },
                props.className,
            )}
        >
            {loading ? <LoadingIcon className="animate-spin" width={24} height={24} /> : children}
        </ClickableButton>
    );
});
