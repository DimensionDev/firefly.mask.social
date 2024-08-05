import type { AutoLinkNode } from '@lexical/link/index.js';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext.js';
import type { MenuTextMatch } from '@lexical/react/LexicalTypeaheadMenuPlugin.js';
import {
    LexicalTypeaheadMenuPlugin,
    MenuOption,
    useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin.js';
import { useQuery } from '@tanstack/react-query';
import type { TextNode } from 'lexical/index.js';
import { compact, first } from 'lodash-es';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDebounce, useOnClickOutside } from 'usehooks-ts';

import { Avatar } from '@/components/Avatar.js';
import { $createMentionNode } from '@/components/Lexical/nodes/MentionsNode.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { Tooltip } from '@/components/Tooltip.js';
import type { SocialSource } from '@/constants/enum.js';
import { EMPTY_LIST, SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { getSafeMentionQueryText } from '@/helpers/getMentionOriginalText.js';
import { getStampAvatarByProfileId } from '@/helpers/getStampAvatarByProfileId.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';
import { resolveSocialSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfile.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { Profile } from '@/providers/types/Firefly.js';

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
const SUGGESTION_LIST_LENGTH_LIMIT = 10;

const AtSignMentionsRegex = new RegExp(
    `(^|\\s|\\()([${TRIGGERS}]((?:${VALID_CHARS}${VALID_JOINS}){0,${LENGTH_LIMIT}}))$`,
);

const AtSignMentionsRegexAliasRegex = new RegExp(
    `(^|\\s|\\()([${TRIGGERS}]((?:${VALID_CHARS}){0,${ALIAS_LENGTH_LIMIT}}))$`,
);

const checkForAtSignMentions = (text: string, minMatchLength: number): MenuTextMatch | null => {
    const match = AtSignMentionsRegex.exec(text) || AtSignMentionsRegexAliasRegex.exec(text);

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
    platform: SocialSource;
    allProfile: Profile[];

    constructor(
        id: string,
        displayName: string,
        handle: string,
        pfp: string,
        platform: SocialSource,
        allProfile: Profile[],
    ) {
        super(displayName);
        this.profileId = id;
        this.handle = handle;
        this.displayName = displayName;
        this.pfp = pfp;
        this.platform = platform;
        this.allProfile = allProfile;
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
                <div className="flex flex-1 justify-between">
                    <div className="flex flex-col truncate">
                        <div className="flex items-center text-sm">
                            <span>{option.displayName}</span>
                        </div>
                        <span className="text-xs">@{option.handle}</span>
                    </div>
                    <div className="flex items-center">
                        {option.allProfile.map((profile, index, self) => {
                            return (
                                <Tooltip
                                    appendTo={() => document.body}
                                    placement="top"
                                    content={`@${profile.handle}`}
                                    key={profile.platform_id}
                                >
                                    <span>
                                        <SocialSourceIcon
                                            className={classNames('inline-flex items-center', {
                                                '-ml-1': index > 0 && self.length > 1,
                                            })}
                                            source={resolveSocialSource(profile.platform)}
                                            size={20}
                                        />
                                    </span>
                                </Tooltip>
                            );
                        })}
                    </div>
                </div>
            </div>
        </li>
    );
});
export function MentionsPlugin(): JSX.Element | null {
    const ref = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const currentProfileAll = useCurrentProfileAll();
    const isUpdatingMentionTag = useRef(false);
    const matchedNodeCache = useRef<AutoLinkNode>(null);

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
            const data = await FireflySocialMediaProvider.searchIdentity(debounceQuery, availableSources);

            if (!data) return EMPTY_LIST;
            return data.list
                .map((x) => {
                    const target = SORTED_SOCIAL_SOURCES.map((source) => x[resolveSocialSourceInURL(source)])
                        .flatMap((value) => value ?? EMPTY_LIST)
                        .find((profile) => profile.hit);
                    if (!target) return;

                    const allProfile = compact(
                        SORTED_SOCIAL_SOURCES.map((source) => first(x[resolveSocialSourceInURL(source)])).map((x) => {
                            if (target.platform === x?.platform) return target;
                            return x;
                        }),
                    );

                    const platform = resolveSocialSource(target.platform);
                    return {
                        platform,
                        profileId: target.platform_id,
                        avatar: getStampAvatarByProfileId(platform, target.platform_id),
                        handle: target.handle,
                        name: target.name,
                        allProfile,
                    };
                })
                .filter((handle) => !!handle);
        },
    });

    const options = useMemo(() => {
        if (!data) return EMPTY_LIST;

        return data
            .map(({ profileId, avatar, handle, name, allProfile, platform }) => {
                return new MentionTypeaheadOption(profileId, name, handle, avatar, platform, allProfile);
            })
            .slice(0, SUGGESTION_LIST_LENGTH_LIMIT);
    }, [data]);

    const checkForSlashTriggerMatch = useBasicTypeaheadTriggerMatch('/', {
        minLength: 0,
    });

    const checkForMentionMatch = useCallback(
        (text: string) => {
            const { text: queryText = '', matchedNode } =
                getSafeMentionQueryText(text, editor, isUpdatingMentionTag.current) ?? {};
            const slashMatch = checkForSlashTriggerMatch(queryText, editor);

            if (matchedNode) {
                matchedNodeCache.current = matchedNode;
            }

            if (slashMatch !== null) {
                return null;
            }

            if (!open) setOpen(true);
            return getPossibleQueryMatch(queryText);
        },
        [checkForSlashTriggerMatch, editor, open],
    );

    const onSelectOption = useCallback(
        (selectedOption: MentionTypeaheadOption, nodeToReplace: null | TextNode, closeMenu: () => void) => {
            isUpdatingMentionTag.current = true;
            editor.update(
                () => {
                    const mentionNode = $createMentionNode(selectedOption.handle, selectedOption.allProfile);
                    if (nodeToReplace) {
                        nodeToReplace.replace(mentionNode);
                    } else if (matchedNodeCache.current) {
                        matchedNodeCache.current.replace(mentionNode);
                    }
                    mentionNode.select().insertText(' ');
                    closeMenu();
                    setOpen(false);
                },
                {
                    onUpdate: () => {
                        isUpdatingMentionTag.current = false;
                        matchedNodeCache.current = null;
                    },
                    discrete: true,
                },
            );
        },
        [editor],
    );

    useOnClickOutside(ref, () => {
        setOpen(false);
    });

    return (
        <LexicalTypeaheadMenuPlugin<MentionTypeaheadOption>
            anchorClassName="z-50"
            menuRenderFn={(anchorElementRef, { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }) => {
                return anchorElementRef.current && options.length && open
                    ? createPortal(
                          <div
                              ref={ref}
                              className="bg-brand sticky z-50 mt-2 w-[300px] min-w-full rounded-xl border bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900"
                          >
                              <ul className="no-scrollbar max-h-[260px] overflow-auto">
                                  {options.map((option, i: number) => (
                                      <MentionsTypeaheadMenuItem
                                          index={i}
                                          isSelected={selectedIndex === i}
                                          key={option.profileId}
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
