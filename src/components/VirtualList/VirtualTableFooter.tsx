import { VirtualListFooter, type VirtualListFooterProps } from '@/components/VirtualList/VirtualListFooter.js';

export function VirtualTableFooter(props: VirtualListFooterProps) {
    return (
        <tfoot>
            <tr>
                <td colSpan={99}>
                    <VirtualListFooter {...props} />
                </td>
            </tr>
        </tfoot>
    );
}
