import { t, Trans } from '@lingui/macro';
import { memo, useRef } from 'react';
import { useAsyncFn, useMount } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { PostMarkup } from '@/components/Markup/PostMarkup.js';
import { getBrowserLanguage, isSameLanguageWithBrowser } from '@/helpers/getBrowserLanguage.js';
import { getLangNameFromLocal } from '@/helpers/getLangNameFromLocal.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { getContentLanguage } from '@/services/getContentLanguage.js';
import { translate } from '@/services/translate.js';
import { first } from 'lodash-es';

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
    const contentLanguageRef = useRef<string | null>(null);
    const isLogin = useIsLogin();

    const [{ value: data, loading, error }, handleTranslate] = useAsyncFn(async () => {
        if (!contentLanguageRef.current) {
            // detect content language only once
            contentLanguageRef.current = await getContentLanguage(content);
        }
        const result = await translate(getBrowserLanguage(), content);
        return {
            contentLanguage: getLangNameFromLocal(result.detectedLanguage ?? ''),
            translatedText: first(result?.translations)?.text,
        };
    }, [content]);

    useMount(() => {
        if (!isLogin) return;
        handleTranslate();
    });

    const onTranslate = () => {
        if (loading || translatedText) return;
        handleTranslate();
    };

    const isValidContentLang = !!contentLanguageRef.current && contentLanguageRef.current !== 'N/A';
    const isSameLanguage = isValidContentLang && isSameLanguageWithBrowser(contentLanguageRef.current ?? '');

    if (!isLogin || !isValidContentLang || isSameLanguage) return null;

    const translatedText = data?.translatedText;
    const contentLanguage = data?.contentLanguage;

    return (
        <>
            <div className="my-1.5">
                {translatedText ? (
                    <span className="text-sm text-link">
                        {contentLanguage ? <Trans>Translated from {contentLanguage}</Trans> : <Trans>Translated</Trans>}
                    </span>
                ) : error && !loading ? (
                    <span className="text-sm text-link">
                        <Trans>Failed to translate post. Please retry later.</Trans>
                    </span>
                ) : loading ? (
                    <div className=" flex h-[40px] items-center justify-center">
                        <LoadingIcon className="animate-spin" width={24} height={24} />
                    </div>
                ) : (
                    <ClickableButton className="text-sm text-link" onClick={onTranslate}>
                        <Trans>Translate Post</Trans>
                    </ClickableButton>
                )}
            </div>
            {translatedText ? <PostMarkup post={post} content={translatedText} canShowMore={canShowMore} /> : null}
        </>
    );
});
