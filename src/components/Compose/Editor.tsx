import { $convertToMarkdownString, TEXT_FORMAT_TRANSFORMERS } from '@lexical/markdown';
import { ContentEditable } from '@lexical/react/LexicalContentEditable.js';
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin.js';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin.js';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin.js';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin.js';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin.js';
import { Select, t, Trans } from '@lingui/macro';
import { memo } from 'react';
import { useDebounce } from 'react-use';

import { MentionsPlugin } from '@/components/Lexical/plugins/AtMentionsPlugin.js';
import { LexicalAutoLinkPlugin } from '@/components/Lexical/plugins/AutoLinkPlugin.js';
import { writeChars } from '@/helpers/readChars.js';
import { type CompositePost, useComposeStateStore } from '@/store/useComposeStore.js';

function ErrorBoundaryComponent() {
    return (
        <div>
            <Trans>Something went wrong. Please try again.</Trans>
        </div>
    );
}

interface EditorProps {
    post: CompositePost;
}

export const Editor = memo(function Editor(props: EditorProps) {
    const { type, updateChars, loadFramesFromChars, loadOpenGraphsFromChars } = useComposeStateStore();

    const { chars } = props.post;

    useDebounce(
        () => {
            loadFramesFromChars();
            loadOpenGraphsFromChars();
        },
        300,
        [chars, loadFramesFromChars, loadOpenGraphsFromChars],
    );

    return (
        <div className=" relative">
            <PlainTextPlugin
                contentEditable={
                    <ContentEditable
                        className={
                            'cursor-text resize-none appearance-none border-none bg-transparent p-0 text-left text-[15px] leading-5 text-main outline-0 focus:ring-0'
                        }
                    />
                }
                placeholder={
                    <div className=" pointer-events-none absolute left-0 top-0 text-[15px] leading-5 text-placeholder">
                        <Select
                            value={type}
                            _compose={t`What's happening...`}
                            _quote={t`Add a comment`}
                            _reply={t`Post your reply`}
                            other={t`What's happening...`}
                        />
                    </div>
                }
                ErrorBoundary={ErrorBoundaryComponent}
            />
            <OnChangePlugin
                onChange={(editorState) => {
                    editorState.read(async () => {
                        const markdown = $convertToMarkdownString(TEXT_FORMAT_TRANSFORMERS);
                        updateChars((chars) => writeChars(chars, markdown));
                    });
                }}
            />

            <LexicalAutoLinkPlugin />
            <HistoryPlugin />
            <HashtagPlugin />
            <MentionsPlugin />
            <MarkdownShortcutPlugin transformers={TEXT_FORMAT_TRANSFORMERS} />
        </div>
    );
});
