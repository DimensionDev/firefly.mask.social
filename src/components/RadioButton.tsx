import RadioOffIcon from '@/assets/radio-off.svg';
import RadioOnIcon from '@/assets/radio-on.svg';
import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import { classNames } from '@/helpers/classNames.js';

interface Props extends Omit<ClickableButtonProps, 'children'> {
    size?: number;
    checked: boolean;
}

export function RadioButton({ size = 40, checked, className, ...props }: Props) {
    return (
        <ClickableButton
            className={classNames('flex items-center justify-center', className)}
            {...props}
            style={{
                ...props.style,
                width: size,
                height: size,
            }}
        >
            {checked ? <RadioOnIcon width={size} height={size} /> : <RadioOffIcon width={size} height={size} />}
        </ClickableButton>
    );
}
