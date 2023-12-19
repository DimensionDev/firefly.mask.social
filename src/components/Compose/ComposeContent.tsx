import { Trans } from '@lingui/macro';
import { first } from 'lodash-es';

import ComposeImage from '@/components/Compose/ComposeImage.js';
import ComposeVideo from '@/components/Compose/ComposeVideo.js';
import Editor from '@/components/Compose/Editor.js';
import { SourceIcon } from '@/components/SourceIcon.js';
import { TimestampFormatter } from '@/components/TimeStampFormatter.js';
import { Image } from '@/esm/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

interface ComposeContentProps {}
export default function ComposeContent(props: ComposeContentProps) {
    const { type, post, images, video } = useComposeStateStore();

    return (
        <div className=" p-4">
            <label
                className={classNames(
                    ' hide-scrollbar border-line2 block h-[338px] overflow-auto rounded-lg border bg-bg px-4 py-[14px]',
                )}
            >
                <div className=" flex min-h-full flex-col justify-between">
                    {type === 'reply' && post ? (
                        <div className=" mb-3 text-left text-[15px] text-fourMain">
                            <Trans>Replying to</Trans>
                            <span className=" text-link"> @{post.author.handle} </span>
                            <Trans>on Lens</Trans>
                        </div>
                    ) : null}

                    {/* <PluginBadge /> */}

                    <Editor />

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
                        <div className=" flex flex-col gap-1 overflow-hidden rounded-2xl border border-secondaryLine bg-bg p-3 text-main">
                            <div className=" flex h-6 items-center justify-between">
                                <div className=" text-[15px]] flex items-center gap-2">
                                    <Image
                                        src={post.author.pfp}
                                        width={24}
                                        height={24}
                                        alt="pfp"
                                        className=" rounded-full"
                                    />
                                    <span className=" font-medium">{post.author.displayName}</span>
                                    <span className=" text-placeholder">
                                        @{post.author.handle || post.author.profileId}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <SourceIcon source={post.source} />
                                    <span className="text-xs leading-4 text-secondary">
                                        <TimestampFormatter time={post.timestamp} />
                                    </span>
                                </div>
                            </div>

                            <div className=" flex gap-4">
                                <p className=" text-left">{post.metadata.content?.content}</p>
                                {(post.mediaObjects?.length ?? 0) > 0 && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={first(post.mediaObjects)?.url ?? ''}
                                        width={120}
                                        height={120}
                                        alt={post.postId}
                                        className=" h-[120px] w-[120px] rounded-lg object-cover"
                                    />
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>
            </label>
        </div>
    );
}
