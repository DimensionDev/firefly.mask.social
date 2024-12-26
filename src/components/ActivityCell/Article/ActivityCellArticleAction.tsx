'use client';

import { Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import type { ReactNode } from 'react';

import PostedIcon from '@/assets/posted.svg';
import RevisedIcon from '@/assets/revised.svg';
import { ActivityCellAction } from '@/components/ActivityCell/ActivityCellAction.js';
import { ActivityCellActionTag } from '@/components/ActivityCell/ActivityCellActionTag.js';
import { ArticlePlatform, ArticleType } from '@/providers/types/Article.js';

interface Props {
    type: ArticleType;
    platform: ArticlePlatform;
}

function ArticlePlatformName({ platform }: { platform: ArticlePlatform }) {
    switch (platform) {
        case ArticlePlatform.Limo:
            return <Trans>Limo</Trans>;
        case ArticlePlatform.Mirror:
            return <Trans>Mirror</Trans>;
        case ArticlePlatform.Paragraph:
            return <Trans>Paragraph</Trans>;
        default:
            safeUnreachable(platform);
            return null;
    }
}

export function ActivityCellArticleAction({ type, platform }: Props) {
    let action: ReactNode = null;
    switch (type) {
        case ArticleType.Revise:
            action = (
                <Trans>
                    <ActivityCellActionTag icon={<RevisedIcon />}>Revised</ActivityCellActionTag>
                    <span>
                        an article on <ArticlePlatformName platform={platform} />
                    </span>
                </Trans>
            );
            break;
        case ArticleType.Post:
            action = (
                <Trans>
                    <ActivityCellActionTag icon={<PostedIcon />}>Posted</ActivityCellActionTag>
                    <span>
                        an article on <ArticlePlatformName platform={platform} />
                    </span>
                </Trans>
            );
            break;
        default:
            safeUnreachable(type);
            return null;
    }
    return <ActivityCellAction>{action}</ActivityCellAction>;
}
