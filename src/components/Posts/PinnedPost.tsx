'use client';

import { Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';

import PinnedIcon from '@/assets/pinned.svg';
import { SinglePost } from '@/components/Posts/SinglePost.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';

interface Props {
    source: SocialSource;
    profileId: string;
}

const AVAILABLE_SOURCE: SocialSource[] = [Source.Twitter];

function PinnedPostContent({ source, profileId }: Props) {
    const { data } = useQuery({
        queryKey: ['pinned-post', source, profileId],
        async queryFn() {
            const provider = resolveSocialMediaProvider(source);
            return provider.getPinnedPost(profileId);
        },
    });

    if (!data) return null;

    return (
        <SinglePost
            header={
                <div className="mb-3 flex items-center text-[15px] font-bold text-second">
                    <PinnedIcon width={16} height={16} className="mr-2" />
                    <Trans>Pinned</Trans>
                </div>
            }
            post={data}
            showMore
        />
    );
}

export function PinnedPost(props: Props) {
    if (!AVAILABLE_SOURCE.includes(props.source)) return null;
    return <PinnedPostContent {...props} />;
}
