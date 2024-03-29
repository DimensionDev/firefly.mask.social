import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext.js';
import { Trans } from '@lingui/macro';

import { ComposeImage } from '@/components/Compose/ComposeImage.js';
import { ComposeVideo } from '@/components/Compose/ComposeVideo.js';
import { Editor } from '@/components/Compose/Editor.js';
import { FrameUI } from '@/components/Frame/index.js';
import { OembedUI } from '@/components/Oembed/index.js';
import { Quote } from '@/components/Posts/Quote.js';
import { readChars } from '@/helpers/readChars.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { type CompositPost, useComposeStateStore } from '@/store/useComposeStore.js';

interface ComposeContentProps {
    post: CompositPost;
}

export function ComposeContent(props: ComposeContentProps) {
    const { type, cursor } = useComposeStateStore();

    const { id, post, images, video, frames, openGraphs } = props.post;

    const [editor] = useLexicalComposerContext();

    return (
        <div className="flex min-h-full flex-col" onClick={() => editor.focus()}>
            {type === 'reply' && post ? (
                <div className=" mb-3 text-left text-[15px] text-fourMain">
                    <Trans>
                        Replying to <span className="text-link">@{post.author.handle}</span> on{' '}
                        {resolveSourceName(post.source)}
                    </Trans>
                </div>
            ) : null}

            {cursor === id ? (
                <Editor post={props.post} />
            ) : (
                <div className="cursor-text resize-none appearance-none whitespace-pre-wrap border-none bg-transparent p-0 text-left text-[15px] leading-5 text-main outline-0 focus:ring-0">
                    {readChars(props.post.chars, true)}
                </div>
            )}

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
    );
}
