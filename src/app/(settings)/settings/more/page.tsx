import Image from 'next/image';

export default function More() {
    return (
        <div className="flex flex-col w-full p-[24px] items-center gap-[12px]">
            <div className="  w-full gap-[24px] flex items-center justify-between">
                <span className="text-main text-[18px] font-bold leading-[24px]">More</span>
            </div>
            <div
                className="w-full h-[48px] px-[12px] py-[8px] bg-white rounded-lg  justify-start items-center gap-[8px] inline-flex"
                style={{ boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.05)', backdropFilter: 'blur(8px)' }}
            >
                <Image src="/svg/security.svg" width={24} height={24} alt="security" />
                <div className="grow shrink basis-0 flex-col justify-center items-start gap-1 inline-flex">
                    <div className=" text-textMain text-[14px] font-bold leading-[18px]">Privacy Policy</div>
                </div>
                <button>
                    <Image src="/svg/link.svg" width={16} height={16} alt="link" />
                </button>
            </div>
            <div
                className="w-full h-[48px] px-[12px] py-[8px] bg-white rounded-lg justify-start items-center gap-[8px] inline-flex"
                style={{ boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.05)', backdropFilter: 'blur(8px)' }}
            >
                <Image src="/svg/documents.svg" width={24} height={24} alt="security" />
                <div className="grow shrink basis-0 flex-col justify-center items-start gap-1 inline-flex">
                    <div className=" text-textMain text-[14px] font-bold leading-[18px]">Terms of Service</div>
                </div>
                <button>
                    <Image src="/svg/link.svg" width={16} height={16} alt="link" />
                </button>
            </div>
        </div>
    );
}
