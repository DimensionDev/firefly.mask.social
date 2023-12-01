import { useRouter } from 'next/navigation.js';

import FollowButton from '@/app/profile/components/FollowButton.js';
import { Image } from '@/components/Image.js';
import { SourceIcon } from '@/components/SourceIcon.js';
import { useDarkMode } from '@/hooks/useDarkMode.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useSearchStore } from '@/store/useSearchStore.js';

interface ProfileInListProps {
    profile: Profile;
    noFollowButton?: boolean;
}

export function ProfileInList(props: ProfileInListProps) {
    const { profile } = props;

    const router = useRouter();
    const { isDarkMode } = useDarkMode();
    const { updateSearchText } = useSearchStore();

    return (
        <div
            className="flex-start flex cursor-pointer px-4 py-6 hover:bg-bg"
            onClick={(evt) => {
                router.push(`/profile/${profile.handle}`);
                updateSearchText('');
            }}
        >
            <div className="flex-start flex flex-1">
                <Image
                    loading="lazy"
                    className="mr-3 h-[78px] w-[78px] rounded-full border"
                    src={profile.pfp}
                    fallback={!isDarkMode ? '/image/firefly-light-avatar.png' : '/image/firefly-dark-avatar.png'}
                    width={78}
                    height={78}
                    alt={profile.displayName}
                />

                <div className="flex-start flex flex-1 flex-col">
                    <span className="flex-start mt-2 flex text-sm font-bold leading-5">
                        <span className="mr-2 text-xl">{profile.displayName}</span>
                        <SourceIcon source={profile.source} />
                    </span>
                    {profile.handle ? <span className="text-sm text-secondary">@{profile.handle}</span> : null}
                    {profile.bio ? <span className="mt-1.5 text-sm">{profile.bio}</span> : null}
                </div>
            </div>

            {!props.noFollowButton ? (
                <div>
                    <FollowButton profile={profile} />
                </div>
            ) : null}
        </div>
    );
}
