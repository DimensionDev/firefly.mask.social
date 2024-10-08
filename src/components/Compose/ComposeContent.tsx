import { ComposeImages } from '@/components/Compose/ComposeImages.js';
import { ComposeVideo } from '@/components/Compose/ComposeVideo.js';
import { Editor } from '@/components/Compose/Editor.js';
import { Placeholder } from '@/components/Compose/Placeholder.js';
import { PollCreatorCard } from '@/components/Poll/PollCreatorCard.js';
import { PostLinksInCompose } from '@/components/Posts/PostLinks.js';
import { Quote } from '@/components/Posts/Quote.js';
import { Reply } from '@/components/Posts/Reply.js';
import { type CompositePost, useComposeStateStore } from '@/store/useComposeStore.js';

interface ComposeContentProps {
    post: CompositePost;
}

export function ComposeContent(props: ComposeContentProps) {
    const { type, cursor } = useComposeStateStore();

    const { id, parentPost, images, poll, availableSources, chars } = props.post;

    // in reply and quote mode, there could be only one parent post
    const post = parentPost.Farcaster || parentPost.Lens || parentPost.Twitter;
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
            {images.length > 0 ? <ComposeImages className="flex-grow" images={images} /> : null}

            {/* video */}
            {props.post.video ? (
                <div className={replying ? 'pl-[52px]' : ''}>
                    <ComposeVideo video={props.post.video} />
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
