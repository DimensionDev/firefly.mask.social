'use client';

import { Trans } from '@lingui/macro';

import PostedIcon from '@/assets/posted.svg';
import { ActivityCellAction } from '@/components/ActivityCell/ActivityCellAction.js';
import { ActivityCellActionTag } from '@/components/ActivityCell/ActivityCellActionTag.js';
import { ArticleType } from '@/providers/types/Article.js';

interface Props {
    type: ArticleType;
}

export function ActivityCellArticleAction({ type }: Props) {
    const name = type === ArticleType.Revise ? <Trans>Revised</Trans> : <Trans>Posted</Trans>;
    return (
        <ActivityCellAction>
            <Trans>
                <ActivityCellActionTag icon={<PostedIcon />}>{name}</ActivityCellActionTag>
                <span>an article</span>
            </Trans>
        </ActivityCellAction>
    );
}
