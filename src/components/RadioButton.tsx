import type { ButtonHTMLAttributes } from 'react';

import RadioOffIcon from '@/assets/radio-off.svg';
import RadioOnIcon from '@/assets/radio-on.svg';
import { classNames } from '@/helpers/classNames.js';

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
    size?: number;
    checked: boolean;
}

export function RadioButton({ size = 40, checked, className, ...props }: Props) {
    return (
        <button
            className={classNames(
                'flex items-center justify-center',
                {
                    'disabled:cursor-not-allowed disabled:opacity-50': !!props.disabled,
                },
                className,
            )}
            {...props}
            style={{
                ...props.style,
                width: size,
                height: size,
            }}
        >
            {checked ? (
                <RadioOnIcon className="text-highlight" width={size} height={size} />
            ) : (
                <RadioOffIcon width={size} height={size} />
            )}
        </button>
    );
}
