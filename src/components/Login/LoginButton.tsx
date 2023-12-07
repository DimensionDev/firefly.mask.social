import { PlatformIcon } from '@/components/PlatformIcon.js';
import { SocialPlatform } from '@/constants/enum.js';
import { resolveSocialPlatformName } from '@/helpers/resolveSocialMediaProviderName.js';

interface LoginButtonProps {
    platform: SocialPlatform;
    onClick?: (platform: SocialPlatform) => void;
}

export function LoginButton(props: LoginButtonProps) {
    const { platform, onClick } = props;
    return (
        <button
            className="group flex w-full flex-col rounded-lg p-[16px] hover:bg-lightBg"
            onClick={() => onClick?.(platform)}
        >
            <div className=" inline-flex w-full cursor-pointer flex-col items-center justify-start gap-[8px] rounded-lg px-[16px] py-[24px]">
                <div className="relative h-[48px] w-[48px]">
                    <PlatformIcon className="left-0 top-0 rounded-full" size={48} platform={platform} />
                </div>
                <div className="text-sm font-bold leading-[18px] text-lightSecond group-hover:text-lightMain">
                    {resolveSocialPlatformName(platform)}
                </div>
            </div>
        </button>
    );
}
