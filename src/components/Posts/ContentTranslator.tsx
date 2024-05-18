import { t } from '@lingui/macro';
import { memo, useRef } from 'react';
import { useAsyncFn, useMount } from 'react-use';

import { ClickableButton } from '@/components/ClickableButton.js';
import { PostMarkup } from '@/components/Markup/PostMarkup.js';
import { getBrowserLanguage, isSameLanguageWithBrowser } from '@/helpers/getBrowserLanguage.js';
import { getLangNameFromLocal } from '@/helpers/getLangNameFromLocal.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { getContentLanguage } from '@/services/getContentLanguage.js';
import { translate } from '@/services/translate.js';

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
    const contentLangCache = useRef<string | null>(null);
    const isLogin = useIsLogin();

    const [{ value: data, loading, error }, handleTranslate] = useAsyncFn(
        async (detectOnly: boolean = false) => {
            if (!contentLangCache.current) {
                // detect content language only once
                contentLangCache.current = await getContentLanguage(content);
            }
            if (detectOnly) return { contentLanguage: contentLangCache.current, translated: null };
            const browserLanguage = getBrowserLanguage();
            const result = await translate(browserLanguage, content);
            return { contentLanguage: contentLangCache.current, translated: result };
        },
        [content],
    );

    useMount(() => {
        if (!isLogin) return;
        handleTranslate(true);
    });

    const translatedText = data?.translated?.translations?.[0]?.text;

    const buttonLabel = (() => {
        if (translatedText) {
            const detectedLanguage = data?.translated?.detectedLanguage;
            const contentLangName = getLangNameFromLocal(detectedLanguage ?? '');
            return contentLangName ? t`Translated from ${contentLangName}` : t`Translated`;
        }
        if (error && !loading) return t`Failed to translate`;
        return loading ? t`Translating...` : t`Translate post`;
    })();

    const onTranslate = () => {
        if (loading || translatedText) return;
        handleTranslate();
    };

    const isValidContentLang = !!contentLangCache.current && contentLangCache.current !== 'N/A';
    const isSameLanguage = isValidContentLang && isSameLanguageWithBrowser(contentLangCache.current ?? '');

    if (!isLogin || !isValidContentLang || isSameLanguage) return null;

    return (
        <>
            <div className="my-1.5">
                <ClickableButton className="text-sm text-link" onClick={onTranslate}>
                    {buttonLabel}
                </ClickableButton>
            </div>
            {translatedText ? <PostMarkup post={post} content={translatedText} canShowMore={canShowMore} /> : null}
        </>
    );
});
