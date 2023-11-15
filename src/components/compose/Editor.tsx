import { useMemo } from 'react';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin';
import LexicalAutoLinkPlugin from '@/components/shared/lexical/plugins/AutoLinkPlugin';
import { MentionsPlugin } from '@/components/shared/lexical/plugins/AtMentionsPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { $convertToMarkdownString, TEXT_FORMAT_TRANSFORMERS } from '@lexical/markdown';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { classNames } from '@/helpers/classNames';

const TRANSFORMERS = [...TEXT_FORMAT_TRANSFORMERS];

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
                            ' leading-5 text-left bg-transparent text-base resize-none border-none outline-0 appearance-none p-0 focus:ring-0 cursor-text',
                            hasImages ? '' : 'min-h-[308px]',
                        )}
                    />
                }
                placeholder={
                    <div className=" leading-5 text-[#767F8D] absolute top-0 left-0 pointer-events-none">
                        {placeholder}
                    </div>
                }
                ErrorBoundary={LexicalErrorBoundary}
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
