import { t } from '@lingui/macro';
import { compact, values } from 'lodash-es';

import ErrorIcon from '@/assets/error.svg';
import YesIcon from '@/assets/green-yes.svg';
import { CloseButton } from '@/components/CloseButton.js';
import { ComposeContent } from '@/components/Compose/ComposeContent.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { readChars } from '@/helpers/chars.js';
import { classNames } from '@/helpers/classNames.js';
import { isEmptyPost } from '@/helpers/isEmptyPost.js';
import { narrowToSocialSource } from '@/helpers/narrowSource.js';
import { useCurrentAvailableProfile } from '@/hooks/useCurrentAvailableProfile.js';
import { useSetEditorContent } from '@/hooks/useSetEditorContent.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

interface ComposeThreadContentProps {}

export function ComposeThreadContent(props: ComposeThreadContentProps) {
    const currentSource = useGlobalState.use.currentSource();
    const currentSocialSource = narrowToSocialSource(currentSource);

    const currentProfile = useCurrentAvailableProfile(currentSocialSource);

    const setEditorContent = useSetEditorContent();

    const { posts, cursor, computed, updateCursor, removePostInThread } = useComposeStateStore();

    return (
        <div>
            {posts.map((x, i) => {
                const isSuccessed = !!compact(values(x.postId)).length;
                const isError = !!compact(values(x.postError)).length;

                return (
                    <div
                        key={x.id}
                        className={classNames(
                            ' ease relative my-3 flex gap-2 transition-opacity',
                            cursor === x.id ? 'min-h-[100px]' : 'min-h-0',
                            cursor !== x.id ? 'opacity-50' : 'opacity-100',
                        )}
                        onClick={() => {
                            updateCursor(x.id);
                            if (cursor !== x.id) setEditorContent(readChars(x.chars, true));
                        }}
                    >
                        {cursor === x.id && isEmptyPost(x) && i !== 0 ? (
                            <CloseButton
                                className=" absolute right-0 top-2 z-10"
                                onClick={() => {
                                    const next = computed.nextAvailablePost;
                                    if (!next) return;

                                    removePostInThread(x.id);
                                    setEditorContent(readChars(next.chars, true));
                                }}
                                tooltip={t`Remove`}
                                size={20}
                            />
                        ) : null}
                        {i < posts.length - 1 ? (
                            <div className=" absolute bottom-0 left-[19px] top-0 h-full w-[2px] bg-secondaryMain" />
                        ) : null}
                        {currentProfile ? (
                            <div className="relative">
                                <ProfileAvatar profile={currentProfile} enableSourceIcon={false} />
                                {isSuccessed ? (
                                    <YesIcon className="absolute right-0 top-0 z-10" width={15} height={15} />
                                ) : null}
                                {isError ? (
                                    <ErrorIcon className="absolute right-0 top-0 z-10" width={15} height={15} />
                                ) : null}
                            </div>
                        ) : null}
                        <div className=" mb-3 mt-2 flex-1">
                            <ComposeContent post={x} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
