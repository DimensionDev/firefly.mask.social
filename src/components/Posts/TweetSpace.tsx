import { Trans } from '@lingui/macro';
import dayjs from 'dayjs';
import { type FunctionComponent, memo, type ReactNode, type SVGAttributes } from 'react';
import type { SpaceV2SingleResult } from 'twitter-api-v2';

import CalendarIcon from '@/assets/calendar.svg';
import MicrophoneIcon from '@/assets/microphone.svg';
import { Avatar } from '@/components/Avatar.js';
import { ProfileVerifyBadge } from '@/components/ProfileVerifyBadge/index.js';
import { Link } from '@/esm/Link.js';
import { formatTwitterProfile } from '@/helpers/formatTwitterProfile.js';

interface Tag {
    icon?: FunctionComponent<SVGAttributes<SVGElement>>;
    label: ReactNode;
}

interface Props {
    data: SpaceV2SingleResult
}

export const TweetSpace = memo<Props>(function TweetSpace({ data }) {
    if (!data?.data) return null;
    const space = data.data;

    const rawCreator = data?.includes?.users?.find((user) => user.id === data.data.creator_id);
    const creator = rawCreator ? formatTwitterProfile(rawCreator) : undefined;

    const tags: Tag[] = (() => {
        switch (space.state) {
            case 'canceled':
                return [
                    {
                        label: <Trans>Canceled</Trans>,
                    },
                ];
            case 'live':
                return [
                    {
                        icon: MicrophoneIcon,
                        label: <Trans>Live</Trans>,
                    },
                    {
                        label: <Trans>{space.participant_count?.toLocaleString()} listening</Trans>,
                    },
                ];
            case 'ended':
                return [
                    {
                        icon: MicrophoneIcon,
                        label: <Trans>Ended on {dayjs(space.ended_at).format('MMM DD')}</Trans>,
                    },
                    {
                        label: <Trans>{space.participant_count?.toLocaleString()} turned in</Trans>,
                    },
                ];
            case 'scheduled':
                return [
                    {
                        icon: CalendarIcon,
                        label: <Trans>{dayjs(space.scheduled_start).format('MMM DD, YYYY at HH:mm')}</Trans>,
                    },
                ];
            default:
                return [];
        }
    })();

    return (
        <Link
            href={`https://x.com/i/spaces/${space.id}`}
            target="_blank"
            className="mt-3 flex w-full flex-col space-y-3 rounded-2xl bg-purple p-4 text-white"
        >
            <div className="flex items-center space-x-1">
                {tags.map((tag, i) => (
                    <div
                        className="flex items-center rounded-lg bg-[rgba(24,26,32,0.5)] px-2 py-1 text-xs font-semibold leading-4"
                        key={i}
                    >
                        {tag.icon ? <tag.icon className="mr-1 h-4 w-4" /> : null}
                        {tag.label}
                    </div>
                ))}
            </div>
            <h3 className="text-md font-semibold leading-6 line-clamp-2 min-h-12">{space.title}</h3>
            {creator ? (
                <div className="flex leading-6 items-center">
                    <Avatar className="mr-2 h-[18px] w-[18px]" src={creator.pfp} size={18} alt={creator.handle} />
                    <span className="mr-1 truncate text-medium font-bold leading-5">{creator.displayName}</span>
                    <ProfileVerifyBadge
                        className="flex flex-shrink-0 items-center space-x-1 sm:mr-2"
                        profile={creator}
                    />
                    <div className="flex items-center space-x-1 rounded-lg bg-[rgba(24,26,32,0.5)] px-2 text-xs font-semibold leading-[18px]">
                        <Trans>Host</Trans>
                    </div>
                </div>
            ) : null}
        </Link>
    );
});
