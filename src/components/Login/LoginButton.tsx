import { ClickableButton } from '@/components/ClickableButton.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { type SocialSource } from '@/constants/enum.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';

interface LoginButtonProps {
    source: SocialSource;
    onClick?: (source: SocialSource) => void;
}

export function LoginButton(props: LoginButtonProps) {
    const { source, onClick } = props;
    return (
        <ClickableButton
            className="group flex w-full flex-col rounded-lg outline-none hover:bg-lightBg"
            onClick={() => onClick?.(source)}
        >
            <div className="inline-flex w-full cursor-pointer flex-col items-center justify-start gap-2 rounded-lg px-4 py-6">
                <div className="relative h-[48px] w-[48px]">
                    <SocialSourceIcon className="left-0 top-0 rounded-full" size={48} source={source} />
                </div>
                <div className="text-sm font-bold leading-[18px] text-lightSecond group-hover:text-lightMain">
                    {resolveSourceName(source)}
                </div>
            </div>
        </ClickableButton>
    );
}
