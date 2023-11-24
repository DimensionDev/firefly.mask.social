import { Trans } from '@lingui/react';

import FollowButton from '@/app/profile/components/FollowButton.js';
import { PlatformEnum } from '@/app/profile/type.js';
import { Image } from '@/esm/Image.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface InfoProps {
    platform: PlatformEnum;
    handle: string;
    profile?: Profile;
}

export default function Info({ platform, handle, profile }: InfoProps) {
    return (
        <div className=" flex gap-3 px-4">
            <Image
                src={profile?.pfp || '/svg/lens.svg'}
                width={80}
                height={80}
                alt="avatar"
                className=" h-20 w-20 rounded-full"
            />

            <div className=" relative flex flex-1 flex-col gap-[6px] pt-4">
                <div className=" absolute right-0 top-4">{profile ? <FollowButton profile={profile} /> : null}</div>

                <div className=" flex flex-col">
                    <div className=" flex items-center gap-2">
                        <span className=" font-black text-lightMain">{profile?.nickname ?? handle}</span>
                        <Image
                            src={platform === PlatformEnum.Lens ? '/svg/lens.svg' : '/svg/farcaster.svg'}
                            width={20}
                            height={20}
                            alt="platform"
                            className=" h-5 w-5"
                        />
                    </div>
                    <span className=" text-[#767676]">@{handle}</span>
                </div>

                <div>{profile?.bio ?? '-'}</div>

                <div className=" flex gap-3">
                    <div className=" flex gap-1">
                        <span className=" font-bold text-lightMain">{profile?.followingCount ?? 0}</span>
                        <span className=" text-[#767676]">
                            <Trans id="Following" />
                        </span>
                    </div>

                    <div className=" flex gap-1">
                        <span className=" font-bold text-lightMain">{profile?.followerCount ?? 0}</span>
                        <span className=" text-[#767676]">
                            <Trans id="Followers" />
                        </span>
                    </div>
                </div>

                <div className=" text-sm text-[#767676]">
                    <Trans id="Not followed by anyone you’re following" />
                </div>
            </div>
        </div>
    );
}
