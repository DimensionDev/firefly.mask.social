import { t } from '@lingui/macro';
import { memo, useEffect, useRef } from 'react';
import { useAsyncFn } from 'react-use';

import { ClickableButton } from '@/components/ClickableButton.js';
import { getBrowserLanguage, isSameLanguageWithBrowser } from '@/helpers/getBrowserLanguage.js';
import { getLangNameFromLocal } from '@/helpers/getLangNameFromLocal.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { getContentLanguage } from '@/services/getContentLanguage.js';
import { translate } from '@/services/translate.js';

interface ContentWithTranslatorProps {
    content: string;
    cacheKey?: string;
    resultRenderer?: (result: string) => JSX.Element | string;
}

export const ContentTranslator = memo<ContentWithTranslatorProps>(function ContentTranslator({ content, cacheKey = content, resultRenderer }) {
    const contentLangCache = useRef<string | null>(null);
    const isLogin = useIsLogin();

    const [{ value: data, loading }, handleTranslate] = useAsyncFn(
        async (detectOnly: boolean = false) => {
            try {
                if (!contentLangCache.current) {
                    // detect content language only once
                    contentLangCache.current = await getContentLanguage(content);
                }
                if (detectOnly) return { contentLanguage: contentLangCache.current, translated: null };
                const browserLanguage = getBrowserLanguage();
                const result = await translate(browserLanguage, content);
                return { contentLanguage: contentLangCache.current, translated: result };
            } catch {
                /**
                 * return null if failed to translate, so that the button will be shown again
                 * no need to alert error message here
                */
                return { contentLanguage: null, translated: null };
            }
        },
        [content]
    )

    useEffect(() => {
        if (!isLogin) return;
        handleTranslate(true);
    }, [isLogin])

    const translatedText = data?.translated?.translations?.[0]?.text;

    const buttonLabel = (() => {
        if (translatedText) {
            const detectedLanguage = data?.translated?.detectedLanguage;
            const contentLangName = getLangNameFromLocal(detectedLanguage ?? '');
            return contentLangName ? t`Translated from ${contentLangName}` : t`Translated`;
        }
        return loading ? t`Translating...` : t`Translate post`;
    })();
    const translatedContent = (() => {
        if (!resultRenderer || !translatedText) return null
        return resultRenderer(translatedText);
    })();

    const onTranslate = () => {
        if (loading || translatedText) return;
        handleTranslate();
    }

    const isValidContentLang = !!data?.contentLanguage && data?.contentLanguage !== 'N/A';
    const isSameLanguage = isValidContentLang && isSameLanguageWithBrowser(data?.contentLanguage);

    if (!isLogin || !isValidContentLang || isSameLanguage) return null;

    return (
        <>
            <div className='my-1.5'>
                <ClickableButton className="text-sm text-link" onClick={onTranslate}>
                    {buttonLabel}
                </ClickableButton>
            </div>
            {translatedContent}
        </>
    );
});
