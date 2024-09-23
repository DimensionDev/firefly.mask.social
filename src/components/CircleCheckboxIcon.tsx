import RadioDisableNoIcon from '@/assets/radio.disable-no.svg';
import RadioYesIcon from '@/assets/radio.yes.svg';
import { classNames } from '@/helpers/classNames.js';

interface Props extends React.HTMLProps<SVGAElement> {
    size?: number;
    checked: boolean;
}

export function CircleCheckboxIcon({ size = 20, checked, className, ...props }: Props) {
    if (checked)
        return (
            <RadioYesIcon width={size} height={size} {...props} className={classNames('text-highlight', className)} />
        );

    return (
        <div
            className={classNames('flex items-center justify-center', className)}
            style={{
                width: size,
                height: size,
            }}
        >
            <RadioDisableNoIcon className="text-secondaryLine" width={size} height={size} {...props} />
        </div>
    );
}
