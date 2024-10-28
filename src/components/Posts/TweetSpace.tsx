import { Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { type FunctionComponent, memo, type ReactNode, type SVGAttributes } from 'react';

import CalendarIcon from '@/assets/calendar.svg';
import EmptyStatusIcon from '@/assets/empty-status.svg';
import LoadingIcon from '@/assets/loading.svg';
import MicrophoneIcon from '@/assets/microphone.svg';
import { Avatar } from '@/components/Avatar.js';
import { ClickableArea } from '@/components/ClickableArea.js';
import { ProfileVerifyBadge } from '@/components/ProfileVerifyBadge/index.js';
import { Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { formatTwitterProfile } from '@/helpers/formatTwitterProfile.js';
import { isToday } from '@/helpers/isToday.js';
import { isTomorrow } from '@/helpers/isTomorrow.js';
import { resolveValue } from '@/helpers/resolveValue.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { LoginModalRef } from '@/modals/controls.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';

interface Tag {
    icon?: FunctionComponent<SVGAttributes<SVGElement>>;
    label: ReactNode;
}

interface Props {
    spaceId: string;
}

export const TweetSpace = memo<Props>(function TweetSpace({ spaceId }) {
    const isLogin = useIsLogin(Source.Twitter);
    const { data, isLoading, error, refetch } = useQuery({
        enabled: isLogin,
        queryKey: ['twitter-space', spaceId],
        queryFn() {
            return TwitterSocialMediaProvider.getSpace(spaceId);
        },
    });
    const space = data?.data;

    if (!isLogin) {
        return (
            <div className="bg-purple mt-3 flex min-h-[152px] w-full flex-col items-center justify-center space-y-3 rounded-2xl p-4 text-white">
                <p className="text-[13px] font-semibold leading-6">
                    <Trans>Log in with your X account to view</Trans>
                </p>
                <ClickableArea
                    className="rounded-full bg-[rgba(24,26,32,0.5)] px-3 py-2 text-sm leading-[18px]"
                    onClick={() => LoginModalRef.open()}
                >
                    <Trans>Login</Trans>
                </ClickableArea>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="bg-purple mt-3 flex min-h-[152px] w-full flex-col items-center justify-center space-y-3 rounded-2xl p-4 text-white">
                <LoadingIcon className="animate-spin" width={24} height={24} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-purple mt-3 flex min-h-[152px] w-full flex-col items-center justify-center space-y-3 rounded-2xl p-4 text-white">
                <p className="text-[13px] font-semibold leading-6">
                    <Trans>Something went wrong</Trans>
                </p>
                <ClickableArea
                    className="rounded-full bg-[rgba(24,26,32,0.5)] px-3 py-2 text-sm leading-[18px]"
                    onClick={() => refetch()}
                >
                    <Trans>Try again</Trans>
                </ClickableArea>
            </div>
        );
    }

    if (!space) {
        return (
            <div className="bg-purple mt-3 flex min-h-[152px] w-full flex-col items-center justify-center space-y-3 rounded-2xl p-4 text-white">
                <EmptyStatusIcon className="h-[64px] w-[80px]" />
                <p className="text-[13px] font-semibold leading-6">
                    <Trans>This space does not exist.</Trans>
                </p>
            </div>
        );
    }

    const rawCreator = data?.includes?.users?.find((user) => user.id === data.data.creator_id);
    const creator = rawCreator ? formatTwitterProfile(rawCreator) : undefined;

    const tags: Tag[] = resolveValue(() => {
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
                if (isToday(space.scheduled_start)) {
                    return [
                        {
                            icon: CalendarIcon,
                            label: <Trans>Today at {dayjs(space.scheduled_start).format('HH:mm')}</Trans>,
                        },
                    ];
                }
                if (isTomorrow(space.scheduled_start)) {
                    return [
                        {
                            icon: CalendarIcon,
                            label: <Trans>Tomorrow at {dayjs(space.scheduled_start).format('HH:mm')}</Trans>,
                        },
                    ];
                }
                return [
                    {
                        icon: CalendarIcon,
                        label: <Trans>{dayjs(space.scheduled_start).format('MMM DD, YYYY [at] HH:mm')}</Trans>,
                    },
                ];
            default:
                return [];
        }
    });

    return (
        <Link
            href={`https://x.com/i/spaces/${space.id}`}
            target="_blank"
            className="bg-purple mt-3 flex w-full flex-col space-y-3 rounded-2xl p-4 text-white"
        >
            <div className="flex items-center space-x-1">
                {tags.map((tag, i) => (
                    <div
                        className="flex items-center rounded-lg bg-[rgba(24,26,32,0.5)] px-2 py-1 text-xs font-semibold leading-4"
                        key={i}
                    >
                        {tag.icon ? <tag.icon className="mr-1 h-4 w-4" width={16} height={16} /> : null}
                        {tag.label}
                    </div>
                ))}
            </div>
            <h3 className="text-md line-clamp-2 min-h-12 font-semibold leading-6">{space.title}</h3>
            {creator ? (
                <div className="flex h-6 items-center leading-6">
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
