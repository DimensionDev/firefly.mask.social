import { ComposeContent } from '@/components/Compose/ComposeContent.js';
import { useSetEditorContent } from '@/components/Compose/useSetEditorContent.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { classNames } from '@/helpers/classNames.js';
import { readChars } from '@/helpers/readChars.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

interface ComposeThreadContentProps {}

export function ComposeThreadContent(props: ComposeThreadContentProps) {
    const { currentSource } = useGlobalState();

    const setEditorContent = useSetEditorContent();

    const { posts, cursor, updateCursor } = useComposeStateStore();

    const currentProfile = useCurrentProfile(currentSource);

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
                    {i < posts.length - 1 ? (
                        <div className=" absolute bottom-0 left-[19px] top-0 h-full w-[2px] bg-secondaryMain" />
                    ) : null}
                    {currentProfile ? <ProfileAvatar profile={currentProfile} enableSourceIcon={false} /> : null}
                    <div className=" mb-5 mt-2 flex-1 pb-1">
                        <ComposeContent post={x} />
                    </div>
                </div>
            ))}
        </div>
    );
}
