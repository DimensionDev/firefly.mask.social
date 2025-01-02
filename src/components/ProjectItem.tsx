import { memo } from 'react';

import Rank from '@/assets/project-rank.svg';
import { Image } from '@/components/Image.js';
import { Link } from '@/components/Link.js';
import type { Project } from '@/providers/types/Firefly.js';

export const ProjectItem = memo<{ project: Project }>(function ProjectItem({
    project: { project_name, logo, token_symbol, eval: evalNumber, rank, tags, one_liner, rootdataurl },
}) {
    return (
        <Link
            target="_blank"
            rel="noreferrer noopener"
            className="flex gap-x-2 border-b border-line px-3 py-2 hover:bg-bg"
            href={rootdataurl}
        >
            <Image className="h-11 w-11 shrink-0 rounded-full" width={44} height={44} src={logo} alt={project_name} />
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-x-1 text-lg font-bold leading-6">
                    <div className="text-lightMain">{project_name}</div>
                    <div className="text-secondary">{token_symbol}</div>
                </div>
                <div className="flex items-center gap-x-1">
                    <div className="flex items-center gap-x-1 rounded-lg bg-lightBg p-1">
                        <Rank width={16} height={16} />
                        <span className="text-xs text-highlight">{rank}</span>
                    </div>
                    {tags.map((tag, index) => (
                        <div
                            className="flex items-center gap-x-1 rounded-lg bg-lightBg p-1 text-xs text-secondary"
                            key={index}
                        >
                            #{tag}
                        </div>
                    ))}
                </div>
                <div className="line-clamp-1 text-[15px] leading-[22px]">{one_liner}</div>
            </div>
        </Link>
    );
});
