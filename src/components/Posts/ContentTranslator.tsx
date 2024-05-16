import { t } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { memo, useMemo, useState } from 'react';

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
    const [enableTranslate, setEnableTranslate] = useState<boolean>(false);
    const isLogin = useIsLogin();

    const { data: contentLanguage } = useQuery({
        queryKey: ['language-detector', cacheKey],
        enabled: isLogin,
        queryFn: () => getContentLanguage(content),
    })
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['content-translator', cacheKey],
        enabled: enableTranslate,
        queryFn: async () => {
            const browserLanguage = getBrowserLanguage();
            const result = await translate(browserLanguage, content);
            return result;
        },
    })

    const buttonLabel = useMemo(() => {
        const result = data?.translations?.[0]?.text;
        if (result && enableTranslate) {
            const detectedLanguage = data?.detectedLanguage;
            const append = detectedLanguage ? ` from ${getLangNameFromLocal(detectedLanguage)}` : ''
            return t`Translated${append}`;
        }
        return isLoading ? t`Translating...` : t`Translate post`;
    }, [isLoading, data, enableTranslate])
    const translatedContent = useMemo(() => {
        const result = data?.translations?.[0]?.text;
        if (!resultRenderer || !result || !enableTranslate) return null
        return resultRenderer(result);
    }, [data, enableTranslate, resultRenderer])

    const onTranslate = () => {
        if (isLoading || (enableTranslate && data?.translations?.length)) return;
        setEnableTranslate(true);
        // refetch when error occurs
        if (enableTranslate) {
            refetch();
        }
    }

    const isValidContentLang = !!contentLanguage && contentLanguage !== 'N/A';
    const isSameLanguage = isValidContentLang && isSameLanguageWithBrowser(contentLanguage);

    if (!isLogin || !isValidContentLang || isSameLanguage) return null;

    return (
        <>
            <div className='my-1.5'>
                <ClickableButton className="text-sm text-[#8E96FF]" onClick={onTranslate}>
                    {buttonLabel}
                </ClickableButton>
            </div>
            {translatedContent}
        </>
    );
});
