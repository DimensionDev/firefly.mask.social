const Links = [
    {
        label: process.env.APP_VERSION,
    },
    {
        label: process.env.COMMIT_HASH,
        href: `https://github.com/DimensionDev/mask.social/commit/${process.env.COMMIT_HASH}`,
    },
];

interface GuideLinksProps {}

export function GuideLinks(props: GuideLinksProps) {
    return (
        <nav className=" mt-4 inline-flex">
            {Links.map((link, index) => {
                if (link.href)
                    return (
                        <a className=" text-main" title={link.label} href={link.href} key={index}>
                            {link.label}
                        </a>
                    );
                return <span key={index}>{link.label}</span>;
            })}
        </nav>
    );
}
