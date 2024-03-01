import { Trans } from '@lingui/macro';

import ComposeImage from '@/components/Compose/ComposeImage.js';
import ComposeVideo from '@/components/Compose/ComposeVideo.js';
import Editor from '@/components/Compose/Editor.js';
import { FrameUI } from '@/components/Frame/index.js';
import { Oembed } from '@/components/Oembed/index.js';
import { Quote } from '@/components/Posts/Quote.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { useComposeLink, useComposeStateStore } from '@/store/useComposeStore.js';

interface ComposeContentProps {}
export default function ComposeContent(props: ComposeContentProps) {
    const { type, post, images, video, frames } = useComposeStateStore();
    const link = useComposeLink();

    return (
        <div className="p-4">
            <label
                className={classNames(
                    ' block h-[338px] overflow-auto rounded-lg border border-secondaryLine bg-bg px-4 py-[14px]',
                )}
            >
                <div className="flex min-h-full flex-col">
                    {type === 'reply' && post ? (
                        <div className=" mb-3 text-left text-[15px] text-fourMain">
                            <Trans>
                                Replying to <span className="text-link">@{post.author.handle}</span> on{' '}
                                {resolveSourceName(post.source)}
                            </Trans>
                        </div>
                    ) : null}

                    {/* <PluginBadge /> */}

                    <Editor />

                    {link ? <Oembed url={link} /> : null}

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
                    {(type === 'quote' || type === 'reply') && post ? (
                        <Quote post={post} className="text-left" />
                    ) : null}

                    {/* frame */}
                    {frames.length ? (
                        <div className=" flex flex-nowrap gap-2">
                            {frames.map((f) => (
                                <div className=" flex-1" key={f.url}>
                                    <FrameUI frame={f} readonly />
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>
            </label>
        </div>
    );
}
