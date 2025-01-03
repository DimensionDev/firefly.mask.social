import { Trans } from '@lingui/macro';
import { first } from 'lodash-es';
import { memo, useState } from 'react';
import { useAsyncFn, useMount } from 'react-use';

import { ClickableButton } from '@/components/ClickableButton.js';
import { PostMarkup } from '@/components/Markup/PostMarkup.js';
import { NUMBER_STRING_REGEX } from '@/constants/regexp.js';
import { getTargetLanguage } from '@/helpers/getBrowserLanguage.js';
import { getLangNameFromLocal } from '@/helpers/getLangNameFromLocal.js';
import { trimify } from '@/helpers/trimify.js';
import { useIsLoginFirefly } from '@/hooks/useIsLogin.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { detectLanguage, Language, translateLanguage } from '@/services/translate.js';

function isValidContentToTranslate(content: string) {
    NUMBER_STRING_REGEX.lastIndex = 0;
    if (!trimify(content) || NUMBER_STRING_REGEX.test(content)) return false;
    return true;
}

interface ContentWithTranslatorProps {
    content: string;
    post: Post;
    canShowMore: boolean;
}

export const ContentTranslator = memo<ContentWithTranslatorProps>(function ContentTranslator({
    content,
    post,
    canShowMore,
}) {
    const [collapsed, setCollapsed] = useState(false);
    const [translationConfig, setTranslationConfig] = useState<Record<'original' | 'target', Language | null>>({
        original: null,
        target: null,
    });
    const isLoginFirefly = useIsLoginFirefly();

    const [_, handleDetect] = useAsyncFn(async () => {
        const originalLanguage = await detectLanguage(content);
        setTranslationConfig({
            original: originalLanguage,
            target: getTargetLanguage(originalLanguage),
        });
    }, [content]);

    const [{ value: data, loading, error }, handleTranslate] = useAsyncFn(async () => {
        const { translations } = await translateLanguage(translationConfig.target!, content);
        return {
            contentLanguage: getLangNameFromLocal(translationConfig.original!),
            translatedText: first(translations)?.text,
        };
    }, [content, translationConfig]);

    useMount(() => {
        if (!isLoginFirefly || !isValidContentToTranslate(content)) return;
        handleDetect();
    });

    if (!isLoginFirefly || !translationConfig.target) return null;

    const translatedText = data?.translatedText;
    const contentLanguage = data?.contentLanguage;

    if (collapsed) {
        return (
            <div className="my-1.5 text-sm">
                <ClickableButton className="text-highlight" onClick={() => setCollapsed(false)}>
                    <Trans>Translate post</Trans>
                </ClickableButton>
            </div>
        );
    }

    return (
        <>
            <div className="my-1.5 text-sm text-highlight">
                {translatedText ? (
                    <ClickableButton onClick={() => setCollapsed(true)}>
                        {contentLanguage ? <Trans>Translated from {contentLanguage}</Trans> : <Trans>Translated</Trans>}
                    </ClickableButton>
                ) : loading ? (
                    <span>
                        <Trans>Translating...</Trans>
                    </span>
                ) : (
                    <ClickableButton onClick={handleTranslate}>
                        {error ? (
                            <Trans>Failed to translate post. Please retry later.</Trans>
                        ) : (
                            <Trans>Translate post</Trans>
                        )}
                    </ClickableButton>
                )}
            </div>
            {translatedText ? <PostMarkup post={post} content={translatedText} canShowMore={canShowMore} /> : null}
        </>
    );
});
