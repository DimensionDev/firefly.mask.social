import { Trans } from '@lingui/macro';
import { first } from 'lodash-es';
import { memo, useState } from 'react';
import { useAsyncFn, useMount } from 'react-use';

import { ClickableButton } from '@/components/ClickableButton.js';
import { PostMarkup } from '@/components/Markup/PostMarkup.js';
import { getTargetLanguage } from '@/helpers/getBrowserLanguage.js';
import { getLangNameFromLocal } from '@/helpers/getLangNameFromLocal.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { getContentLanguage } from '@/services/getContentLanguage.js';
import { Language, translate } from '@/services/translate.js';

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
    const [targetLanguage, setTargetLanguage] = useState<Language | null>(null);
    const isLogin = useIsLogin();

    const [_, handleDetect] = useAsyncFn(async () => {
        const originalLanguage = await getContentLanguage(content);
        setTargetLanguage(getTargetLanguage(originalLanguage));
    }, []);

    const [{ value: data, loading, error }, handleTranslate] = useAsyncFn(async () => {
        const { detectedLanguage, translations } = await translate(targetLanguage!, content);
        return {
            contentLanguage: getLangNameFromLocal(detectedLanguage ?? ''),
            translatedText: first(translations)?.text,
        };
    }, [content, targetLanguage]);

    useMount(() => {
        if (!isLogin) return;
        handleDetect();
    });

    if (!isLogin || !targetLanguage) return null;

    const translatedText = data?.translatedText;
    const contentLanguage = data?.contentLanguage;

    if (collapsed) {
        return (
            <div className="my-1.5">
                <ClickableButton className="text-sm text-link" onClick={() => setCollapsed(false)}>
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
