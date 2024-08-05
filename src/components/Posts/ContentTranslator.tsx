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
import { getContentLanguage } from '@/services/getContentLanguage.js';
import { Language, translate } from '@/services/translate.js';

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
        const originalLanguage = await getContentLanguage(content);
        setTranslationConfig({
            original: originalLanguage,
            target: getTargetLanguage(originalLanguage),
        });
    }, []);

    const [{ value: data, loading, error }, handleTranslate] = useAsyncFn(async () => {
        const { translations } = await translate(translationConfig.target!, content);
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
            <div className="my-1.5 text-sm text-link">
                <ClickableButton className="text-sm text-lightHighlight" onClick={() => setCollapsed(false)}>
                    <Trans>Translate post</Trans>
                </ClickableButton>
            </div>
        );
    }

    return (
        <>
            <div className="my-1.5 text-sm text-link">
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
