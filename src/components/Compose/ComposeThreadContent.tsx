import { ComposeContent } from '@/components/Compose/ComposeContent.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

interface ComposeThreadContentProps {}

export function ComposeThreadContent(props: ComposeThreadContentProps) {
    const { posts } = useComposeStateStore();
    return (
        <div>
            {posts.map((x) => (
                <ComposeContent key={x.id} post={x} />
            ))}
        </div>
    );
}
