import DisableNoIcon from '@/assets/disable-no.svg';
import YesIcon from '@/assets/yes.svg';
import { Image } from '@/esm/Image.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface AccountCardProps {
    profile: Profile;
    isSelected: boolean;
    onSelect: (profile: Profile) => void;
}

export function AccountCard({ isSelected, onSelect, profile }: AccountCardProps) {
    const { pfp, displayName, handle } = profile;
    return (
        <div className="inline-flex h-[48px] w-full items-center justify-start gap-[16px]">
            <div
                className="flex h-[48px] w-[48px] items-center justify-center rounded-[99px]"
                style={{
                    background:
                        'radial-gradient(circle at center, rgba(255, 184, 224, 1), rgba(190, 158, 255, 1), rgba(136, 192, 252, 1), rgba(134, 255, 153, 1))',
                }}
            >
                <Image src={pfp} alt="avatar" width={46} height={46} className="rounded-[99px]" />
            </div>
            <div className="inline-flex shrink grow basis-0 flex-col items-start justify-center gap-1">
                <div className=" text-base font-medium text-main">{displayName}</div>
                <div className=" text-[15px] font-normal text-neutral-500">@{handle}</div>
            </div>
            {isSelected ? (
                <YesIcon width={40} height={40} />
            ) : (
                <button
                    onClick={() => {
                        onSelect(profile);
                    }}
                >
                    <DisableNoIcon width={20} height={20} />
                </button>
            )}
        </div>
    );
}
