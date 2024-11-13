import { select, t } from '@lingui/macro';
import { type Dispatch, type HTMLProps, type SetStateAction, useMemo } from 'react';

import NotificationIcon from '@/assets/notification.svg';
import { NotificationSettings } from '@/components/Notification/NotificationSettings.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveNotificationIcon } from '@/helpers/resolveNotificationIcon.js';
import { NotificationType } from '@/providers/types/SocialMedia.js';

interface Props extends HTMLProps<HTMLDivElement> {
    source: SocialSource;
    types: NotificationType[];
    onTypesChange: Dispatch<SetStateAction<NotificationType[]>>;
}

export function NotificationFilter({ source, className, types, onTypesChange: setTypes, ...props }: Props) {
    const allTypes = useMemo(() => {
        return source === Source.Farcaster
            ? [NotificationType.Comment, NotificationType.Mirror, NotificationType.Reaction]
            : [NotificationType.Comment, NotificationType.Mirror, NotificationType.Reaction, NotificationType.Act];
    }, [source]);

    const tabs = useMemo(() => {
        const getClassNames = (active: boolean) => {
            return classNames(
                'flex h-6 cursor-pointer items-center justify-center gap-x-1 whitespace-nowrap rounded-md px-1.5 text-xs leading-6',
                active ? 'bg-highlight text-primaryBottom' : 'bg-thirdMain text-second hover:text-highlight',
            );
        };

        return [
            <div
                key="all"
                className={getClassNames(types.length === 0)}
                onClick={() => {
                    setTypes(EMPTY_LIST);
                }}
            >
                <NotificationIcon width={14} height={14} />
                {t`All notifications`}
            </div>,
            ...allTypes.map((type) => {
                const Icon = resolveNotificationIcon(type);
                return (
                    <div
                        key={type}
                        className={getClassNames(types.includes(type))}
                        onClick={() => {
                            setTypes((prev) => {
                                return allTypes.filter((x) => (x === type ? !prev.includes(x) : prev.includes(x)));
                            });
                        }}
                    >
                        {Icon ? <Icon width={14} height={14} /> : null}
                        <span>
                            {select(type, {
                                comment: 'Comments',
                                mirror: source === Source.Lens ? t`Mirrors` : t`Recasts`,
                                reaction: 'Likes',
                                act: 'Collects',
                                other: 'Other',
                            })}
                        </span>
                    </div>
                );
            }),
        ];
    }, [allTypes, setTypes, source, types]);
    return (
        <div className="flex w-full items-center">
            <div className={classNames('no-scrollbar flex w-full gap-x-2 overflow-x-auto', className)} {...props}>
                {tabs}
            </div>
            <div className="ml-auto pr-2">
                <NotificationSettings source={source} />
            </div>
        </div>
    );
}
