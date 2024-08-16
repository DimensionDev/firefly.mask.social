import { select, t } from '@lingui/macro';
import { type Dispatch, type HTMLProps, type SetStateAction, useMemo } from 'react';

import NotificationSelectedIcon from '@/assets/notification.selected.svg';
import { Source } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveNotificationIcon } from '@/helpers/resolveNotificationIcon.js';
import { NotificationType } from '@/providers/types/SocialMedia.js';

interface Props extends HTMLProps<HTMLDivElement> {
    source: Source;
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
                'flex h-6 cursor-pointer items-center justify-center gap-x-1 whitespace-nowrap rounded-md bg-farcasterPrimary px-1.5 text-xs leading-6',
                active
                    ? 'text-bg dark:text-white'
                    : 'cursor-pointer bg-opacity-10 text-farcasterPrimary dark:bg-opacity-30 dark:text-white',
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
                <NotificationSelectedIcon width={14} height={14} />
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
        <div className={classNames('no-scrollbar flex w-full gap-x-2 overflow-x-auto', className)} {...props}>
            {tabs}
        </div>
    );
}
