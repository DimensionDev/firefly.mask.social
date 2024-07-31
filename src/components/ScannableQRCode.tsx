import { QRCode } from 'react-qrcode-logo';

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
            <div
                className={classNames(
                    'overflow-hidden rounded-2xl bg-white shadow-[0_0_20px_0_rgba(0,0,0,0.05)] backdrop-blur',
                    countdown === 0 || scanned ? 'blur-md' : '',
                )}
            >
                <QRCode value={url} ecLevel="H" size={238} quietZone={16} eyeRadius={150} qrStyle="dots" />
            </div>
            {countdown === 0 ? (
                <ReloadIcon className="absolute inset-0 m-auto text-white" width={80} height={80} />
            ) : null}
        </div>
    );
}
