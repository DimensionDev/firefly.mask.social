'use client';

import { Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import type { ReactNode } from 'react';

import PostedIcon from '@/assets/posted.svg';
import { ActivityCellAction } from '@/components/ActivityCell/ActivityCellAction.js';
import { ActivityCellActionTag } from '@/components/ActivityCell/ActivityCellActionTag.js';
import { ArticleType } from '@/providers/types/Article.js';

interface Props {
    type: ArticleType;
}

export function ActivityCellArticleAction({ type }: Props) {
    let action: ReactNode = null;
    switch (type) {
        case ArticleType.Revise:
            action = (
                <Trans>
                    <ActivityCellActionTag icon={<PostedIcon />}>Revised</ActivityCellActionTag>
                    <span>an article</span>
                </Trans>
            );
            break;
        case ArticleType.Post:
            action = (
                <Trans>
                    <ActivityCellActionTag icon={<PostedIcon />}>Post</ActivityCellActionTag>
                    <span>an article</span>
                </Trans>
            );
            break;
        default:
            safeUnreachable(type);
            return null;
    }
    return <ActivityCellAction>{action}</ActivityCellAction>;
}
