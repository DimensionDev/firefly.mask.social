import { $convertToMarkdownString, TEXT_FORMAT_TRANSFORMERS } from '@lexical/markdown';
import { ContentEditable } from '@lexical/react/LexicalContentEditable.js';
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin.js';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin.js';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin.js';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin.js';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin.js';
import { $dfs } from '@lexical/utils';
import { Select, t, Trans } from '@lingui/macro';
import { memo } from 'react';
import { useDebounce } from 'react-use';

import { $isMentionNode } from '@/components/Lexical/nodes/MentionsNode.js';
import { MentionsPlugin } from '@/components/Lexical/plugins/AtMentionsPlugin.js';
import { LexicalAutoLinkPlugin } from '@/components/Lexical/plugins/AutoLinkPlugin.js';
import { CHAR_TAG, type Chars, writeChars } from '@/helpers/chars.js';
import { classNames } from '@/helpers/classNames.js';
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
    replying: boolean;
}

export const Editor = memo(function Editor({ post, replying }: EditorProps) {
    const { type, posts, updateChars, loadComponentsFromChars } = useComposeStateStore();

    const { chars } = post;
    const index = posts.findIndex((x) => x.id === post.id);

    useDebounce(
        () => {
            loadComponentsFromChars();
        },
        300,
        [chars, loadComponentsFromChars],
    );

    return (
        <>
            <PlainTextPlugin
                contentEditable={
                    <ContentEditable
                        key="editable"
                        className="flex-1 cursor-text resize-none appearance-none border-none bg-transparent p-0 text-left text-[16px] leading-6 text-main outline-none outline-0 focus:ring-0"
                    />
                }
                placeholder={
                    <div
                        className={classNames(
                            'pointer-events-none absolute left-0 top-0 text-[15px] leading-5 text-placeholder',
                            { 'top-2.5 pl-[52px]': replying },
                        )}
                    >
                        <Select
                            value={type}
                            _compose={
                                post.poll
                                    ? t`Ask a question`
                                    : index === 0
                                      ? t`What's happening...`
                                      : t`Add another post...`
                            }
                            _quote="Add a comment"
                            _reply="Post your reply"
                            other={index === 0 ? t`What's happening...` : t`Add another post...`}
                        />
                    </div>
                }
                ErrorBoundary={ErrorBoundaryComponent}
            />
            <OnChangePlugin
                onChange={(editorState) => {
                    editorState.read(async () => {
                        const markdown = $convertToMarkdownString(TEXT_FORMAT_TRANSFORMERS);
                        const allNodes = $dfs();
                        const mentionNodes = allNodes.filter((x) => $isMentionNode(x.node));
                        const temp = markdown.replace('\n', '') === '' ? '' : markdown;
                        const newChars: Chars = temp
                            .split(/(@[^\s()@:%+~#?&=,!?']+)/g)
                            .filter(Boolean)
                            .map((x) => {
                                const targetMentionNode = mentionNodes.find((node) => node.node.__text === x);
                                if (targetMentionNode)
                                    return {
                                        tag: CHAR_TAG.MENTION,
                                        visible: true,
                                        content: x,
                                        profiles: targetMentionNode.node.__profiles,
                                    };

                                return x;
                            });

                        updateChars((chars) => writeChars(chars, newChars));
                    });
                }}
            />

            <LexicalAutoLinkPlugin />
            <HistoryPlugin />
            <HashtagPlugin />
            <MentionsPlugin />
            <MarkdownShortcutPlugin transformers={TEXT_FORMAT_TRANSFORMERS} />
        </>
    );
});
