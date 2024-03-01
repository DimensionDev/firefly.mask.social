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
import LexicalAutoLinkPlugin from '@/components/Lexical/plugins/AutoLinkPlugin.js';
import { classNames } from '@/helpers/classNames.js';
import { writeChars } from '@/helpers/readChars.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

function ErrorBoundaryComponent() {
    return (
        <div>
            <Trans>Something went wrong. Please try again.</Trans>
        </div>
    );
}

const Editor = memo(function Editor() {
    const {
        type,
        post,
        video,
        images,
        frames,
        openGraphes,
        chars,
        updateChars,
        loadFramesFromChars,
        loadOpenGraphesFromChars,
    } = useComposeStateStore();

    const hasMediaObject = images.length > 0 || !!video || frames.length || openGraphes.length;

    useDebounce(
        () => {
            loadFramesFromChars();
            loadOpenGraphesFromChars();
        },
        300,
        [chars, loadFramesFromChars, loadOpenGraphesFromChars],
    );

    return (
        <div className=" relative">
            <PlainTextPlugin
                contentEditable={
                    <ContentEditable
                        className={classNames(
                            'cursor-text resize-none appearance-none border-none bg-transparent p-0 text-left text-[15px] leading-5 text-main outline-0 focus:ring-0',
                            hasMediaObject ? '' : post || frames.length ? 'min-h-[200px]' : 'min-h-[308px]',
                        )}
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

export default Editor;
