import { Image } from '@/esm/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { useMemo } from 'react';

interface ComposeSendProps {
    charactersLen: number;
    setOpened: (opened: boolean) => void;
}
export default function ComposeSend({ charactersLen, setOpened }: ComposeSendProps) {
    const disabled = useMemo(() => charactersLen > 280, [charactersLen]);

    return (
        <div className=" flex h-[68px] items-center justify-end gap-4 px-4 shadow-send">
            <div className=" flex items-center gap-[10px]">
                {charactersLen >= 0 && charactersLen < 200 && (
                    <Image src="/svg/loading.green.svg" width={24} height={24} alt="loading.green" />
                )}

                {charactersLen >= 200 && charactersLen < 260 && (
                    <Image src="/svg/loading.yellow.svg" width={24} height={24} alt="loading.yellow" />
                )}

                {charactersLen >= 260 && <Image src="/svg/loading.red.svg" width={24} height={24} alt="loading.red" />}

                <span className={classNames(disabled ? ' text-[#FF3545]' : '')}>{charactersLen} / 280</span>
            </div>

            <button
                className={classNames(
                    ' flex h-10 w-[120px] items-center justify-center gap-1 rounded-full bg-[#07101B] text-sm font-bold text-white',
                    disabled ? ' cursor-no-drop opacity-50' : '',
                )}
                onClick={() => !disabled && setOpened(false)}
            >
                <Image src="/svg/send.svg" width={18} height={18} alt="send" className=" h-[18px] w-[18px]" />
                <span>Send</span>
            </button>
        </div>
    );
}
