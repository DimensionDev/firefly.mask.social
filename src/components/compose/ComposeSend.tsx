import { classNames } from '@/helpers/classNames';
import Image from 'next/image';
import { useMemo } from 'react';

interface ComposeSendProps {
    charactersLen: number;
    setOpened: (opened: boolean) => void;
}
export default function ComposeSend({ charactersLen, setOpened }: ComposeSendProps) {
    const disabled = useMemo(() => charactersLen > 280, [charactersLen]);

    return (
        <div className=" h-[68px] flex items-center px-4 justify-end gap-4 shadow-send">
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
                    ' text-sm font-bold h-10 rounded-full bg-[#07101B] text-white flex items-center gap-1 w-[120px] justify-center',
                    disabled ? ' opacity-50 cursor-no-drop' : '',
                )}
                onClick={() => !disabled && setOpened(false)}
            >
                <Image src="/svg/send.svg" width={18} height={18} alt="send" className=" w-[18px] h-[18px]" />
                <span>Send</span>
            </button>
        </div>
    );
}
