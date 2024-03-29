import { t } from '@lingui/macro';

import CloseIcon from '@/assets/close.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { ComposeContent } from '@/components/Compose/ComposeContent.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { Tooltip } from '@/components/Tooltip.js';
import { classNames } from '@/helpers/classNames.js';
import { isEmptyPost } from '@/helpers/isEmptyPost.js';
import { readChars } from '@/helpers/readChars.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useSetEditorContent } from '@/hooks/useSetEditorContent.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

interface ComposeThreadContentProps {}

export function ComposeThreadContent(props: ComposeThreadContentProps) {
    const { currentSource } = useGlobalState();
    const currentProfile = useCurrentProfile(currentSource);

    const setEditorContent = useSetEditorContent();

    const { posts, cursor, helpers, updateCursor, removePost } = useComposeStateStore();

    return (
        <div>
            {posts.map((x, i) => (
                <div
                    key={x.id}
                    className={classNames(' relative my-3 flex gap-2', {
                        'opacity-50': cursor !== x.id,
                        'min-h-[100px]': cursor === x.id,
                    })}
                    onClick={() => {
                        updateCursor(x.id);
                        setEditorContent(readChars(x.chars, true));
                    }}
                >
                    {cursor === x.id && isEmptyPost(x) && i !== 0 ? (
                        <ClickableButton
                            className=" absolute right-0 top-2 z-10"
                            onClick={() => {
                                const next = helpers.nextAvailablePost;
                                if (!next) return;

                                removePost(x.id);
                                setEditorContent(readChars(next.chars, true));
                            }}
                        >
                            <Tooltip content={t`Remove`} placement="top">
                                <CloseIcon className=" cursor-pointer" width={20} height={20} />
                            </Tooltip>
                        </ClickableButton>
                    ) : null}
                    {i < posts.length - 1 ? (
                        <div className=" absolute bottom-0 left-[19px] top-0 h-full w-[2px] bg-secondaryMain" />
                    ) : null}
                    {currentProfile ? <ProfileAvatar profile={currentProfile} enableSourceIcon={false} /> : null}
                    <div className=" mb-3 mt-2 flex-1">
                        <ComposeContent post={x} />
                    </div>
                </div>
            ))}
        </div>
    );
}
