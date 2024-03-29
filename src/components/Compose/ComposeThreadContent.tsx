import { ComposeContent } from '@/components/Compose/ComposeContent.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

interface ComposeThreadContentProps {}

export function ComposeThreadContent(props: ComposeThreadContentProps) {
    const { posts, cursor, computed } = useComposeStateStore();

    console.log('DEBUG: posts');
    console.log({
        cursor,
        posts,
        computed,
    });

    return (
        <div>
            {posts.map((x) => (
                <div key={x.id}>
                    <span>{x.id}</span>
                    <ComposeContent post={x} />
                </div>
            ))}
        </div>
    );
}
