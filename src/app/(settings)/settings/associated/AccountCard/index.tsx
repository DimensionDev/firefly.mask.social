import Image from 'next/image.js';

interface AccountCardProps {
    name: string;
    address: string;
    logout: () => void;
}
export function AccountCard({ name, address }: AccountCardProps) {
    return (
        <div className="w-full h-[63px] px-[12px] py-[8px] bg-white rounded-lg shadow backdrop-blur-lg justify-start items-center gap-[8px] inline-flex">
            <div className="w-[36px] h-[36px] rounded-[99px]">
                <Image src="/svg/wallet-verified.svg" alt="wallet" width={36} height={36} />
            </div>
            <div className="grow shrink basis-0 flex-col justify-center items-start gap-1 inline-flex">
                <div className="text-neutral-900 text-base font-medium font-['PingFang SC']">{name}</div>
                <div className="text-neutral-500 text-[15px] font-normal font-['PingFang SC']">{address}</div>
            </div>
            <button className="text-right text-neutral-900 text-xs font-medium font-['Inter'] leading-none">
                <Image src="/svg/disconnect.svg" alt="wallet" width={20} height={20} />
            </button>
        </div>
    );
}
