import DisableNoIcon from '@/assets/disable-no.svg';
import YesIcon from '@/assets/yes.svg';

interface Props extends React.HTMLProps<SVGAElement> {
    size?: number;
    checked: boolean;
}

export function CircleCheckboxIcon({ size = 40, checked, ...props }: Props) {
    return (
        <>
            {checked ? (
                <YesIcon width={size} height={size} {...props} />
            ) : (
                <div
                    className="flex items-center justify-center"
                    style={{
                        width: size,
                        height: size,
                    }}
                >
                    <DisableNoIcon width={size / 2} height={size / 2} {...props} />
                </div>
            )}
        </>
    );
}
