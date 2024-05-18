import { Trans } from '@lingui/macro';

import { ComposeImage } from '@/components/Compose/ComposeImage.js';
import { ComposeVideo } from '@/components/Compose/ComposeVideo.js';
import { Editor } from '@/components/Compose/Editor.js';
import { Placeholder } from '@/components/Compose/Placeholder.js';
import { FrameUI } from '@/components/Frame/index.js';
import { OembedUI } from '@/components/Oembed/index.js';
import { ComposePoll } from '@/components/Poll/ComposePoll.js';
import { Quote } from '@/components/Posts/Quote.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { type CompositePost, useComposeStateStore } from '@/store/useComposeStore.js';

interface ComposeContentProps {
    post: CompositePost;
}

export function ComposeContent(props: ComposeContentProps) {
    const { type, cursor } = useComposeStateStore();

    const { id, parentPost, images, video, frames, openGraphs, poll } = props.post;

    // in reply and quote mode, there could be only one parent post
    const post = parentPost.Farcaster || parentPost.Lens;
    const replying = type === 'reply' && !!post;

    const differenceOpenGraphs = openGraphs.filter((x) => !frames.find((y) => x.url === y.url));

    return (
        <div className="relative flex flex-1 flex-col">
            {replying ? (
                <div className=" mb-3 text-left text-[15px] text-fourMain">
                    <Trans>
                        Replying to <span className="text-link">@{post.author.handle}</span> on{' '}
                        {resolveSourceName(post.source)}
                    </Trans>
                </div>
            ) : null}

            {cursor === id ? <Editor post={props.post} replying={replying} /> : <Placeholder post={props.post} />}

            {/* poll */}
            {poll ? <ComposePoll post={props.post} readonly={cursor !== props.post.id} /> : null}

            {/* image */}
            {images.length > 0 && (
                <div className=" relative grid grid-cols-2 gap-2 py-3">
                    {images.map((image, index) => (
                        <ComposeImage
                            key={`${image.file.name}_${index}`}
                            index={index}
                            image={image}
                            size={images.length}
                            readonly={cursor !== props.post.id}
                        />
                    ))}
                </div>
            )}

            {/* video */}
            {video ? <ComposeVideo post={props.post} /> : null}

            {/* quote */}
            {(type === 'quote' || type === 'reply') && post ? <Quote post={post} className="text-left" /> : null}

            {/* open graphs */}
            {differenceOpenGraphs.length ? (
                <div className=" flex w-full gap-2">
                    {differenceOpenGraphs.map((o) => (
                        <OembedUI key={o.url} og={o} />
                    ))}
                </div>
            ) : null}

            {/* frame */}
            {frames.length ? (
                <div className=" flex w-full gap-2">
                    {frames.map((f) => (
                        <FrameUI key={f.url} frame={f} readonly />
                    ))}
                </div>
            ) : null}
        </div>
    );
}
