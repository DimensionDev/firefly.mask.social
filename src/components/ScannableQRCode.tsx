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
            <div className={classNames('rounded-2xl bg-white p-4', countdown === 0 || scanned ? 'blur-md' : '')}>
                <QRCode value={url} size={238} />
            </div>
            {countdown === 0 ? (
                <ReloadIcon className="absolute inset-0 m-auto text-white" width={80} height={80} />
            ) : null}
        </div>
    );
}
