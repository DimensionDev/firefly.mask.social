import { useMemo } from 'react';
import { ContentEditable } from '@lexical/react/LexicalContentEditable.js';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin.js';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin.js';
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin.js';
import LexicalAutoLinkPlugin from '@/components/shared/lexical/plugins/AutoLinkPlugin.js';
import { MentionsPlugin } from '@/components/shared/lexical/plugins/AtMentionsPlugin.js';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin.js';
import { $convertToMarkdownString, TEXT_FORMAT_TRANSFORMERS } from '@lexical/markdown/index.js';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin.js';
import { classNames } from '@/helpers/classNames.js';

const TRANSFORMERS = [...TEXT_FORMAT_TRANSFORMERS];

function ErrorBoundaryComponent() {
    return <div>Something went wrong!</div>;
}

interface EditorProps {
    type: 'compose' | 'quote' | 'reply';
    setCharacters: (characters: string) => void;
    hasImages: boolean;
}
export default function Editor({ type, setCharacters, hasImages }: EditorProps) {
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
                    <ContentEditable
                        className={classNames(
                            ' cursor-text resize-none appearance-none border-none bg-transparent p-0 text-left text-base leading-5 outline-0 focus:ring-0',
                            hasImages ? '' : 'min-h-[308px]',
                        )}
                    />
                }
                placeholder={
                    <div className=" pointer-events-none absolute left-0 top-0 leading-5 text-[#767F8D]">
                        {placeholder}
                    </div>
                }
                ErrorBoundary={ErrorBoundaryComponent}
            />
            <OnChangePlugin
                onChange={(editorState) => {
                    editorState.read(() => {
                        const markdown = $convertToMarkdownString(TRANSFORMERS);
                        setCharacters(markdown);
                    });
                }}
            />

            <LexicalAutoLinkPlugin />
            <HistoryPlugin />
            <HashtagPlugin />
            <MentionsPlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        </div>
    );
}
