import { Image } from '@/esm/Image.js';
import { FarcasterStatusModalRef, LensStatusModalRef } from '@/modals/controls.js';

export function LoginStatusBar() {
    return (
        <div className="flex gap-x-2 pl-2">
            <button className="relative h-[40px] w-[48px]" onClick={() => LensStatusModalRef.open()}>
                <div className="absolute left-0 top-0 h-[40px] w-[40px] rounded-[99px] shadow backdrop-blur-lg">
                    <Image src="/svg/lens.svg" alt="avatar" width={40} height={40} />
                </div>
                <Image
                    className="absolute left-[32px] top-[24px] h-[16px] w-[16px] rounded-[99px] border border-white shadow"
                    src={'/svg/lens.svg'}
                    alt="logo"
                    width={16}
                    height={16}
                />
            </button>
            <button className="relative h-[40px] w-[48px]" onClick={() => FarcasterStatusModalRef.open()}>
                <div className="absolute left-0 top-0 h-[40px] w-[40px] rounded-[99px] shadow backdrop-blur-lg">
                    <Image src="/svg/farcaster.svg" alt="avatar" width={40} height={40} />
                </div>
                <Image
                    className="absolute left-[32px] top-[24px] h-[16px] w-[16px] rounded-[99px] border border-white shadow"
                    src={'/svg/farcaster.svg'}
                    alt="logo"
                    width={16}
                    height={16}
                />
            </button>
        </div>
    );
}
