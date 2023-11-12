import Image from 'next/image';

interface ComposeSendProps {
    characters: number;
}
export default function ComposeSend({ characters }: ComposeSendProps) {
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

                <span>{characters} / 280</span>
            </div>

            <button className=" text-sm font-bold h-10 rounded-full text-white bg-[#07101B] flex items-center gap-1 w-[120px] justify-center">
                <Image src="/svg/send.svg" width={18} height={18} alt="send" />
                <span>Send</span>
            </button>
        </div>
    );
}
