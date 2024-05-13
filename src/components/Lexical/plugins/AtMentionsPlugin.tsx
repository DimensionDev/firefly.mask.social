import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext.js';
import type { MenuTextMatch } from '@lexical/react/LexicalTypeaheadMenuPlugin.js';
import {
    LexicalTypeaheadMenuPlugin,
    MenuOption,
    useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin.js';
import { EMPTY_LIST } from '@masknet/shared-base';
import { useQuery } from '@tanstack/react-query';
import type { TextNode } from 'lexical/index.js';
import { first } from 'lodash-es';
import { memo, useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDebounce } from 'usehooks-ts';

import { Avatar } from '@/components/Avatar.js';
import { $createMentionNode } from '@/components/Lexical/nodes/MentionsNode.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfileAll.js';

const PUNCTUATION = '\\.,\\+\\*\\?\\$\\@\\|#{}\\(\\)\\^\\-\\[\\]\\\\/!%\'"~=<>_:;';
const NAME = `\\b[A-Z][^\\s${PUNCTUATION}]`;

const DocumentMentionsRegex = {
    NAME,
    PUNCTUATION,
};

const PUNC = DocumentMentionsRegex.PUNCTUATION;
const TRIGGERS = ['@'].join('');
const VALID_CHARS = `[^${TRIGGERS}${PUNC}\\s]`;
const VALID_JOINS = `(?:\\.[ |$]| |[${PUNC}]|)`;
const LENGTH_LIMIT = 32;
const ALIAS_LENGTH_LIMIT = 50;
const SUGGESTION_LIST_LENGTH_LIMIT = 5;

const AtSignMentionsRegex = new RegExp(
    `(^|\\s|\\()([${TRIGGERS}]((?:${VALID_CHARS}${VALID_JOINS}){0,${LENGTH_LIMIT}}))$`,
);

const AtSignMentionsRegexAliasRegex = new RegExp(
    `(^|\\s|\\()([${TRIGGERS}]((?:${VALID_CHARS}){0,${ALIAS_LENGTH_LIMIT}}))$`,
);

const checkForAtSignMentions = (text: string, minMatchLength: number): MenuTextMatch | null => {
    let match = AtSignMentionsRegex.exec(text);

    if (match === null) {
        match = AtSignMentionsRegexAliasRegex.exec(text);
    }

    if (match !== null) {
        const maybeLeadingWhitespace = match[1];
        const matchingString = match[3];
        if (matchingString.length >= minMatchLength) {
            return {
                leadOffset: match.index + maybeLeadingWhitespace.length,
                matchingString,
                replaceableString: match[2],
            };
        }
    }

    return null;
};

const getPossibleQueryMatch = (text: string): MenuTextMatch | null => {
    const match = checkForAtSignMentions(text, 1);
    return match;
};

class MentionTypeaheadOption extends MenuOption {
    displayName: string;
    handle: string;
    profileId: string;
    pfp: string;
    fullHandle: string;

    constructor(id: string, displayName: string, handle: string, pfp: string, fullHandle: string) {
        super(displayName);
        this.profileId = id;
        this.handle = handle;
        this.displayName = displayName;
        this.pfp = pfp;
        this.fullHandle = fullHandle;
    }
}

interface MentionsTypeaheadMenuItemProps {
    index: number;
    isSelected: boolean;
    onClick: () => void;
    onMouseEnter: () => void;
    option: MentionTypeaheadOption;
}

const MentionsTypeaheadMenuItem = memo<MentionsTypeaheadMenuItemProps>(function MentionsTypeaheadMenuItem({
    isSelected,
    onClick,
    onMouseEnter,
    option,
}) {
    return (
        <li
            className="cursor-pointer"
            key={option.key}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            ref={option.setRefElement}
            tabIndex={-1}
        >
            <div
                className={classNames(
                    { 'bg-gray-200 dark:bg-gray-800': isSelected },
                    'm-1.5 flex items-center space-x-2 rounded-xl px-3 py-1 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-800',
                )}
            >
                <Avatar alt={option.handle} className="h-7 w-7 rounded-full" src={option.pfp} size={32} />
                <div className="flex flex-col truncate">
                    <div className="flex items-center space-x-1 text-sm">
                        <span>{option.displayName}</span>
                    </div>
                    <span className="text-xs">{option.handle}</span>
                </div>
            </div>
        </li>
    );
});
export function MentionsPlugin(): JSX.Element | null {
    const currentProfileAll = useCurrentProfileAll();

    const { availableSources } = useCompositePost();

    const [queryString, setQueryString] = useState<string | null>(null);
    const [editor] = useLexicalComposerContext();

    const debounceQuery = useDebounce(queryString, 1000);

    const { data } = useQuery({
        enabled: !!debounceQuery,
        queryKey: [
            'searchProfiles',
            availableSources,
            debounceQuery,
            SORTED_SOCIAL_SOURCES.map((x) => currentProfileAll[x]?.profileId).join('_'),
        ],
        queryFn: async () => {
            if (!debounceQuery) return;

            // When the default state is to send a multi-platform post, it will not be queried.
            if (availableSources.length !== 1) return;

            const currentSource = first(availableSources);
            if (!currentSource) return;

            const provider = resolveSocialMediaProvider(currentSource);
            return provider.searchProfiles(debounceQuery);
        },
    });

    const options = useMemo(() => {
        if (!data?.data) return EMPTY_LIST;

        return data.data
            .map(({ profileId, displayName, handle, pfp, fullHandle }) => {
                return new MentionTypeaheadOption(profileId, displayName, handle, pfp, fullHandle);
            })
            .slice(0, SUGGESTION_LIST_LENGTH_LIMIT);
    }, [data?.data]);

    const checkForSlashTriggerMatch = useBasicTypeaheadTriggerMatch('/', {
        minLength: 0,
    });

    const checkForMentionMatch = useCallback(
        (text: string) => {
            const slashMatch = checkForSlashTriggerMatch(text, editor);

            if (slashMatch !== null) {
                return null;
            }

            return getPossibleQueryMatch(text);
        },
        [checkForSlashTriggerMatch, editor],
    );

    const onSelectOption = useCallback(
        (selectedOption: MentionTypeaheadOption, nodeToReplace: null | TextNode, closeMenu: () => void) => {
            editor.update(() => {
                const mentionNode = $createMentionNode(selectedOption.fullHandle);
                if (nodeToReplace) {
                    nodeToReplace.replace(mentionNode);
                }
                mentionNode.select().insertText(' ');
                closeMenu();
            });
        },
        [editor],
    );

    return (
        <LexicalTypeaheadMenuPlugin<MentionTypeaheadOption>
            menuRenderFn={(anchorElementRef, { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }) => {
                return anchorElementRef.current && options.length
                    ? createPortal(
                          <div className="bg-brand sticky z-[999] mt-2 w-52 min-w-full rounded-xl border bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                              <ul className="divide-y dark:divide-gray-700">
                                  {options.map((option, i: number) => (
                                      <MentionsTypeaheadMenuItem
                                          index={i}
                                          isSelected={selectedIndex === i}
                                          key={option.key}
                                          onClick={() => {
                                              setHighlightedIndex(i);
                                              selectOptionAndCleanUp(option);
                                          }}
                                          onMouseEnter={() => {
                                              setHighlightedIndex(i);
                                          }}
                                          option={option}
                                      />
                                  ))}
                              </ul>
                          </div>,
                          anchorElementRef.current,
                      )
                    : null;
            }}
            onSelectOption={onSelectOption}
            onQueryChange={setQueryString}
            triggerFn={checkForMentionMatch}
            options={options}
        />
    );
}
