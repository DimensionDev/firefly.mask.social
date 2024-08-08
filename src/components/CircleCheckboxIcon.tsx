import DisableNoIcon from '@/assets/disable-no.svg';
import YesIcon from '@/assets/yes.svg';
import { classNames } from '@/helpers/classNames.js';

interface Props extends React.HTMLProps<SVGAElement> {
    size?: number;
    checked: boolean;
}

export function CircleCheckboxIcon({ size = 40, checked, className, ...props }: Props) {
    if (checked)
        return <YesIcon width={size} height={size} {...props} className={classNames('text-highlight', className)} />;

    return (
        <div
            className={classNames('flex items-center justify-center', className)}
            style={{
                width: size,
                height: size,
            }}
        >
            <DisableNoIcon className="text-secondaryLine" width={size / 2} height={size / 2} {...props} />
        </div>
    );
}
