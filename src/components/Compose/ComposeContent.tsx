import { Trans } from '@lingui/macro';

import { ComposeImage } from '@/components/Compose/ComposeImage.js';
import { ComposeVideo } from '@/components/Compose/ComposeVideo.js';
import { Editor } from '@/components/Compose/Editor.js';
import { FrameUI } from '@/components/Frame/index.js';
import { OembedUI } from '@/components/Oembed/index.js';
import { Quote } from '@/components/Posts/Quote.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { type CompositPost, useComposeStateStore } from '@/store/useComposeStore.js';

interface ComposeContentProps {
    post?: CompositPost;
}

export function ComposeContent(props: ComposeContentProps) {
    const { type, computed } = useComposeStateStore();

    const { post, images, video, frames, openGraphs } = props.post ?? computed;

    return (
        <div className="block h-[338px] overflow-auto rounded-lg border border-secondaryLine bg-bg px-4 py-[14px]">
            <div className="flex min-h-full flex-col">
                {type === 'reply' && post ? (
                    <div className=" mb-3 text-left text-[15px] text-fourMain">
                        <Trans>
                            Replying to <span className="text-link">@{post.author.handle}</span> on{' '}
                            {resolveSourceName(post.source)}
                        </Trans>
                    </div>
                ) : null}

                <Editor post={props.post} />

                {/* image */}
                {images.length > 0 && (
                    <div className=" relative grid grid-cols-2 gap-2 p-3">
                        {images.map((image, index) => (
                            <ComposeImage key={`${image.file.name}_${index}`} index={index} image={image} />
                        ))}
                    </div>
                )}

                {/* video */}
                {video ? <ComposeVideo /> : null}

                {/* quote */}
                {(type === 'quote' || type === 'reply') && post ? <Quote post={post} className="text-left" /> : null}

                {/* open graphs */}
                {openGraphs.length ? (
                    <div className=" flex gap-2">
                        {openGraphs.map((o) => (
                            <OembedUI key={o.url} og={o} />
                        ))}
                    </div>
                ) : null}

                {/* frame */}
                {frames.length ? (
                    <div className=" flex gap-2">
                        {frames.map((f) => (
                            <FrameUI key={f.url} frame={f} readonly />
                        ))}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
