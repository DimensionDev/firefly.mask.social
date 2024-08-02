import { ComposeImage } from '@/components/Compose/ComposeImage.js';
import { ComposeVideo } from '@/components/Compose/ComposeVideo.js';
import { Editor } from '@/components/Compose/Editor.js';
import { Placeholder } from '@/components/Compose/Placeholder.js';
import { PollCreatorCard } from '@/components/Poll/PollCreatorCard.js';
import { PostLinksInCompose } from '@/components/Posts/PostLinks.js';
import { Quote } from '@/components/Posts/Quote.js';
import { Reply } from '@/components/Posts/Reply.js';
import { classNames } from '@/helpers/classNames.js';
import { type CompositePost, useComposeStateStore } from '@/store/useComposeStore.js';

interface ComposeContentProps {
    post: CompositePost;
}

export function ComposeContent(props: ComposeContentProps) {
    const { type, cursor } = useComposeStateStore();

    const { id, parentPost, images, video, poll, availableSources, chars } = props.post;

    // in reply and quote mode, there could be only one parent post
    const post = parentPost.Farcaster || parentPost.Lens;
    const replying = type === 'reply' && !!post;

    return (
        <div className="relative flex flex-1 flex-col">
            {replying ? <Reply post={post} compositePost={props.post} /> : null}

            {!replying ? (
                cursor === id ? (
                    <Editor post={props.post} replying={replying} />
                ) : (
                    <Placeholder post={props.post} />
                )
            ) : null}

            {/* poll */}
            {poll ? <PollCreatorCard post={props.post} readonly={cursor !== props.post.id} /> : null}

            {/* image */}
            {images.length > 0 && (
                <div
                    className={classNames(
                        'relative grid gap-2 py-3',
                        images.length <= 4 ? 'grid-cols-2' : 'grid-cols-5',
                        replying ? 'pl-[52px]' : '',
                    )}
                >
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
            {video ? (
                <div className={replying ? 'pl-[52px]' : ''}>
                    <ComposeVideo post={props.post} />
                </div>
            ) : null}

            {/* quote */}
            {type === 'quote' && post ? <Quote post={post} className="text-left" /> : null}

            <PostLinksInCompose
                chars={chars}
                parentPost={post}
                source={post?.source ?? availableSources[0]}
                type={type}
            />
        </div>
    );
}
