import { Image } from '@/esm/Image.js';

export default function More() {
    return (
        <div className="flex w-full flex-col items-center gap-[12px] p-[24px]">
            <div className="  flex w-full items-center justify-between gap-[24px]">
                <span className="text-[18px] font-bold leading-[24px] text-main">More</span>
            </div>
            <div
                className="inline-flex h-[48px] w-full items-center justify-start gap-[8px]  rounded-lg bg-white px-[12px] py-[8px]"
                style={{ boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.05)', backdropFilter: 'blur(8px)' }}
            >
                <Image src="/svg/security.svg" width={24} height={24} alt="security" />
                <div className="inline-flex shrink grow basis-0 flex-col items-start justify-center gap-1">
                    <div className=" text-[14px] font-bold leading-[18px] text-lightMain">Privacy Policy</div>
                </div>
                <button>
                    <Image src="/svg/link.svg" width={16} height={16} alt="link" />
                </button>
            </div>
            <div
                className="inline-flex h-[48px] w-full items-center justify-start gap-[8px] rounded-lg bg-white px-[12px] py-[8px]"
                style={{ boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.05)', backdropFilter: 'blur(8px)' }}
            >
                <Image src="/svg/documents.svg" width={24} height={24} alt="security" />
                <div className="inline-flex shrink grow basis-0 flex-col items-start justify-center gap-1">
                    <div className=" text-[14px] font-bold leading-[18px] text-lightMain">Terms of Service</div>
                </div>
                <button>
                    <Image src="/svg/link.svg" width={16} height={16} alt="link" />
                </button>
            </div>
        </div>
    );
}
