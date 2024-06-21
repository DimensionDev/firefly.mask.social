import QRCode from 'react-qr-code';

import ReloadIcon from '@/assets/reload.svg';
import { classNames } from '@/helpers/classNames.js';

interface Props {
    url: string;
    scanned: boolean;
    countdown: number;
}

export function ScannableQRCode(props: Props) {
    const { url, scanned, countdown } = props;
    return (
        <div className="relative flex items-center justify-center">
            <QRCode
                className={classNames({
                    'blur-md': countdown === 0 || scanned,
                })}
                value={url}
                size={360}
            />
            {countdown === 0 ? (
                <ReloadIcon className="absolute inset-0 m-auto text-white" width={48} height={48} />
            ) : null}
        </div>
    );
}
