import '@/assets/css/limo.css';
import '@/assets/css/paragraph.css';

import { notFound } from 'next/navigation.js';

import { ArticleDetailContent } from '@/components/Article/ArticleDetailContent.js';
import { FireflyArticleProvider } from '@/providers/firefly/Article.js';
import { getArticleCover } from '@/services/getArticleCover.js';

interface PageProps {
    id: string;
}

export async function ArticleDetailPage({ id: articleId }: PageProps) {
    if (!articleId) notFound();

    const article = await FireflyArticleProvider.getArticleById(articleId);
    if (!article) notFound();

    const cover = await getArticleCover(article);
    return <ArticleDetailContent article={article} cover={cover} />;
}
