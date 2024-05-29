import { Trans } from '@lingui/macro';
import { first } from 'lodash-es';
import { memo, useMemo } from 'react';

import { Link } from '@/esm/Link.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { type Draft, useComposeStateStore } from '@/store/useComposeStore.js';

interface DraftListItemProps {
    draft: Draft;
}

const DraftListItem = memo<DraftListItemProps>(function DraftListItem({ draft }) {
    const title = useMemo(() => {
        const target = first(draft.posts);
        const parent = target?.parentPost;
        const post = parent?.Farcaster || parent?.Lens;
        switch (draft.type) {
            case 'compose':
                if (draft.posts.length) return <Trans>THREAD POST</Trans>;
                return <Trans>POST</Trans>;
            case 'reply':
                const profileUrl = post ? getProfileUrl(post.author) : '';

                return (
                    <Trans>
                        REPLY
                        <span>
                            to <Link href={profileUrl}>@{post?.author.handle}</Link>
                        </span>
                    </Trans>
                );
        }
    }, [draft]);
    return <div className="px-6 py-3" />;
});

export const DraftList = memo(function DraftList() {
    const { drafts } = useComposeStateStore();

    return (
        <div>
            {/* {drafts.map((draft) => {
                return <div></div>;
            })} */}
        </div>
    );
});
