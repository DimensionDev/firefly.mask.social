import flatMap from 'unist-util-flatmap';

export function NFTPlugin() {
    return () => (ast: any) => {
        flatMap(ast, (node: any) => {
            if (node.type !== 'text') return [node];
            if (node.value.startsWith('nft://')) {
                return [
                    {
                        type: 'link',
                        title: node.value,
                        url: node.value,
                    },
                ];
            }
            return [node];
        });

        return ast;
    };
}
