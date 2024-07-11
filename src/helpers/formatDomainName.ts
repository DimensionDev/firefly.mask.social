import { isEnsSubdomain, isValidDomain } from '@/helpers/isValidDomain.js';

export function formatDomainName(domain: string, size = 18, invalidIgnore?: boolean) {
    if (!domain) return domain;
    if (!isValidDomain(domain) && !invalidIgnore) {
        return domain;
    }
    if (domain.length <= size) return domain;

    if (isEnsSubdomain(domain)) {
        return domain.replace(/^\[([^\]]+?)]\.(.*)$/, (_, hash, mainName): string => {
            return `[${hash.slice(0, 4)}...${hash.slice(-4)}].${formatDomainName(mainName, size, invalidIgnore)}`;
        });
    }

    return domain.replace(/^(.*)\.(\w+)$/, (_, name, suffix): string => {
        return `${name.slice(0, size - 6)}...${name.slice(-2)}.${suffix}`;
    });
}
