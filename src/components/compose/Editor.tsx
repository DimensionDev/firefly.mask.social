import { useMemo } from 'react';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin';
import LexicalAutoLinkPlugin from '@/components/shared/lexical/plugins/AutoLinkPlugin';
import { MentionsPlugin } from '@/components/shared/lexical/plugins/AtMentionsPlugin';

interface EditorProps {
    type: 'compose' | 'quote' | 'reply';
}
export default function Editor({ type }: EditorProps) {
    const placeholder = useMemo(() => {
        return {
            compose: "What's happening...",
            quote: 'Add a comment',
            reply: 'Post your reply',
        }[type];
    }, [type]);

    return (
        <div className=" relative">
            <PlainTextPlugin
                contentEditable={
                    <ContentEditable className=" min-h-[100px] text-left bg-transparent text-base resize-none border-none outline-0 appearance-none p-0 focus:ring-0" />
                }
                placeholder={<div className=" text-[#767F8D] absolute top-0 left-0">{placeholder}</div>}
                ErrorBoundary={LexicalErrorBoundary}
            />

            <LexicalAutoLinkPlugin />
            <HistoryPlugin />
            <HashtagPlugin />
            <MentionsPlugin />
        </div>
    );
}
