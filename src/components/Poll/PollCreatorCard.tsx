import { t, Trans } from '@lingui/macro';
import { memo, useRef } from 'react';
import { useMount } from 'react-use';

import AddIcon from '@/assets/add.svg';
import CloseIcon from '@/assets/close.svg';
import MinusIcon from '@/assets/minus.svg';
import PollIcon from '@/assets/poll.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { ValidInDaysSelector } from '@/components/Poll/ValidInDaysSelector.js';
import { POLL_OPTIONS_MIN_COUNT, POLL_PEER_OPTION_MAX_CHARS } from '@/constants/poll.js';
import { classNames } from '@/helpers/classNames.js';
import { createPollOption, getPollOptionsMaxLength } from '@/helpers/createPoll.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import type { PollOption } from '@/providers/types/Poll.js';
import { type CompositePost, useComposeStateStore } from '@/store/useComposeStore.js';

interface PollCreatorCardProps {
    post: CompositePost;
    readonly?: boolean;
}

export const PollCreatorCard = memo<PollCreatorCardProps>(function PollCreatorCard({ post, readonly }) {
    const pollCardRef = useRef<HTMLDivElement>(null);
    const { updatePoll } = useComposeStateStore();
    const { availableSources } = useCompositePost();

    useMount(() => {
        // scroll into view when first mount
        pollCardRef.current?.scrollIntoView({ block: 'center' });
    });

    const { poll } = post;
    if (!poll) return null;

    const removeOption = (option: PollOption) => {
        const newOptions = poll.options.filter((o) => o.id !== option.id);
        updatePoll({ ...poll, options: newOptions });
    };
    const addOption = () => {
        updatePoll({ ...poll, options: [...poll.options, createPollOption()] });
    };
    const onOptionChange = (option: PollOption, label: string) => {
        const newOptions = poll.options.map((o) => (o.id === option.id ? { ...o, label } : o));
        updatePoll({ ...poll, options: newOptions });
    };

    return (
        <div
            ref={pollCardRef}
            className="mt-14 rounded-2xl border border-lightMain bg-lightBottom p-3 dark:bg-darkBottom"
        >
            <div className="flex items-center justify-between text-lightMain">
                <div className="flex items-center gap-2">
                    <PollIcon width={24} height={24} />
                    <span className="text-lg font-bold">
                        <Trans>Poll</Trans>
                    </span>
                </div>
                {!readonly ? (
                    <CloseIcon width={20} height={20} className="cursor-pointer" onClick={() => updatePoll(null)} />
                ) : null}
            </div>
            <div>
                {poll.options.map((option, index) => (
                    <div
                        className="mt-4 flex h-12 items-center rounded-2xl bg-lightBg px-3.5 text-[15px] text-lightMain"
                        key={option.id}
                    >
                        <input
                            className="h-full flex-1 border-0 bg-transparent placeholder-secondary focus:border-0 focus:outline-0 focus:ring-0"
                            value={option.label}
                            placeholder={t`Choice ${index + 1}`}
                            onChange={(e) => onOptionChange(option, e.target.value)}
                            readOnly={readonly}
                            maxLength={POLL_PEER_OPTION_MAX_CHARS}
                            autoFocus={index === 0}
                        />
                        {index >= POLL_OPTIONS_MIN_COUNT && (
                            <ClickableButton disabled={readonly}>
                                <MinusIcon width={20} height={20} onClick={() => removeOption(option)} />
                            </ClickableButton>
                        )}
                    </div>
                ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
                <ClickableButton
                    disabled={readonly || poll.options.length >= getPollOptionsMaxLength(availableSources)}
                    className="flex cursor-pointer items-center gap-2 text-lightMain disabled:opacity-50"
                    onClick={addOption}
                >
                    <AddIcon width={20} height={20} />
                    <span className="text-[15px]">
                        <Trans>Add another option</Trans>
                    </span>
                </ClickableButton>
                {post.poll ? <ValidInDaysSelector post={post} readonly={readonly} /> : null}
            </div>
        </div>
    );
});
