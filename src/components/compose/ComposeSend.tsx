import { classNames } from '@/helpers/classNames';
import Image from 'next/image';
import { useMemo } from 'react';

interface ComposeSendProps {
    characters: number;
    setOpened: (opened: boolean) => void;
}
export default function ComposeSend({ characters, setOpened }: ComposeSendProps) {
    const disabled = useMemo(() => characters > 280, [characters]);

    return (
        <div className=" h-[68px] flex items-center px-4 justify-end gap-4 shadow-send">
            <div className=" flex items-center gap-[10px]">
                {characters >= 0 && characters < 200 && (
                    <Image src="/svg/loading.green.svg" width={24} height={24} alt="loading.green" />
                )}

                {characters >= 200 && characters < 260 && (
                    <Image src="/svg/loading.yellow.svg" width={24} height={24} alt="loading.yellow" />
                )}

                {characters >= 260 && <Image src="/svg/loading.red.svg" width={24} height={24} alt="loading.red" />}

                <span className={classNames(disabled ? ' text-[#FF3545]' : '')}>{characters} / 280</span>
            </div>

            <button
                className={classNames(
                    ' text-sm font-bold h-10 rounded-full bg-[#07101B] text-white flex items-center gap-1 w-[120px] justify-center',
                    disabled ? ' opacity-50 cursor-no-drop' : '',
                )}
                onClick={() => !disabled && setOpened(false)}
            >
                <Image src="/svg/send.svg" width={18} height={18} alt="send" />
                <span>Send</span>
            </button>
        </div>
    );
}
