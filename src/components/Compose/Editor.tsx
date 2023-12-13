import { $convertToMarkdownString, TEXT_FORMAT_TRANSFORMERS } from '@lexical/markdown';
import { ContentEditable } from '@lexical/react/LexicalContentEditable.js';
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin.js';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin.js';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin.js';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin.js';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin.js';
import { t } from '@lingui/macro';
import { useMemo } from 'react';

import { MentionsPlugin } from '@/components/shared/lexical/plugins/AtMentionsPlugin.js';
import LexicalAutoLinkPlugin from '@/components/shared/lexical/plugins/AutoLinkPlugin.js';
import { classNames } from '@/helpers/classNames.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

const TRANSFORMERS = [...TEXT_FORMAT_TRANSFORMERS];

function ErrorBoundaryComponent() {
    return <div>Something went wrong!</div>;
}

interface EditorProps {}
export default function Editor(props: EditorProps) {
    const type = useComposeStateStore.use.type();
    const post = useComposeStateStore.use.post();
    const video = useComposeStateStore.use.video();
    const images = useComposeStateStore.use.images();
    const updateChars = useComposeStateStore.use.updateChars();

    const hasMediaObject = images.length > 0 || !!video;

    const placeholder = useMemo(() => {
        return {
            compose: t`What's happening...`,
            quote: t`Add a comment`,
            reply: t`Post your reply`,
        }[type];
    }, [type]);

    return (
        <div className=" relative">
            <PlainTextPlugin
                contentEditable={
                    <ContentEditable
                        className={classNames(
                            ' cursor-text resize-none appearance-none border-none bg-transparent p-0 text-left text-[15px] leading-5 text-main outline-0 focus:ring-0',
                            hasMediaObject ? '' : post ? 'min-h-[200px]' : 'min-h-[308px]',
                        )}
                    />
                }
                placeholder={
                    <div className=" pointer-events-none absolute left-0 top-0 text-[15px] leading-5 text-placeholder">
                        {placeholder}
                    </div>
                }
                ErrorBoundary={ErrorBoundaryComponent}
            />
            <OnChangePlugin
                onChange={(editorState) => {
                    editorState.read(() => {
                        const markdown = $convertToMarkdownString(TRANSFORMERS);
                        updateChars(markdown);
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
